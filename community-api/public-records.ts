type Payload=Record<string,any>;
export interface PublicRecord {collection:string;id:string;payload:Payload|null;revision:number}
// Ongoing showings (studios, long-term walls) need an artist check-in every 60 days;
// two weeks after a missed one they leave public listings until confirmed again.
const LAPSE_DAYS=74;
const lapsed=(s:Payload,now:number)=>s.ongoing===true&&(now-Date.parse(String(s.confirmedAt||s.start||'').slice(0,10)))/86400000>=LAPSE_DAYS;
export function publicRecords(rows:PublicRecord[],now=Date.now()):PublicRecord[]{
 const approved=new Set(rows.filter(r=>r.collection==='applications'&&r.payload?.status==='approved'&&r.payload.invitationAccepted).map(r=>r.id));
 const published=rows.filter(r=>r.collection==='artists'&&r.payload?.published&&approved.has(r.id));
 const artists=new Map(published.map(r=>[r.id,r.payload!]));
 const venues=new Map(rows.filter(r=>r.collection==='venues'&&r.payload).map(r=>[r.id,r.payload!]));
 const output:PublicRecord[]=[];
 const emit=(collection:string,id:string,payload:Payload)=>output.push({collection,id,payload,revision:0});
 for(const [id,a] of artists){
  emit('applications',id,{id,name:a.name,status:'approved',invitationAccepted:true});
  emit('artists',id,{id,name:a.name,regionId:a.regionId||'region-rogue-valley',city:a.city,practice:a.practice,bio:a.bio,published:true,publicForm:a.publicForm===true,publicWebsite:!!a.publicWebsite,website:a.publicWebsite?a.website:'',publicEmail:!!a.publicEmail,email:a.publicEmail?a.email:'',publicPhone:!!a.publicPhone,phone:a.publicPhone?a.phone:'',works:(Array.isArray(a.works)?a.works:[]).filter((w:Payload)=>w.public===true).map((w:Payload)=>({id:w.id,title:w.title,medium:w.medium,year:w.year,sale:w.sale,price:w.sale==='public-price'?w.price:'',public:true,imageKey:w.imageKey,sampleImage:w.sampleImage}))});
 }
 for(const [id,v] of venues)if(v.status==='approved'&&v.visible)emit('venues',id,{id,name:v.name,type:v.type,regionId:v.regionId||'region-rogue-valley',city:v.city,address:v.address,postalCode:v.postalCode,description:v.description,website:v.website,phone:v.phone,hours:v.hours,accessibility:v.accessibility,instructions:v.instructions,opportunities:v.opportunities,status:'approved',visible:true,available:!!v.available});
 const alan=rows.find(r=>r.collection==='alan-workspace'&&r.payload);
 // Decision (Alan, 2026-09-21): the artist vouches for the place. A published showing
 // stays public even when its venue is pending, declined, or artist-entered; only a
 // venue an admin has explicitly hidden removes it.
 for(const r of rows){const s=r.payload;if(r.collection!=='showings'||!s||s.status!=='published'||lapsed(s,now))continue;
  const a=artists.get(s.artistId),v=venues.get(s.venueId);
  const alanArtist=s.artistId==='artist-alan-just'&&alan?.payload?.pageVisible!==false;
  if((!a&&!alanArtist)||v&&!v.visible)continue;
  const hiddenOriginals=new Set((Array.isArray(alan?.payload?.artwork)?alan!.payload!.artwork:[]).filter((w:Payload)=>w.visibility==='private').map((w:Payload)=>w.id));
  const works=a?(Array.isArray(a.works)?a.works:[]).filter((w:Payload)=>w.public===true).map((w:Payload)=>w.id):[...(Array.isArray(alan?.payload?.uploadedWorks)?alan!.payload!.uploadedWorks:[]).filter((w:Payload)=>w.visibility==='public').map((w:Payload)=>w.id),...(Array.isArray(s.artworkIds)?s.artworkIds:[]).filter((id:string)=>!hiddenOriginals.has(id))];
  if(!works.includes(s.featuredArtworkId))continue;
  emit('showings',r.id,{id:r.id,artistId:s.artistId,venueId:s.venueId,venue:s.venue,address:s.address,city:s.city,website:s.website,regionId:typeof s.regionId==='string'?s.regionId:'region-rogue-valley',start:s.start,end:s.ongoing===true?'':s.end,ongoing:s.ongoing===true,confirmedAt:s.ongoing===true?String(s.confirmedAt||s.start):undefined,status:'published',featuredArtworkId:s.featuredArtworkId,artworkIds:(Array.isArray(s.artworkIds)?s.artworkIds:[]).filter((id:string)=>works.includes(id))});
 }
 // Project only explicitly visible uploads; keep profile contacts and private prices hidden.
 if(alan)emit('alan-workspace','alan-just',{pageVisible:alan.payload!.pageVisible!==false,hiddenArtworkIds:(Array.isArray(alan.payload!.artwork)?alan.payload!.artwork:[]).filter((w:Payload)=>w.visibility==='private'&&typeof w.id==='string').map((w:Payload)=>w.id),uploadedWorks:alan.payload!.pageVisible===false?[]:(Array.isArray(alan.payload!.uploadedWorks)?alan.payload!.uploadedWorks:[]).filter((w:Payload)=>w.visibility==='public').map((w:Payload)=>({id:w.id,title:w.title,medium:w.medium,year:w.year,visibility:'public',sale:w.sale,price:w.sale==='public-price'?w.price:'',imageKey:w.imageKey,sampleImage:w.sampleImage}))});
 return output;
}
export function publicImageKeys(rows:PublicRecord[]){return new Set(publicRecords(rows).filter(r=>r.collection==='artists'||r.collection==='alan-workspace').flatMap(r=>(r.payload!.works||r.payload!.uploadedWorks||[]).map((w:Payload)=>w.imageKey)).filter(Boolean))}
