export interface Principal {userId:string;administrator:boolean;artistId?:string;venueId?:string}
const encoder=new TextEncoder();
export async function digest(bytes:Uint8Array){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes as Uint8Array<ArrayBuffer>))].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function key(secret:string){return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
export async function signCapability(secret:string,principal:Principal,method:string,path:string,bytes:Uint8Array){
 const value=JSON.stringify({principal,method,path,digest:await digest(bytes),expires:Date.now()+30000});
 const signature=await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(value));
 return {value:btoa(value),signature:[...new Uint8Array(signature)].map(x=>x.toString(16).padStart(2,'0')).join('')};
}
export async function verifyCapability(request:Request,secret:string):Promise<Principal|null>{
 try{
  if(!secret)return null;
  const value=atob(request.headers.get('x-aaj-capability')||''),signature=request.headers.get('x-aaj-signature')||'';
  if(!/^[0-9a-f]{64}$/.test(signature))return null;
  const bytes=Uint8Array.from(signature.match(/../g)!,x=>parseInt(x,16));
  if(!await crypto.subtle.verify('HMAC',await key(secret),bytes,encoder.encode(value)))return null;
  const claim=JSON.parse(value),path=new URL(request.url).pathname;
  if(claim.expires<Date.now()||claim.expires>Date.now()+35000||claim.method!==request.method||claim.path!==path)return null;
  const reader=request.clone().body?.getReader(),chunks:Uint8Array[]=[];let size=0;
  if(reader)while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>10*1024*1024){await reader.cancel();return null}chunks.push(value)}
  const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length}
  if(claim.digest!==await digest(body))return null;
  const principal=claim.principal;
  return principal&&typeof principal.userId==='string'&&typeof principal.administrator==='boolean'?principal:null;
 }catch{return null}
}
export function canWrite(principal:Principal,collection:string,id:string,payload:Record<string,unknown>|null,existing:Record<string,unknown>|null,ownedImages:Set<string>=new Set()){
 if(principal.administrator)return true;
 if(collection==='artists'){
  if(!principal.artistId||id!==principal.artistId||payload&&payload.id!==id)return false;
  const oldWorks=Array.isArray(existing?.works)?existing.works as Record<string,unknown>[]:[];
  const newWorks=Array.isArray(payload?.works)?payload.works as Record<string,unknown>[]:[];
  // An artist page holds at most 40 pieces (a page already over can still shrink).
  if(newWorks.length>40&&newWorks.length>oldWorks.length)return false;
  return newWorks.every(work=>(!work.imageKey||ownedImages.has(String(work.imageKey)))&&(!work.sampleImage||oldWorks.some(old=>old.sampleImage===work.sampleImage)||typeof work.sampleImage==='string'&&/^\/images\/community-pilot\/[a-zA-Z0-9_./-]+$/.test(work.sampleImage)&&!work.sampleImage.includes('..')));

 }
 // A venue owner cannot self-approve or alter approved/publication fields.
 // Venue intake and membership approval require dedicated validated operations.
 if(collection==='venues'){
  if(!principal.venueId||id!==principal.venueId||!existing||!payload||existing.status!=='approved'||payload.id!==id)return false;
  const editable=new Set(['name','type','city','address','postalCode','description','website','phone','hours','accessibility','instructions','contactName','email','opportunities','available']);
  for(const field of new Set([...Object.keys(existing),...Object.keys(payload)])){
   if(!editable.has(field)&&JSON.stringify(existing[field])!==JSON.stringify(payload[field]))return false;
   if(editable.has(field)&&field!=='available'&&(typeof payload[field]!=='string'||(payload[field] as string).length>5000))return false;
  }
  return typeof payload.available==='boolean'&&['name','city','address','contactName','email'].every(field=>typeof payload[field]==='string'&&!!(payload[field] as string).trim())&&/^\S+@\S+\.\S+$/.test(payload.email as string)&&(!payload.website||/^https?:\/\//i.test(payload.website as string));
 }
 if(collection==='applications')return false;
 if(collection==='showings')return !!principal.artistId&&(!existing||existing.artistId===principal.artistId)&&(!payload||payload.artistId===principal.artistId)&&!!(existing||payload);
 return false;
}
export function canRead(principal:Principal,collection:string,id:string,payload:Record<string,unknown>|null){
 if(principal.administrator)return true;
 if(collection==='applications')return !!principal.artistId&&id===principal.artistId;
 if(collection==='artists')return !!principal.artistId&&id===principal.artistId;
 if(collection==='showings')return !!principal.artistId&&payload?.artistId===principal.artistId;
 if(collection==='venues')return !!principal.venueId&&id===principal.venueId;
 return false;
}
