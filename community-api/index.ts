/// <reference path="./worker-configuration.d.ts" />
import {publicRecords,publicImageKeys,type PublicRecord} from './public-records';
import {verifyCapability,canWrite,canRead} from './security';
const collections = new Set(['applications','artists','venues','showings','alan-workspace','featured']);
const validId = (id:unknown):id is string => typeof id==='string' && /^[a-zA-Z0-9_-]{1,160}$/.test(id);
const local = (host:string) => host==='localhost'||host==='127.0.0.1'||host==='[::1]';
const json = (value:unknown,status=200) => Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const shortText=(value:unknown,max=200)=>typeof value==='string'&&!!value.trim()&&value.trim().length<=max;
const stateCode=(value:unknown)=>typeof value==='string'&&/^[A-Z]{2}$/.test(value);
const regionSlug=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'region';
const safeOptionalUrl=(value:unknown)=>{if(value===undefined||value===null||value==='')return true;if(typeof value!=='string'||value.length>500)return false;try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password}catch{return false}};
type NotificationEnv=Env&{ADMIN_EMAIL?:{send(message:{to:string;from:{email:string;name:string};subject:string;text:string;html:string}):Promise<unknown>};ADMIN_NOTIFICATION_TO?:string;ADMIN_NOTIFICATION_FROM?:string;ADMIN_BASE_URL?:string};
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));
async function queueAdminNotification(env:NotificationEnv,ctx:ExecutionContext,kind:'artist'|'venue'|'region',subjectId:string,title:string){
 const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO admin_notifications(id,kind,subject_id,title,delivery_status) VALUES(?1,?2,?3,?4,'pending')").bind(id,kind,subjectId,title).run();
 if(!env.ADMIN_EMAIL||!env.ADMIN_NOTIFICATION_TO||!env.ADMIN_NOTIFICATION_FROM){await env.DB.prepare("UPDATE admin_notifications SET delivery_status='not_configured' WHERE id=?1").bind(id).run();return}
 const url=`${env.ADMIN_BASE_URL||'https://aaj-dev.alanjust.com'}/prototype/admin/inbox/`,safeTitle=escapeHtml(title),label=kind[0].toUpperCase()+kind.slice(1);
 ctx.waitUntil((async()=>{try{await env.ADMIN_EMAIL!.send({to:env.ADMIN_NOTIFICATION_TO!,from:{email:env.ADMIN_NOTIFICATION_FROM!,name:'Artists Are Jerks'},subject:`New ${kind} application: ${title}`,text:`A new ${kind} application is ready for review: ${title}\n\nReview it: ${url}`,html:`<p>A new ${label.toLowerCase()} application is ready for review: <strong>${safeTitle}</strong></p><p><a href="${url}">Open the administrator inbox</a></p>`});await env.DB.prepare("UPDATE admin_notifications SET delivery_status='sent',delivered_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?1").bind(id).run()}catch(error){await env.DB.prepare("UPDATE admin_notifications SET delivery_status='failed',error=?1 WHERE id=?2").bind(String(error).slice(0,500),id).run()}})());
}
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
  async fetch(request:Request,env:Env,ctx:ExecutionContext):Promise<Response>{
    const url=new URL(request.url);
    // Keep the local deployment guard until the online environment is reviewed. This API is inaccessible
    // on public hostnames, even if someone accidentally deploys the Worker.
    if(!local(url.hostname))return json({error:'Local prototype only. Add authentication before deployment.'},403);
    const origin=request.headers.get('origin');if(origin&&!local(new URL(origin).hostname))return json({error:'Origin rejected'},403);
    if(request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Cross-site request rejected'},403);
    if(request.method!=='GET'&&request.headers.get('x-aaj-prototype')!=='local')return json({error:'Prototype request header required'},403);
    const loadRecords=async()=>{const {results}=await env.DB.prepare('SELECT collection,id,payload,revision FROM community_records').all<{collection:string;id:string;payload:string|null;revision:number}>();return results.map(row=>({...row,payload:row.payload===null?null:JSON.parse(row.payload)})) as PublicRecord[]};
    if(request.method==='GET'&&url.pathname==='/api/community/public/state')return json({records:publicRecords(await loadRecords())});
    if(request.method==='GET'&&url.pathname==='/api/community/public/regions'){
      const {results}=await env.DB.prepare("SELECT id,name,slug,core_city,state_code,country_code,coverage FROM community_regions WHERE status='active' ORDER BY name").all();
      return json({regions:results});
    }
    const publicImage=/^\/api\/community\/public\/images\/([a-zA-Z0-9_-]{1,160})$/.exec(url.pathname);
    if(request.method==='GET'&&publicImage){
      if(!publicImageKeys(await loadRecords()).has(publicImage[1]))return json({error:'Image unavailable'},404);
      const image=await env.ARTWORK.get(publicImage[1]);if(!image)return json({error:'Image unavailable'},404);
      const headers=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});image.writeHttpMetadata(headers);return new Response(image.body,{headers});
    }
    const verified=await verifyCapability(request,env.COMMUNITY_GATEWAY_SECRET);
    const membership=verified?await env.DB.prepare('SELECT artist_id,venue_id,administrator FROM community_memberships WHERE user_id=?1').bind(verified.userId).first<{artist_id:string|null;venue_id:string|null;administrator:number}>():null;
    const principal=verified&&membership?{userId:verified.userId,administrator:membership.administrator===1,artistId:membership.artist_id||undefined,venueId:membership.venue_id||undefined}:null;
    if(verified&&url.pathname==='/api/community/applications'){
     try{
      const administrator=membership?.administrator===1;
      if(request.method==='GET'){
       const ownerFilter=administrator?'':" AND json_extract(payload,'$.submittedBy')=?1";
       const statement=env.DB.prepare("SELECT r.collection,r.id,r.payload,r.revision,r.updated_at,m.artist_id,m.venue_id FROM community_records r LEFT JOIN community_memberships m ON m.user_id=json_extract(r.payload,'$.submittedBy') WHERE r.payload IS NOT NULL AND r.collection IN ('applications','venues') AND json_extract(r.payload,'$.submittedBy') IS NOT NULL"+ownerFilter+" ORDER BY r.updated_at DESC");
       const {results}=await (administrator?statement:statement.bind(verified.userId)).all<{collection:string;id:string;payload:string;revision:number;updated_at:string;artist_id:string|null;venue_id:string|null}>();
       const applications=results.map(row=>({kind:row.collection==='venues'?'venue':'artist',id:row.id,userId:JSON.parse(row.payload).submittedBy,payload:JSON.parse(row.payload),revision:row.revision,updatedAt:row.updated_at,assignedArtistId:row.artist_id,assignedVenueId:row.venue_id}));
       const notifications=administrator?(await env.DB.prepare('SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 100').all()).results:[];
       const notificationEnv=env as NotificationEnv;
       return json({applications,notifications,emailConfigured:!!(notificationEnv.ADMIN_EMAIL&&notificationEnv.ADMIN_NOTIFICATION_TO&&notificationEnv.ADMIN_NOTIFICATION_FROM)});
      }
      if(request.method==='PUT'){
       const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,32768))) as Record<string,unknown>;
       if(body.action==='review'){
        if(!administrator)return json({error:'Administrator access required.'},403);
        if(!validId(body.id)||!['artist','venue'].includes(String(body.kind))||!['approved','declined'].includes(String(body.status)))return json({error:'Invalid application review.'},400);
        const collection=body.kind==='venue'?'venues':'applications';
        const row=await env.DB.prepare('SELECT payload,revision FROM community_records WHERE collection=?1 AND id=?2 AND payload IS NOT NULL').bind(collection,body.id).first<{payload:string;revision:number}>();
        if(!row)return json({error:'Application not found.'},404);const payload=JSON.parse(row.payload);
        if(!payload.submittedBy)return json({error:'This record is not an intake application.'},400);
        payload.status=body.status;if(collection==='venues')payload.visible=body.status==='approved';
        // Artists: approval no longer waits for an acceptance step, and a decline
        // closes the private workspace the applicant opened when they applied.
        if(collection==='applications')payload.invitationAccepted=body.status==='approved';
        const update=env.DB.prepare("UPDATE community_records SET payload=?1,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE collection=?2 AND id=?3").bind(JSON.stringify(payload),collection,body.id);
        const workspace=collection!=='applications'?[]:body.status==='approved'
          ?[env.DB.prepare('INSERT INTO community_memberships(user_id,artist_id,administrator) VALUES(?1,?2,0) ON CONFLICT(user_id) DO UPDATE SET artist_id=excluded.artist_id WHERE community_memberships.artist_id IS NULL').bind(payload.submittedBy,body.id)]
          :[env.DB.prepare('UPDATE community_memberships SET artist_id=NULL WHERE artist_id=?1').bind(body.id)];
        try{await env.DB.batch([update,...workspace])}catch{await update.run()}
        return json({saved:true});
       }
       if(body.action==='accept'){
        if(!validId(body.id))return json({error:'Invalid invitation.'},400);
        const row=await env.DB.prepare("SELECT payload FROM community_records WHERE collection='applications' AND id=?1 AND payload IS NOT NULL").bind(body.id).first<{payload:string}>();if(!row)return json({error:'Invitation not found.'},404);const payload=JSON.parse(row.payload);
        if(payload.submittedBy!==verified.userId||payload.status!=='approved')return json({error:'This invitation is not available to this account.'},403);
        const existing=await env.DB.prepare('SELECT artist_id FROM community_memberships WHERE user_id=?1').bind(verified.userId).first<{artist_id:string|null}>();
        if(existing?.artist_id&&existing.artist_id!==body.id)return json({error:'This account already has a different artist workspace.'},409);
        payload.invitationAccepted=true;
        try{
         await env.DB.batch([
          env.DB.prepare("UPDATE community_records SET payload=?1,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE collection='applications' AND id=?2").bind(JSON.stringify(payload),body.id),
          env.DB.prepare('INSERT INTO community_memberships(user_id,artist_id,administrator) VALUES(?1,?2,0) ON CONFLICT(user_id) DO UPDATE SET artist_id=excluded.artist_id WHERE community_memberships.artist_id IS NULL OR community_memberships.artist_id=excluded.artist_id').bind(verified.userId,body.id)
         ]);
        }catch{return json({error:'This workspace could not be assigned to the applicant account.'},409)}
        return json({saved:true,assigned:true});
       }
       const kind=String(body.kind),payload=body.payload as Record<string,unknown>;
       if(!['artist','venue'].includes(kind)||!payload||typeof payload!=='object')return json({error:'Invalid application.'},400);
       const required=kind==='artist'?['name','email','regionId','city','practice','note']:['name','type','regionId','city','address','contactName','email'];
       if(required.some(field=>!shortText(payload[field],field==='note'?2000:250))||!/^\S+@\S+\.\S+$/.test(String(payload.email))||!validId(payload.regionId)||!safeOptionalUrl(kind==='artist'?payload.portfolio:payload.website))return json({error:'Complete every required application field with a valid website address.'},400);
       const region=await env.DB.prepare("SELECT id FROM community_regions WHERE id=?1 AND status='active'").bind(payload.regionId).first();if(!region)return json({error:'Choose an active region.'},400);
       const collection=kind==='venue'?'venues':'applications';
       const duplicate=await env.DB.prepare("SELECT id FROM community_records WHERE collection=?1 AND payload IS NOT NULL AND json_extract(payload,'$.submittedBy')=?2 AND json_extract(payload,'$.status')='pending'").bind(collection,verified.userId).first();if(duplicate)return json({error:`You already have a pending ${kind} application.`},409);
       const id=crypto.randomUUID(),stored=kind==='artist'?{id,name:String(payload.name).trim(),email:String(payload.email).trim(),regionId:payload.regionId,city:String(payload.city).trim(),practice:String(payload.practice).trim(),portfolio:String(payload.portfolio||'').trim(),note:String(payload.note).trim(),opportunities:!!payload.opportunities,status:'pending',invitationAccepted:false,submittedBy:verified.userId}:{id,name:String(payload.name).trim(),type:String(payload.type).trim(),regionId:payload.regionId,city:String(payload.city).trim(),address:String(payload.address).trim(),postalCode:String(payload.postalCode||'').trim(),description:String(payload.description||'').trim(),website:String(payload.website||'').trim(),phone:String(payload.phone||'').trim(),hours:String(payload.hours||'').trim(),accessibility:String(payload.accessibility||'').trim(),instructions:String(payload.instructions||'').trim(),contactName:String(payload.contactName).trim(),email:String(payload.email).trim(),opportunities:String(payload.opportunities||'').trim(),status:'pending',visible:false,available:!!payload.available,memberIds:[],campaigns:[],submittedBy:verified.userId};
       if(kind==='artist'){
        // The applicant can start building a private page right away. Nothing
        // becomes public until an administrator approves the application.
        const existing=await env.DB.prepare('SELECT artist_id FROM community_memberships WHERE user_id=?1').bind(verified.userId).first<{artist_id:string|null}>();
        if(existing?.artist_id)return json({error:'This account already has an artist workspace. Open it from Your account.'},409);
        const artist={id,name:stored.name,regionId:stored.regionId,city:stored.city,practice:(stored as {practice:string}).practice,bio:'',website:(stored as {portfolio:string}).portfolio,email:stored.email,phone:'',publicWebsite:false,publicEmail:false,publicPhone:false,published:false,step:0,works:[]};
        try{
         await env.DB.batch([
          env.DB.prepare('INSERT INTO community_records(collection,id,payload,revision) VALUES(?1,?2,?3,1)').bind('applications',id,JSON.stringify(stored)),
          env.DB.prepare('INSERT INTO community_records(collection,id,payload,revision) VALUES(?1,?2,?3,1)').bind('artists',id,JSON.stringify(artist)),
          env.DB.prepare('INSERT INTO community_memberships(user_id,artist_id,administrator) VALUES(?1,?2,0) ON CONFLICT(user_id) DO UPDATE SET artist_id=excluded.artist_id WHERE community_memberships.artist_id IS NULL').bind(verified.userId,id)
         ]);
        }catch{return json({error:'Your workspace could not be opened. Please try again.'},409)}
        await queueAdminNotification(env as NotificationEnv,ctx,'artist',id,stored.name);return json({saved:true,id,workspace:true});
       }
       await env.DB.prepare('INSERT INTO community_records(collection,id,payload,revision) VALUES(?1,?2,?3,1)').bind(collection,id,JSON.stringify(stored)).run();await queueAdminNotification(env as NotificationEnv,ctx,kind as 'artist'|'venue',id,String(payload.name).trim());return json({saved:true,id});
      }
      return json({error:'Method not allowed'},405);
     }catch(error){console.error(JSON.stringify({event:'application_intake_error',message:error instanceof Error?error.message:String(error)}));return json({error:'Unable to process the application.'},400)}
    }
    if(verified&&url.pathname==='/api/community/region-proposals'){
     try{
      const administrator=membership?.administrator===1;
      if(request.method==='GET'){
        const statement=administrator
          ? env.DB.prepare('SELECT * FROM region_proposals ORDER BY created_at DESC')
          : env.DB.prepare('SELECT * FROM region_proposals WHERE user_id=?1 ORDER BY created_at DESC').bind(verified.userId);
        const {results}=await statement.all();return json({proposals:results});
      }
      if(request.method==='PUT'){
        const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,32768))) as Record<string,unknown>;
        if(body.action==='review'){
          if(!administrator)return json({error:'Administrator access required.'},403);
          if(!validId(body.id)||!['approved','declined'].includes(String(body.status)))return json({error:'Invalid region review.'},400);
          const proposal=await env.DB.prepare("SELECT * FROM region_proposals WHERE id=?1 AND status='pending'").bind(body.id).first<Record<string,string>>();
          if(!proposal)return json({error:'This proposal is no longer pending.'},409);
          if(body.status==='declined'){
            await env.DB.prepare("UPDATE region_proposals SET status='declined',reviewed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?1").bind(body.id).run();
            return json({saved:true});
          }
          const existing=await env.DB.prepare("SELECT id FROM community_regions WHERE lower(name)=lower(?1) AND status='active'").bind(proposal.proposed_name).first();
          if(existing)return json({error:'An active region already uses this name.'},409);
          const regionId=`region-${regionSlug(proposal.proposed_name)}-${proposal.id.slice(0,8)}`;
          const slug=`${regionSlug(proposal.proposed_name)}-${proposal.id.slice(0,8)}`;
          await env.DB.batch([
            env.DB.prepare("INSERT INTO community_regions(id,name,slug,core_city,state_code,country_code,coverage,status) VALUES(?1,?2,?3,?4,?5,?6,?7,'active')").bind(regionId,proposal.proposed_name,slug,proposal.core_city,proposal.state_code,proposal.country_code,proposal.coverage),
            env.DB.prepare("UPDATE region_proposals SET status='approved',region_id=?1,reviewed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?2 AND status='pending'").bind(regionId,body.id)
          ]);
          return json({saved:true,regionId});
        }
        if(!shortText(body.proposedName,120)||!shortText(body.coreCity,120)||!stateCode(body.stateCode)||!shortText(body.coverage,500)||!shortText(body.localConnection,2000)||!shortText(body.intendedRole,120)||!shortText(body.rationale,2000))return json({error:'Complete every region proposal field.'},400);
        const duplicate=await env.DB.prepare("SELECT id FROM region_proposals WHERE user_id=?1 AND lower(proposed_name)=lower(?2) AND status='pending'").bind(verified.userId,String(body.proposedName).trim()).first();
        if(duplicate)return json({error:'You already have a pending proposal for this region.'},409);
        const id=crypto.randomUUID();
        await env.DB.prepare("INSERT INTO region_proposals(id,user_id,proposed_name,core_city,state_code,country_code,coverage,local_connection,intended_role,rationale) VALUES(?1,?2,?3,?4,?5,'US',?6,?7,?8,?9)").bind(id,verified.userId,String(body.proposedName).trim(),String(body.coreCity).trim(),String(body.stateCode),String(body.coverage).trim(),String(body.localConnection).trim(),String(body.intendedRole).trim(),String(body.rationale).trim()).run();
        await queueAdminNotification(env as NotificationEnv,ctx,'region',id,String(body.proposedName).trim());
        return json({saved:true,id});
      }
      return json({error:'Method not allowed'},405);
     }catch(error){console.error(JSON.stringify({event:'region_proposal_error',message:error instanceof Error?error.message:String(error)}));return json({error:'Unable to process the region proposal.'},400)}
    }
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
