/// <reference path="./worker-configuration.d.ts" />
import {publicRecords,publicImageKeys,type PublicRecord} from './public-records';
import {verifyCapability,canWrite,canRead} from './security';
const collections = new Set(['applications','artists','venues','showings','alan-workspace','featured']);
const validId = (id:unknown):id is string => typeof id==='string' && /^[a-zA-Z0-9_-]{1,160}$/.test(id);
const local = (host:string) => host==='localhost'||host==='127.0.0.1'||host==='[::1]';
const json = (value:unknown,status=200) => Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
async function boundedBody(request:Request,max:number):Promise<Uint8Array>{
  if(Number(request.headers.get('content-length'))>max)throw new Error('Too large');
  const reader=request.body?.getReader();if(!reader)return new Uint8Array();
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new Error('Too large')}chunks.push(value)}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return bytes;
}
function imageType(bytes:Uint8Array){
  if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
  if([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';
  const text=new TextDecoder();if(text.decode(bytes.slice(0,4))==='RIFF'&&text.decode(bytes.slice(8,12))==='WEBP')return 'image/webp';
  return null;
}
export default {
  async fetch(request:Request,env:Env):Promise<Response>{
    const url=new URL(request.url);
    // Keep the local deployment guard until the online environment is reviewed. This API is inaccessible
    // on public hostnames, even if someone accidentally deploys the Worker.
    if(!local(url.hostname))return json({error:'Local prototype only. Add authentication before deployment.'},403);
    const origin=request.headers.get('origin');if(origin&&!local(new URL(origin).hostname))return json({error:'Origin rejected'},403);
    if(request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Cross-site request rejected'},403);
    if(request.method!=='GET'&&request.headers.get('x-aaj-prototype')!=='local')return json({error:'Prototype request header required'},403);
    const loadRecords=async()=>{const {results}=await env.DB.prepare('SELECT collection,id,payload,revision FROM community_records').all<{collection:string;id:string;payload:string|null;revision:number}>();return results.map(row=>({...row,payload:row.payload===null?null:JSON.parse(row.payload)})) as PublicRecord[]};
    if(request.method==='GET'&&url.pathname==='/api/community/public/state')return json({records:publicRecords(await loadRecords())});
    const publicImage=/^\/api\/community\/public\/images\/([a-zA-Z0-9_-]{1,160})$/.exec(url.pathname);
    if(request.method==='GET'&&publicImage){
      if(!publicImageKeys(await loadRecords()).has(publicImage[1]))return json({error:'Image unavailable'},404);
      const image=await env.ARTWORK.get(publicImage[1]);if(!image)return json({error:'Image unavailable'},404);
      const headers=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});image.writeHttpMetadata(headers);return new Response(image.body,{headers});
    }
    const verified=await verifyCapability(request,env.COMMUNITY_GATEWAY_SECRET);
    const membership=verified?await env.DB.prepare('SELECT artist_id,venue_id,administrator FROM community_memberships WHERE user_id=?1').bind(verified.userId).first<{artist_id:string|null;venue_id:string|null;administrator:number}>():null;
    const principal=verified&&membership?{userId:verified.userId,administrator:membership.administrator===1,artistId:membership.artist_id||undefined,venueId:membership.venue_id||undefined}:null;
    if(!principal)return json({error:'Verified server request required.'},401);
    if(url.pathname==='/api/community/access'&&request.method==='GET')return json(principal);
    try{
      if(url.pathname==='/api/community/memberships'){
        if(!principal.administrator)return json({error:'Administrator access required.'},403);
        if(request.method==='GET'){
          const {results}=await env.DB.prepare('SELECT user_id,artist_id,venue_id,administrator FROM community_memberships ORDER BY user_id').all();
          return json({memberships:results});
        }
        if(request.method==='PUT'){
          const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,8192)));
          if(typeof body.userId!=='string'||!/^user_[a-zA-Z0-9]+$/.test(body.userId)||typeof body.administrator!=='boolean'||!['artistId','venueId'].every(field=>body[field]===null||validId(body[field])))return json({error:'Invalid account assignment.'},400);
          if(body.userId===principal.userId&&!body.administrator)return json({error:'You cannot remove your own administrator access.'},403);
          if(body.artistId&&body.artistId!=='artist-alan-just'){
            const artist=await env.DB.prepare("SELECT payload FROM community_records WHERE collection='applications' AND id=?1").bind(body.artistId).first<{payload:string|null}>();
            const application=artist?.payload?JSON.parse(artist.payload):null;
            if(application?.status!=='approved'||!application.invitationAccepted)return json({error:'Choose an approved artist who accepted their invitation.'},400);
          }
          if(body.venueId){
            const venue=await env.DB.prepare("SELECT payload FROM community_records WHERE collection='venues' AND id=?1").bind(body.venueId).first<{payload:string|null}>();
            if(!venue?.payload||JSON.parse(venue.payload).status!=='approved')return json({error:'Choose an approved venue.'},400);
          }
          try{await env.DB.prepare('INSERT INTO community_memberships(user_id,artist_id,venue_id,administrator) VALUES(?1,?2,?3,?4) ON CONFLICT(user_id) DO UPDATE SET artist_id=excluded.artist_id,venue_id=excluded.venue_id,administrator=excluded.administrator').bind(body.userId,body.artistId,body.venueId,body.administrator?1:0).run()}
          catch{return json({error:'That artist or venue is already assigned to another account.'},409)}
          return json({saved:true});
        }
      }
      if(url.pathname==='/api/community/state'&&request.method==='GET'){
        const {results}=await env.DB.prepare('SELECT collection,id,payload,revision FROM community_records').all<{collection:string;id:string;payload:string|null;revision:number}>();
        return json({userId:principal.userId,administrator:principal.administrator,records:results.map(row=>({...row,payload:row.payload===null?null:JSON.parse(row.payload)})).filter(row=>canRead(principal,row.collection,row.id,row.payload))});
      }
      if(url.pathname==='/api/community/record'&&request.method==='PUT'){
        const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,1024*1024))) as {collection:string;id:string;payload:unknown;revision:number};
        if(!collections.has(body.collection)||!validId(body.id)||!Number.isInteger(body.revision)||body.revision<0||body.payload===undefined)return json({error:'Invalid record'},400);
        if(body.payload!==null&&(typeof body.payload!=='object'||Array.isArray(body.payload)))return json({error:'Payload must be an object'},400);
        const previous=await env.DB.prepare('SELECT payload FROM community_records WHERE collection=?1 AND id=?2').bind(body.collection,body.id).first<{payload:string|null}>();
        const existing=previous?.payload?JSON.parse(previous.payload):null;
        const {results:ownedImages}=await env.DB.prepare('SELECT image_id FROM artwork_owners WHERE artist_id=?1').bind(principal.artistId||'').all<{image_id:string}>();
        if(!canWrite(principal,body.collection,body.id,body.payload as Record<string,unknown>|null,existing,new Set(ownedImages.map(image=>image.image_id))))return json({error:'Record ownership rejected.'},403);
        const payload=body.payload===null?null:JSON.stringify(body.payload);
        const result=await env.DB.prepare(`INSERT INTO community_records(collection,id,payload,revision) SELECT ?1,?2,?3,1 WHERE ?4=0
          ON CONFLICT(collection,id) DO UPDATE SET payload=?3,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE revision=?4 RETURNING revision`).bind(body.collection,body.id,payload,body.revision).first<{revision:number}>();
        // Existing records need an UPDATE when the insert SELECT has no row.
        const updated=result|| (body.revision>0?await env.DB.prepare("UPDATE community_records SET payload=?1,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE collection=?2 AND id=?3 AND revision=?4 RETURNING revision").bind(payload,body.collection,body.id,body.revision).first<{revision:number}>():null);
        return updated?json(updated):json({error:'This record changed in another browser. Reload before editing.'},409);
      }
      const imageMatch=/^\/api\/community\/images\/([a-zA-Z0-9_-]{1,160})$/.exec(url.pathname);
      if(imageMatch){const key=imageMatch[1];
        const owner=await env.DB.prepare('SELECT artist_id FROM artwork_owners WHERE image_id=?1').bind(key).first<{artist_id:string}>();
        if(!principal.administrator&&(!principal.artistId||(owner&&owner.artist_id!==principal.artistId)||request.method==='GET'&&!owner))return json({error:'Image ownership rejected.'},403);
        if(request.method==='GET'){const object=await env.ARTWORK.get(key);if(!object)return json({error:'Image unavailable'},404);const headers=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});object.writeHttpMetadata(headers);return new Response(object.body,{headers})}
        if(request.method==='PUT'){
          const bytes=await boundedBody(request,10*1024*1024),type=imageType(bytes);if(!type)return json({error:'Use JPEG, PNG, or WebP artwork'},400);
          if(await env.ARTWORK.head(key)){if(!principal.administrator&&!owner)return json({error:'Image ownership unavailable.'},403);return json({id:key})}
          if(principal.artistId)await env.DB.prepare('INSERT OR IGNORE INTO artwork_owners(image_id,artist_id) VALUES(?1,?2)').bind(key,principal.artistId).run();
          const assignedOwner=await env.DB.prepare('SELECT artist_id FROM artwork_owners WHERE image_id=?1').bind(key).first<{artist_id:string}>();
          if(!principal.administrator&&assignedOwner?.artist_id!==principal.artistId)return json({error:'Image ownership rejected.'},403);
          await env.ARTWORK.put(key,bytes,{httpMetadata:{contentType:type}});
          await env.DB.prepare('INSERT OR IGNORE INTO artwork_images(id,content_type,size) VALUES(?1,?2,?3)').bind(key,type,bytes.length).run();
          return json({id:key});
        }
      }
      return json({error:'Not found'},404);
    }catch(error){console.error(JSON.stringify({event:'community-api-error',message:error instanceof Error?error.message:'Unknown error'}));return json({error:'Unable to complete the shared storage request.'},400)}
  }
} satisfies ExportedHandler<Env>;
