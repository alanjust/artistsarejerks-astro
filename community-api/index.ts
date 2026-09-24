/// <reference path="./worker-configuration.d.ts" />
import {publicRecords,publicImageKeys,visibleWorks,type PublicRecord} from './public-records';
import {verifyCapability,canWrite,canRead,settleWorks} from './security';
import {TERMS_VERSION} from './terms';
const collections = new Set(['applications','artists','venues','showings']);
const validId = (id:unknown):id is string => typeof id==='string' && /^[a-zA-Z0-9_-]{1,160}$/.test(id);
const local = (host:string) => host==='localhost'||host==='127.0.0.1'||host==='[::1]';
const json = (value:unknown,status=200) => Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const shortText=(value:unknown,max=200)=>typeof value==='string'&&!!value.trim()&&value.trim().length<=max;
const stateCode=(value:unknown)=>typeof value==='string'&&/^[A-Z]{2}$/.test(value);
const regionSlug=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'region';
const safeOptionalUrl=(value:unknown)=>{if(value===undefined||value===null||value==='')return true;if(typeof value!=='string'||value.length>500)return false;try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password}catch{return false}};
type NotificationEnv=Env&{TURNSTILE_SECRET?:string;ADMIN_EMAIL?:{send(message:{to:string;from:{email:string;name:string};subject:string;text:string;html:string;replyTo?:string;headers?:Record<string,string>}):Promise<unknown>};ADMIN_NOTIFICATION_TO?:string;ADMIN_NOTIFICATION_FROM?:string;ADMIN_BASE_URL?:string};
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));
async function queueAdminNotification(env:NotificationEnv,ctx:ExecutionContext,kind:'artist'|'venue'|'region',subjectId:string,title:string){
 const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO admin_notifications(id,kind,subject_id,title,delivery_status) VALUES(?1,?2,?3,?4,'pending')").bind(id,kind,subjectId,title).run();
 if(!env.ADMIN_EMAIL||!env.ADMIN_NOTIFICATION_TO||!env.ADMIN_NOTIFICATION_FROM){await env.DB.prepare("UPDATE admin_notifications SET delivery_status='not_configured' WHERE id=?1").bind(id).run();return}
 const url=`${env.ADMIN_BASE_URL||'https://aaj-dev.alanjust.com'}/prototype/admin/inbox/`,safeTitle=escapeHtml(title),label=kind[0].toUpperCase()+kind.slice(1);
 ctx.waitUntil((async()=>{try{await env.ADMIN_EMAIL!.send({to:env.ADMIN_NOTIFICATION_TO!,from:{email:env.ADMIN_NOTIFICATION_FROM!,name:'Artists Are Jerks'},subject:`New ${kind} application: ${title}`,text:`A new ${kind} application is ready for review: ${title}\n\nReview it: ${url}`,html:`<p>A new ${label.toLowerCase()} application is ready for review: <strong>${safeTitle}</strong></p><p><a href="${url}">Open the administrator inbox</a></p>`});await env.DB.prepare("UPDATE admin_notifications SET delivery_status='sent',delivered_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?1").bind(id).run()}catch(error){await env.DB.prepare("UPDATE admin_notifications SET delivery_status='failed',error=?1 WHERE id=?2").bind(String(error).slice(0,500),id).run()}})());
}
// Tells an artist their request was approved. Returns the delivery status that the
// admin inbox shows, so a missed email is visible rather than silent.
async function sendApprovalEmail(env:NotificationEnv,application:Record<string,unknown>):Promise<'sent'|'failed'|'not_configured'>{
 const to=String(application.email||'');
 if(!env.ADMIN_EMAIL||!env.ADMIN_NOTIFICATION_FROM||!/^\S+@\S+\.\S+$/.test(to))return 'not_configured';
 const name=String(application.name||'there'),url=`${env.ADMIN_BASE_URL||'https://aaj-dev.alanjust.com'}/prototype/workspace/member/?artist=${encodeURIComponent(String(application.id))}`;
 const text=`Hi ${name},\n\nGood news: your request to join Artists Are Jerks has been approved.\n\nYour page is ready whenever you are. Publish it, and you'll show up on Our Artists. Add a showing, and people can find your work on a wall near them.\n\nOpen your page: ${url}\n\nQuestions? Just reply to this email.\n\n—Artists Are Jerks`;
 const html=`<p>Hi ${escapeHtml(name)},</p><p>Good news: your request to join Artists Are Jerks has been approved.</p><p>Your page is ready whenever you are. Publish it, and you’ll show up on Our Artists. Add a showing, and people can find your work on a wall near them.</p><p><a href="${escapeHtml(url)}">Open your page</a></p><p>Questions? Just reply to this email.</p><p>—Artists Are Jerks</p>`;
 try{
  await env.ADMIN_EMAIL.send({to,from:{email:env.ADMIN_NOTIFICATION_FROM,name:'Artists Are Jerks'},subject:'You’re in: your Artists Are Jerks page is approved',text,html,...(env.ADMIN_NOTIFICATION_TO?{replyTo:env.ADMIN_NOTIFICATION_TO}:{})});
  return 'sent';
 }catch(error){console.error(JSON.stringify({event:'approval_email_failed',message:error instanceof Error?error.message:String(error)}));return 'failed'}
}
// A visitor's message to an artist. The artist's address stays private: the email
// goes to the artist with the visitor as the reply-to, so a reply goes straight back.
async function forwardMessage(env:NotificationEnv,to:string,artistName:string,sender:{name:string;email:string;body:string}):Promise<'sent'|'failed'|'not_configured'>{
 if(!env.ADMIN_EMAIL||!env.ADMIN_NOTIFICATION_FROM||!/^\S+@\S+\.\S+$/.test(to))return 'not_configured';
 const text=`${sender.name} sent you a message through your page on Artists Are Jerks:\n\n${sender.body}\n\nReply to this email to answer ${sender.name} directly at ${sender.email}.\n\n—Artists Are Jerks`;
 const html=`<p>${escapeHtml(sender.name)} sent you a message through your page on Artists Are Jerks:</p><blockquote style="white-space:pre-wrap">${escapeHtml(sender.body)}</blockquote><p>Reply to this email to answer ${escapeHtml(sender.name)} directly at ${escapeHtml(sender.email)}.</p><p>—Artists Are Jerks</p>`;
 try{await env.ADMIN_EMAIL.send({to,from:{email:env.ADMIN_NOTIFICATION_FROM,name:'Artists Are Jerks'},replyTo:sender.email,subject:`Message from ${sender.name.slice(0,80)} about your work`,text,html});return 'sent'}
 catch(error){console.error(JSON.stringify({event:'artist_message_failed',artist:artistName,message:error instanceof Error?error.message:String(error)}));return 'failed'}
}
const siteUrl=(env:NotificationEnv)=>env.ADMIN_BASE_URL||'https://aaj-dev.alanjust.com';
async function fingerprint(env:Env,client:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${env.COMMUNITY_GATEWAY_SECRET}:${client}`)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
const randomToken=()=>[...crypto.getRandomValues(new Uint8Array(24))].map(x=>x.toString(16).padStart(2,'0')).join('');
const artistPageUrl=(env:NotificationEnv,artistId:string)=>`${siteUrl(env)}/prototype/artists/member/?artist=${encodeURIComponent(artistId)}`;
async function sendConfirmFollow(env:NotificationEnv,to:string,artistName:string,token:string){
 if(!env.ADMIN_EMAIL||!env.ADMIN_NOTIFICATION_FROM)return 'not_configured';
 const url=`${siteUrl(env)}/follow/confirm/?t=${token}`;
 const text=`Someone, hopefully you, asked to hear when ${artistName} has new work on a wall somewhere.\n\nTo confirm, open this link and press the button: ${url}\n\nIf this wasn't you, ignore this email and you won't hear from us.\n\n—Artists Are Jerks`;
 const html=`<p>Someone, hopefully you, asked to hear when ${escapeHtml(artistName)} has new work on a wall somewhere.</p><p><a href="${escapeHtml(url)}">Confirm that you want these updates</a></p><p>If this wasn’t you, ignore this email and you won’t hear from us.</p><p>—Artists Are Jerks</p>`;
 try{await env.ADMIN_EMAIL.send({to,from:{email:env.ADMIN_NOTIFICATION_FROM,name:'Artists Are Jerks'},subject:`Confirm: updates from ${artistName.slice(0,80)}`,text,html});return 'sent'}catch(error){console.error(JSON.stringify({event:'follow_confirm_failed',message:error instanceof Error?error.message:String(error)}));return 'failed'}
}
// Tells confirmed followers about a newly published showing, once per showing.
async function notifyFollowers(env:NotificationEnv,showingId:string){
 const records=(await env.DB.prepare('SELECT collection,id,payload,revision FROM community_records').all<{collection:string;id:string;payload:string|null;revision:number}>()).results.map(row=>({...row,payload:row.payload===null?null:JSON.parse(row.payload)})) as PublicRecord[];
 const visible=publicRecords(records);
 const show=visible.find(record=>record.collection==='showings'&&record.id===showingId)?.payload;
 if(!show)return;
 const artist=visible.find(record=>record.collection==='artists'&&record.id===show.artistId)?.payload;
 if(!artist)return;
 const claimed=await env.DB.prepare('INSERT OR IGNORE INTO showing_notices(showing_id,artist_id) VALUES(?1,?2)').bind(showingId,show.artistId).run();
 if(!claimed.meta.changes)return;
 const {results:followers}=await env.DB.prepare("SELECT email,token FROM artist_followers WHERE artist_id=?1 AND status='confirmed'").bind(show.artistId).all<{email:string;token:string}>();
 if(!env.ADMIN_EMAIL||!env.ADMIN_NOTIFICATION_FROM){await env.DB.prepare('UPDATE showing_notices SET recipients=?1 WHERE showing_id=?2').bind(followers.length,showingId).run();return}
 const day=(value:string)=>new Date(`${value}T12:00:00Z`).toLocaleDateString('en-US',{month:'long',day:'numeric',timeZone:'UTC'});
 const today=new Date().toISOString().slice(0,10),upcoming=String(show.start)>today;
 const when=show.ongoing?(upcoming?`It opens ${day(show.start)} and will be up for a while.`:'It’s up now, and it’ll be there for a while.'):upcoming?`It runs ${day(show.start)} through ${day(show.end)}.`:`It’s up now, through ${day(show.end)}.`;
 const where=[show.address,show.city].filter(Boolean).join(', '),page=artistPageUrl(env,show.artistId),name=String(artist.name);
 let sent=0;
 for(const follower of followers){
  const unsubscribe=`${siteUrl(env)}/follow/unsubscribe/?t=${follower.token}`;
  const text=`${name} has work up at ${show.venue}${show.city?` in ${show.city}`:''}. ${when}\n\n${where}\n\nSee the work: ${page}\n\nYou're getting this because you asked to hear when ${name} shows next. Stop these emails: ${unsubscribe}\n\n—Artists Are Jerks`;
  const html=`<p>${escapeHtml(name)} has work up at ${escapeHtml(String(show.venue))}${show.city?` in ${escapeHtml(String(show.city))}`:''}. ${escapeHtml(when)}</p><p>${escapeHtml(where)}</p><p><a href="${escapeHtml(page)}">See the work</a></p><p style="color:#555">You’re getting this because you asked to hear when ${escapeHtml(name)} shows next. <a href="${escapeHtml(unsubscribe)}">Stop these emails</a>.</p><p>—Artists Are Jerks</p>`;
  try{await env.ADMIN_EMAIL.send({to:follower.email,from:{email:env.ADMIN_NOTIFICATION_FROM,name:'Artists Are Jerks'},subject:`${name.slice(0,80)} has work up at ${String(show.venue).slice(0,80)}`,text,html,headers:{'List-Unsubscribe':`<${unsubscribe}>`}});sent++}
  catch(error){console.error(JSON.stringify({event:'follower_notice_failed',message:error instanceof Error?error.message:String(error)}))}
 }
 await env.DB.prepare('UPDATE showing_notices SET recipients=?1,sent=?2 WHERE showing_id=?3').bind(followers.length,sent,showingId).run();
}
const reportReasons:Record<string,string>={'not-theirs':'It isn’t the artist’s own work','not-art':'It’s a craft or a product, not art','unlabeled-ai':'It was made with AI but isn’t labeled','other':'Something else'};
// Tells the administrator a visitor reported a piece. The report is in the inbox either way.
async function sendReportNotice(env:NotificationEnv,artistName:string,title:string,reason:string,details:string){
 if(!env.ADMIN_EMAIL||!env.ADMIN_NOTIFICATION_TO||!env.ADMIN_NOTIFICATION_FROM)return;
 const url=`${siteUrl(env)}/prototype/admin/inbox/#reports`,label=reportReasons[reason]||reason;
 try{await env.ADMIN_EMAIL.send({to:env.ADMIN_NOTIFICATION_TO,from:{email:env.ADMIN_NOTIFICATION_FROM,name:'Artists Are Jerks'},subject:`Report: “${title.slice(0,80)}” by ${artistName.slice(0,80)}`,text:`A visitor reported “${title}” by ${artistName}.\n\nReason: ${label}${details?`\n\n${details}`:''}\n\nReview it: ${url}`,html:`<p>A visitor reported “${escapeHtml(title)}” by ${escapeHtml(artistName)}.</p><p>Reason: ${escapeHtml(label)}</p>${details?`<blockquote style="white-space:pre-wrap">${escapeHtml(details)}</blockquote>`:''}<p><a href="${escapeHtml(url)}">Review it in the inbox</a></p>`})}
 catch(error){console.error(JSON.stringify({event:'report_notice_failed',message:error instanceof Error?error.message:String(error)}))}
}
// Why a piece was hidden, in the words the artist reads.
const hideReasons:Record<string,string>={'not-theirs':'It looks like it may not be your own work.','not-art':'It looks like a craft or a product rather than art made to be looked at.','unlabeled-ai':'It looks like it was made with AI but isn’t labeled. Check “Made with AI” on the piece, then write to us and we’ll put it back.','copyright':'We received a copyright notice about it. We’ll send you a copy separately.','other':'It doesn’t fit the Community Guidelines.'};
// Tells an artist a piece was hidden, or put back. Returns the delivery status.
async function sendHiddenNotice(env:NotificationEnv,artist:Record<string,any>,email:string,title:string,hidden:boolean,reason:string):Promise<'sent'|'failed'|'not_configured'>{
 if(!env.ADMIN_EMAIL||!env.ADMIN_NOTIFICATION_FROM||!/^\S+@\S+\.\S+$/.test(email))return 'not_configured';
 const name=String(artist.name||'there'),workspace=`${siteUrl(env)}/prototype/workspace/member/?artist=${encodeURIComponent(String(artist.id))}#artwork`;
 const text=hidden
  ?`Hi ${name},\n\nWe’ve taken “${title}” off your public page on Artists Are Jerks. Here’s why: ${hideReasons[reason]||hideReasons.other}\n\nThe piece is still in your workspace, marked hidden, and nothing else on your page changed.\n\nIf you think we got this wrong, or you’d like to talk it over, reply to this email or use “Write to us” in your workspace: ${workspace}\n\n—Artists Are Jerks`
  :`Hi ${name},\n\nGood news: “${title}” is back on your public page on Artists Are Jerks.\n\nYour workspace: ${workspace}\n\n—Artists Are Jerks`;
 const html=`<p>${text.split('\n\n').map(part=>escapeHtml(part).replace(escapeHtml(workspace),`<a href="${escapeHtml(workspace)}">your workspace</a>`)).join('</p><p>')}</p>`;
 try{await env.ADMIN_EMAIL.send({to:email,from:{email:env.ADMIN_NOTIFICATION_FROM,name:'Artists Are Jerks'},subject:hidden?`We’ve taken “${title.slice(0,80)}” off your page`:`“${title.slice(0,80)}” is back on your page`,text,html,...(env.ADMIN_NOTIFICATION_TO?{replyTo:env.ADMIN_NOTIFICATION_TO}:{})});return 'sent'}
 catch(error){console.error(JSON.stringify({event:'hidden_notice_failed',message:error instanceof Error?error.message:String(error)}));return 'failed'}
}
// Hides or restores one piece, and emails the artist either way. Only an administrator reaches this.
async function setWorkHidden(env:Env,artistId:string,workId:string,hidden:boolean,reason='other'){
 const row=await env.DB.prepare("SELECT payload FROM community_records WHERE collection='artists' AND id=?1 AND payload IS NOT NULL").bind(artistId).first<{payload:string}>();
 if(!row)return false;
 const artist=JSON.parse(row.payload),work=(Array.isArray(artist.works)?artist.works:[]).find((item:Record<string,unknown>)=>item&&item.id===workId);
 if(!work)return false;
 const changed=(work.hiddenByAdmin===true)!==hidden;
 if(hidden){work.hiddenByAdmin=true;work.hiddenAt=new Date().toISOString();work.hiddenReason=hideReasons[reason]?reason:'other'}else{delete work.hiddenByAdmin;delete work.hiddenAt;delete work.hiddenReason}
 if(changed){
  const application=await env.DB.prepare("SELECT payload FROM community_records WHERE collection='applications' AND id=?1 AND payload IS NOT NULL").bind(artistId).first<{payload:string}>();
  const email=String(artist.email||(application?JSON.parse(application.payload).email:'')||'');
  work.hiddenNotice=await sendHiddenNotice(env as NotificationEnv,artist,email,String(work.title||'Untitled'),hidden,String(work.hiddenReason||reason));
 }
 await env.DB.prepare("UPDATE community_records SET payload=?1,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE collection='artists' AND id=?2").bind(JSON.stringify(artist),artistId).run();
 return true;
}
const noteTopics:Record<string,string>={hidden:'A hidden piece',problem:'Something isn’t working',question:'A question',other:'Something else'};
// A member's note to the administrator, emailed with the member as reply-to.
async function sendMemberNote(env:NotificationEnv,note:{name:string;email:string;topic:string;body:string;where:string}):Promise<'sent'|'failed'|'not_configured'>{
 if(!env.ADMIN_EMAIL||!env.ADMIN_NOTIFICATION_TO||!env.ADMIN_NOTIFICATION_FROM)return 'not_configured';
 const inbox=`${siteUrl(env)}/prototype/admin/inbox/#notes`,label=noteTopics[note.topic]||note.topic;
 const text=`${note.name} (${note.where}) wrote through “Write to us.”\n\nAbout: ${label}\n\n${note.body}\n\nReply to this email to answer ${note.name} at ${note.email}. Inbox: ${inbox}`;
 const html=`<p>${escapeHtml(note.name)} (${escapeHtml(note.where)}) wrote through “Write to us.”</p><p>About: ${escapeHtml(label)}</p><blockquote style="white-space:pre-wrap">${escapeHtml(note.body)}</blockquote><p>Reply to this email to answer ${escapeHtml(note.name)} at ${escapeHtml(note.email)}. <a href="${escapeHtml(inbox)}">Open the inbox</a></p>`;
 try{await env.ADMIN_EMAIL.send({to:env.ADMIN_NOTIFICATION_TO,from:{email:env.ADMIN_NOTIFICATION_FROM,name:'Artists Are Jerks'},replyTo:note.email,subject:`${label}: ${note.name.slice(0,80)}`,text,html});return 'sent'}
 catch(error){console.error(JSON.stringify({event:'member_note_failed',message:error instanceof Error?error.message:String(error)}));return 'failed'}
}
// "Still up?" reminders for ongoing showings. The workspace asks at 60 days since the
// last check-in and the showing leaves the listings at 74; these emails ask at 60 and
// again at 70, so an artist who never opens the workspace still hears in time.
const pacificDay=(date=new Date())=>date.toLocaleDateString('en-CA',{timeZone:'America/Los_Angeles'});
const dayNumber=(day:string)=>Date.parse(`${day.slice(0,10)}T12:00:00Z`)/86400000;
const shiftDay=(day:string,days:number)=>new Date(Date.parse(`${day.slice(0,10)}T12:00:00Z`)+days*86400000).toISOString().slice(0,10);
const longDay=(day:string)=>new Date(`${day.slice(0,10)}T12:00:00Z`).toLocaleDateString('en-US',{month:'long',day:'numeric',timeZone:'UTC'});
async function sendStillUpReminders(env:NotificationEnv,today=pacificDay()){
 const rows=(await env.DB.prepare('SELECT collection,id,payload FROM community_records WHERE payload IS NOT NULL').all<{collection:string;id:string;payload:string}>()).results.map(row=>({...row,data:JSON.parse(row.payload)}));
 const find=(collection:string,id:string)=>rows.find(row=>row.collection===collection&&row.id===id)?.data;
 for(const row of rows){
  const show=row.data;
  if(row.collection!=='showings'||show.status!=='published'||show.ongoing!==true)continue;
  const application=find('applications',show.artistId);
  if(application?.status!=='approved')continue;
  const cycle=String(show.confirmedAt||show.start||'').slice(0,10);
  if(!/^\d{4}-\d\d-\d\d$/.test(cycle))continue;
  const age=dayNumber(today)-dayNumber(cycle);
  if(age<60||age>=74)continue;
  const stage=age>=70?2:1;
  const artist=find('artists',show.artistId)||{};
  const to=String(artist.email||application.email||'');
  const token=randomToken();
  const claimed=await env.DB.prepare('INSERT OR IGNORE INTO showing_reminders(token,showing_id,cycle,stage) VALUES(?1,?2,?3,?4)').bind(token,row.id,cycle,stage).run();
  if(!claimed.meta.changes)continue;
  let status='not_configured';
  if(env.ADMIN_EMAIL&&env.ADMIN_NOTIFICATION_FROM&&/^\S+@\S+\.\S+$/.test(to)){
   const url=`${siteUrl(env)}/still-up/?t=${token}`,venue=String(show.venue||'your showing'),name=String(artist.name||application.name||'there'),offDay=longDay(shiftDay(cycle,74));
   const text=stage===1
    ?`Hi ${name},\n\nIt’s been a couple of months since you listed your work at ${venue} as an ongoing showing. Is it still up?\n\nOne tap keeps it on Showing Now: ${url}\n\nIf it came down, the same page lets you say so, and it comes off the listings.\n\n—Artists Are Jerks`
    :`Hi ${name},\n\nWe haven’t heard back, so your showing at ${venue} comes off Showing Now on ${offDay} unless you tell us it’s still up.\n\nIt takes one tap: ${url}\n\n—Artists Are Jerks`;
   const html=`<p>${text.split('\n\n').map(part=>escapeHtml(part).replace(escapeHtml(url),`<a href="${escapeHtml(url)}">${stage===1?'Tell us it’s still up':'Answer here'}</a>`)).join('</p><p>')}</p>`;
   try{await env.ADMIN_EMAIL.send({to,from:{email:env.ADMIN_NOTIFICATION_FROM,name:'Artists Are Jerks'},subject:stage===1?`Is your work still up at ${venue.slice(0,80)}?`:`Last call: is your work still up at ${venue.slice(0,80)}?`,text,html,...(env.ADMIN_NOTIFICATION_TO?{replyTo:env.ADMIN_NOTIFICATION_TO}:{})});status='sent'}
   catch(error){status='failed';console.error(JSON.stringify({event:'still_up_failed',message:error instanceof Error?error.message:String(error)}))}
  }
  await env.DB.prepare('UPDATE showing_reminders SET delivery_status=?1 WHERE token=?2').bind(status,token).run();
 }
}
// Monthly cleanup promised in the Privacy Notice.
async function cleanUp(env:Env){
 await env.DB.batch([
  env.DB.prepare("DELETE FROM artist_messages WHERE created_at<strftime('%Y-%m-%dT%H:%M:%fZ','now','-2 years')"),
  env.DB.prepare("DELETE FROM member_notes WHERE created_at<strftime('%Y-%m-%dT%H:%M:%fZ','now','-2 years')"),
  env.DB.prepare("DELETE FROM artwork_reports WHERE status!='open' AND closed_at<strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 year')")
 ]);
}
// When an artist's page goes public (published, or approved), tells followers about
// any showings that were published while the page was still private. Each showing is
// announced at most once, so this is safe to call more than once.
async function notifyPendingShowings(env:NotificationEnv,artistId:string){
 const {results}=await env.DB.prepare("SELECT id FROM community_records WHERE collection='showings' AND payload IS NOT NULL AND json_extract(payload,'$.artistId')=?1 AND json_extract(payload,'$.status')='published'").bind(artistId).all<{id:string}>();
 for(const row of results)await notifyFollowers(env,row.id);
}
async function turnstileOk(env:NotificationEnv,token:unknown,ip:string){
 if(!env.TURNSTILE_SECRET)return true;
 if(typeof token!=='string'||!token)return false;
 try{const form=new FormData();form.append('secret',env.TURNSTILE_SECRET);form.append('response',token);if(ip)form.append('remoteip',ip);const result=await (await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form})).json() as {success?:boolean};return result.success===true}catch{return false}
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
    if(request.method==='POST'&&url.pathname==='/api/community/public/messages'){
      try{
        const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,16384))) as Record<string,unknown>;
        const name=String(body.name??'').trim(),email=String(body.email??'').trim(),message=String(body.message??'').trim();
        if(!validId(body.artistId)||!name||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||!message||message.length>4000)return json({error:'Please add your name, a working email, and a message.'},400);
        // Quiet traps for automated senders: a hidden field people never fill, and a form sent too fast to have been read.
        if(String(body.website??'')||Number(body.elapsed)<3000)return json({sent:true});
        const client=request.headers.get('x-aaj-client')||'unknown';
        if(!await turnstileOk(env as NotificationEnv,body.turnstile,client))return json({error:'The spam check didn’t pass. Please try again.'},400);
        const records=await loadRecords();
        const artist=publicRecords(records).find(record=>record.collection==='artists'&&record.id===body.artistId)?.payload;
        if(!artist||artist.publicForm!==true)return json({error:'This artist isn’t taking messages here.'},404);
        // Rate limits use a salted fingerprint of the visitor's network address, never the address itself.
        const senderHash=await fingerprint(env,client);
        const recentFromSender=await env.DB.prepare("SELECT count(*) AS n FROM artist_messages WHERE sender_hash=?1 AND created_at>strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 hour')").bind(senderHash).first<{n:number}>();
        if((recentFromSender?.n??0)>=5)return json({error:'You’ve sent several messages in the last hour. Please try again later.'},429);
        const recentToArtist=await env.DB.prepare("SELECT count(*) AS n FROM artist_messages WHERE artist_id=?1 AND created_at>strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 day')").bind(body.artistId).first<{n:number}>();
        if((recentToArtist?.n??0)>=30)return json({error:'This artist has had a lot of messages today. Please try again tomorrow.'},429);
        const own=records.find(record=>record.collection==='artists'&&record.id===body.artistId)?.payload;
        const application=records.find(record=>record.collection==='applications'&&record.id===body.artistId)?.payload;
        const to=String(own?.email||application?.email||'');
        const status=await forwardMessage(env as NotificationEnv,to,String(artist.name),{name,email,body:message});
        await env.DB.prepare('INSERT INTO artist_messages(id,artist_id,sender_name,sender_email,body,sender_hash,delivery_status) VALUES(?1,?2,?3,?4,?5,?6,?7)').bind(crypto.randomUUID(),body.artistId,name,email,message,senderHash,status).run();
        return json({sent:true});
      }catch(error){console.error(JSON.stringify({event:'artist_message_error',message:error instanceof Error?error.message:String(error)}));return json({error:'Your message couldn’t be sent. Please try again.'},400)}
    }
    if(request.method==='POST'&&url.pathname==='/api/community/public/follow'){
      try{
        const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,8192))) as Record<string,unknown>;
        const email=String(body.email??'').trim().toLowerCase();
        if(!validId(body.artistId)||!/^\S+@\S+\.\S+$/.test(email)||email.length>254)return json({error:'Please enter a working email address.'},400);
        if(String(body.website??'')||Number(body.elapsed)<2000)return json({saved:true});
        const client=request.headers.get('x-aaj-client')||'unknown';
        if(!await turnstileOk(env as NotificationEnv,body.turnstile,client))return json({error:'The spam check didn’t pass. Please try again.'},400);
        const artist=publicRecords(await loadRecords()).find(record=>record.collection==='artists'&&record.id===body.artistId)?.payload;
        if(!artist)return json({error:'This artist’s page isn’t public right now.'},404);
        const senderHash=await fingerprint(env,client);
        const recent=await env.DB.prepare("SELECT count(*) AS n FROM artist_followers WHERE sender_hash=?1 AND created_at>strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 hour')").bind(senderHash).first<{n:number}>();
        if((recent?.n??0)>=10)return json({error:'That’s a lot of sign-ups in an hour. Please try again later.'},429);
        const existing=await env.DB.prepare('SELECT id,token,status FROM artist_followers WHERE artist_id=?1 AND email=?2').bind(body.artistId,email).first<{id:string;token:string;status:string}>();
        // The same answer either way, so the form never reveals who already follows an artist.
        if(existing?.status==='confirmed')return json({saved:true});
        const token=existing?.token??randomToken();
        if(existing)await env.DB.prepare("UPDATE artist_followers SET status='pending',sender_hash=?1 WHERE id=?2").bind(senderHash,existing.id).run();
        else await env.DB.prepare("INSERT INTO artist_followers(id,artist_id,email,token,status,sender_hash) VALUES(?1,?2,?3,?4,'pending',?5)").bind(crypto.randomUUID(),body.artistId,email,token,senderHash).run();
        await sendConfirmFollow(env as NotificationEnv,email,String(artist.name),token);
        return json({saved:true});
      }catch(error){console.error(JSON.stringify({event:'follow_error',message:error instanceof Error?error.message:String(error)}));return json({error:'That didn’t go through. Please try again.'},400)}
    }
    if(request.method==='POST'&&url.pathname==='/api/community/public/report'){
      try{
        const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,8192))) as Record<string,unknown>;
        const reason=String(body.reason??''),details=String(body.details??'').trim(),email=String(body.email??'').trim();
        if(!validId(body.artistId)||!validId(body.workId)||!reportReasons[reason]||details.length>1000||email&&(!/^\S+@\S+\.\S+$/.test(email)||email.length>254))return json({error:'Choose what’s wrong, and check the email address if you added one.'},400);
        if(String(body.website??'')||Number(body.elapsed)<2000)return json({sent:true});
        const client=request.headers.get('x-aaj-client')||'unknown';
        if(!await turnstileOk(env as NotificationEnv,body.turnstile,client))return json({error:'The spam check didn’t pass. Please try again.'},400);
        const artist=publicRecords(await loadRecords()).find(record=>record.collection==='artists'&&record.id===body.artistId)?.payload;
        const work=artist?.works?.find((item:Record<string,unknown>)=>item.id===body.workId);
        if(!artist||!work)return json({error:'That piece isn’t on the site anymore.'},404);
        const senderHash=await fingerprint(env,client);
        const recent=await env.DB.prepare("SELECT count(*) AS n FROM artwork_reports WHERE sender_hash=?1 AND created_at>strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 hour')").bind(senderHash).first<{n:number}>();
        if((recent?.n??0)>=5)return json({error:'You’ve sent several reports in the last hour. Please try again later.'},429);
        await env.DB.prepare('INSERT INTO artwork_reports(id,artist_id,work_id,reason,details,reporter_email,sender_hash) VALUES(?1,?2,?3,?4,?5,?6,?7)').bind(crypto.randomUUID(),body.artistId,body.workId,reason,details,email,senderHash).run();
        ctx.waitUntil(sendReportNotice(env as NotificationEnv,String(artist.name),String(work.title),reason,details));
        return json({sent:true});
      }catch(error){console.error(JSON.stringify({event:'report_error',message:error instanceof Error?error.message:String(error)}));return json({error:'That didn’t go through. Please try again.'},400)}
    }
    // The page a "Still up?" email links to. Without an answer it describes the showing;
    // with one it records it. Answering happens on a button press, never on opening the link.
    if(request.method==='POST'&&url.pathname==='/api/community/public/still-up'){
      try{
        const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,2048))) as Record<string,unknown>;
        if(typeof body.token!=='string'||!/^[0-9a-f]{48}$/.test(body.token))return json({error:'This link isn’t valid.'},400);
        const reminder=await env.DB.prepare('SELECT showing_id,cycle,answered_at FROM showing_reminders WHERE token=?1').bind(body.token).first<{showing_id:string;cycle:string;answered_at:string|null}>();
        if(!reminder)return json({error:'This link isn’t valid anymore.'},404);
        const row=await env.DB.prepare("SELECT payload FROM community_records WHERE collection='showings' AND id=?1 AND payload IS NOT NULL").bind(reminder.showing_id).first<{payload:string}>();
        if(!row)return json({error:'This showing isn’t on the site anymore.'},404);
        const show=JSON.parse(row.payload),current=String(show.confirmedAt||show.start||'').slice(0,10);
        const artist=await env.DB.prepare("SELECT payload FROM community_records WHERE collection='artists' AND id=?1").bind(show.artistId).first<{payload:string|null}>();
        const info={venue:String(show.venue||''),city:String(show.city||''),artistName:artist?.payload?String(JSON.parse(artist.payload).name||''):'',workspaceUrl:`/prototype/workspace/member/?artist=${encodeURIComponent(String(show.artistId))}#showing`};
        // Already settled: answered here, confirmed in the workspace, or no longer ongoing.
        if(reminder.answered_at||current!==reminder.cycle||show.ongoing!==true)return json({...info,settled:true});
        if(body.answer===undefined)return json({...info,settled:false});
        if(!['yes','down'].includes(String(body.answer)))return json({error:'Choose one of the two answers.'},400);
        const today=pacificDay();
        if(body.answer==='yes')show.confirmedAt=today;
        else{const yesterday=shiftDay(today,-1);show.ongoing=false;show.end=yesterday<String(show.start)?String(show.start):yesterday}
        await env.DB.batch([
          env.DB.prepare("UPDATE community_records SET payload=?1,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE collection='showings' AND id=?2").bind(JSON.stringify(show),reminder.showing_id),
          env.DB.prepare("UPDATE showing_reminders SET answered_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),answer=?1 WHERE showing_id=?2 AND cycle=?3").bind(String(body.answer),reminder.showing_id,reminder.cycle)
        ]);
        return json({...info,settled:true,answer:body.answer});
      }catch{return json({error:'That didn’t go through. Please try again.'},400)}
    }
    if(request.method==='POST'&&(url.pathname==='/api/community/public/follow/confirm'||url.pathname==='/api/community/public/follow/unsubscribe')){
      try{
        const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,2048))) as Record<string,unknown>;
        if(typeof body.token!=='string'||!/^[0-9a-f]{48}$/.test(body.token))return json({error:'This link isn’t valid.'},400);
        const row=await env.DB.prepare('SELECT id,artist_id,status FROM artist_followers WHERE token=?1').bind(body.token).first<{id:string;artist_id:string;status:string}>();
        if(!row)return json({error:'This link isn’t valid anymore.'},404);
        const confirm=url.pathname.endsWith('/confirm');
        if(confirm)await env.DB.prepare("UPDATE artist_followers SET status='confirmed',confirmed_at=coalesce(confirmed_at,strftime('%Y-%m-%dT%H:%M:%fZ','now')) WHERE id=?1").bind(row.id).run();
        else await env.DB.prepare("UPDATE artist_followers SET status='unsubscribed' WHERE id=?1").bind(row.id).run();
        const artist=(await loadRecords()).find(record=>record.collection==='artists'&&record.id===row.artist_id)?.payload;
        return json({saved:true,artistName:String(artist?.name??'this artist'),artistUrl:`/prototype/artists/member/?artist=${encodeURIComponent(row.artist_id)}`});
      }catch{return json({error:'That didn’t go through. Please try again.'},400)}
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
       // An administrator sees each artist's sample pieces: the ones sent with the
       // request, or, for older requests, the first three pieces on their page.
       const pages=new Map<string,Record<string,any>>();
       if(administrator){const {results:artists}=await env.DB.prepare("SELECT id,payload FROM community_records WHERE collection='artists' AND payload IS NOT NULL").all<{id:string;payload:string}>();for(const artist of artists)pages.set(artist.id,JSON.parse(artist.payload))}
       const samplesFor=(id:string,payload:Record<string,any>)=>{const works=(pages.get(id)?.works||[]) as Record<string,any>[];const chosen=Array.isArray(payload.samples)&&payload.samples.length?works.filter(work=>payload.samples.includes(work.id)):works.slice(0,3);return chosen.map(work=>({id:work.id,title:work.title,imageKey:work.imageKey,sampleImage:work.sampleImage,madeWithAI:work.madeWithAI===true}))};
       const applications=results.map(row=>{const payload=JSON.parse(row.payload),kind=row.collection==='venues'?'venue':'artist';return {kind,id:row.id,userId:payload.submittedBy,payload,revision:row.revision,updatedAt:row.updated_at,assignedArtistId:row.artist_id,assignedVenueId:row.venue_id,...(administrator&&kind==='artist'?{samples:samplesFor(row.id,payload)}:{})}});
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
        if(collection==='applications'&&body.status==='approved')payload.approvalEmail=await sendApprovalEmail(env as NotificationEnv,payload);
        const update=env.DB.prepare("UPDATE community_records SET payload=?1,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE collection=?2 AND id=?3").bind(JSON.stringify(payload),collection,body.id);
        const workspace=collection!=='applications'?[]:body.status==='approved'
          ?[env.DB.prepare('INSERT INTO community_memberships(user_id,artist_id,administrator) VALUES(?1,?2,0) ON CONFLICT(user_id) DO UPDATE SET artist_id=excluded.artist_id WHERE community_memberships.artist_id IS NULL').bind(payload.submittedBy,body.id)]
          :[env.DB.prepare('UPDATE community_memberships SET artist_id=NULL WHERE artist_id=?1').bind(body.id)];
        try{await env.DB.batch([update,...workspace])}catch{await update.run()}
        if(collection==='applications'&&body.status==='approved')ctx.waitUntil(notifyPendingShowings(env as NotificationEnv,body.id).catch(error=>console.error(JSON.stringify({event:'notify_pending_error',message:error instanceof Error?error.message:String(error)}))));
        return json({saved:true});
       }
       if(body.action==='resend-approval'){
        if(!administrator)return json({error:'Administrator access required.'},403);
        if(!validId(body.id))return json({error:'Invalid application.'},400);
        const row=await env.DB.prepare("SELECT payload FROM community_records WHERE collection='applications' AND id=?1 AND payload IS NOT NULL").bind(body.id).first<{payload:string}>();
        const payload=row?JSON.parse(row.payload):null;
        if(payload?.status!=='approved')return json({error:'Only approved artists get an approval email.'},400);
        payload.approvalEmail=await sendApprovalEmail(env as NotificationEnv,payload);
        await env.DB.prepare("UPDATE community_records SET payload=?1,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE collection='applications' AND id=?2").bind(JSON.stringify(payload),body.id).run();
        return json({saved:true,approvalEmail:payload.approvalEmail});
       }
       // An artist agreeing to the current Artist Terms and Community Guidelines,
       // after applying or when the terms change. Earlier agreements are kept.
       if(body.action==='agree-terms'){
        if(!validId(body.id))return json({error:'Invalid request.'},400);
        const row=await env.DB.prepare("SELECT payload FROM community_records WHERE collection='applications' AND id=?1 AND payload IS NOT NULL").bind(body.id).first<{payload:string}>();
        const application=row?JSON.parse(row.payload):null;
        if(!application||application.submittedBy!==verified.userId)return json({error:'Only the artist can agree to their own terms.'},403);
        if(body.termsVersion!==TERMS_VERSION)return json({error:'The terms changed while this page was open. Reload and try again.'},409);
        if(application.terms?.version!==TERMS_VERSION){
         if(application.terms)application.termsHistory=[...(Array.isArray(application.termsHistory)?application.termsHistory:[]),application.terms];
         application.terms={version:TERMS_VERSION,agreedAt:new Date().toISOString()};
         await env.DB.prepare("UPDATE community_records SET payload=?1,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE collection='applications' AND id=?2").bind(JSON.stringify(application),body.id).run();
        }
        return json({saved:true,terms:application.terms});
       }
       // Two or three pieces, sent right after the request. They become the first
       // pieces on the applicant's page, and the administrator hears about the request.
       if(body.action==='samples'){
        const works=Array.isArray(body.works)?body.works as Record<string,unknown>[]:[];
        if(!validId(body.id)||works.length<2||works.length>3)return json({error:'Send two or three pieces.'},400);
        const row=await env.DB.prepare("SELECT payload FROM community_records WHERE collection='applications' AND id=?1 AND payload IS NOT NULL").bind(body.id).first<{payload:string}>();
        const application=row?JSON.parse(row.payload):null;
        if(!application||application.submittedBy!==verified.userId)return json({error:'This request isn’t yours.'},403);
        if(application.status!=='pending')return json({error:'This request has already been reviewed.'},409);
        if(Array.isArray(application.samples)&&application.samples.length)return json({error:'Your pieces are already in. Add more from your page.'},409);
        const {results:owned}=await env.DB.prepare('SELECT image_id FROM artwork_owners WHERE artist_id=?1').bind(body.id).all<{image_id:string}>();
        const ownedKeys=new Set(owned.map(image=>image.image_id));
        if(works.some(work=>!work||!validId(work.imageKey)||!ownedKeys.has(String(work.imageKey))||typeof work.title!=='string'||work.title.length>200))return json({error:'Upload each piece before sending.'},400);
        const pageRow=await env.DB.prepare("SELECT payload FROM community_records WHERE collection='artists' AND id=?1 AND payload IS NOT NULL").bind(body.id).first<{payload:string}>();
        if(!pageRow)return json({error:'Your page could not be found.'},404);
        const page=JSON.parse(pageRow.payload),now=new Date().toISOString();
        const samples=works.map(work=>({id:crypto.randomUUID(),title:String(work.title).trim()||'Untitled',medium:'',year:'',sale:'contact',price:'',public:true,publicAt:now,imageKey:String(work.imageKey),sampleImage:'',madeWithAI:work.madeWithAI===true}));
        const keys=new Set(samples.map(work=>work.imageKey));
        page.works=[...samples,...(Array.isArray(page.works)?page.works:[]).filter((work:Record<string,unknown>)=>!keys.has(String(work?.imageKey)))].slice(0,40);
        application.samples=samples.map(work=>work.id);
        await env.DB.batch([
         env.DB.prepare("UPDATE community_records SET payload=?1,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE collection='applications' AND id=?2").bind(JSON.stringify(application),body.id),
         env.DB.prepare("UPDATE community_records SET payload=?1,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE collection='artists' AND id=?2").bind(JSON.stringify(page),body.id)
        ]);
        await queueAdminNotification(env as NotificationEnv,ctx,'artist',body.id,String(application.name));
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
       if(payload.agreeTerms!==true||payload.termsVersion!==TERMS_VERSION)return json({error:kind==='artist'?'Please agree to the Artist Terms and Community Guidelines.':'Please agree to the Community Guidelines and Site Terms.'},400);
       const region=await env.DB.prepare("SELECT id FROM community_regions WHERE id=?1 AND status='active'").bind(payload.regionId).first();if(!region)return json({error:'Choose an active region.'},400);
       const collection=kind==='venue'?'venues':'applications';
       const duplicate=await env.DB.prepare("SELECT id FROM community_records WHERE collection=?1 AND payload IS NOT NULL AND json_extract(payload,'$.submittedBy')=?2 AND json_extract(payload,'$.status')='pending'").bind(collection,verified.userId).first();if(duplicate)return json({error:`You already have a pending ${kind} application.`},409);
       const id=crypto.randomUUID(),stored=kind==='artist'?{id,name:String(payload.name).trim(),email:String(payload.email).trim(),regionId:payload.regionId,city:String(payload.city).trim(),practice:String(payload.practice).trim(),portfolio:String(payload.portfolio||'').trim(),note:String(payload.note).trim(),opportunities:!!payload.opportunities,terms:{version:TERMS_VERSION,agreedAt:new Date().toISOString()},status:'pending',invitationAccepted:false,submittedBy:verified.userId}:{id,name:String(payload.name).trim(),type:String(payload.type).trim(),regionId:payload.regionId,city:String(payload.city).trim(),address:String(payload.address).trim(),postalCode:String(payload.postalCode||'').trim(),description:String(payload.description||'').trim(),website:String(payload.website||'').trim(),phone:String(payload.phone||'').trim(),hours:String(payload.hours||'').trim(),accessibility:String(payload.accessibility||'').trim(),instructions:String(payload.instructions||'').trim(),contactName:String(payload.contactName).trim(),email:String(payload.email).trim(),opportunities:String(payload.opportunities||'').trim(),invitedBy:String(payload.invitedBy||'').trim().slice(0,200),terms:{version:TERMS_VERSION,agreedAt:new Date().toISOString()},status:'pending',visible:false,available:!!payload.available,memberIds:[],campaigns:[],submittedBy:verified.userId};
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
        // The administrator is told once the sample pieces arrive (the samples action).
        return json({saved:true,id,workspace:true});
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
      if(url.pathname==='/api/community/followers'&&request.method==='GET'){
        const requested=url.searchParams.get('artist');
        const artistId=principal.administrator&&validId(requested)?requested:principal.artistId;
        if(!artistId)return json({error:'Only artists have followers.'},403);
        const {results}=await env.DB.prepare("SELECT email,confirmed_at FROM artist_followers WHERE artist_id=?1 AND status='confirmed' ORDER BY confirmed_at DESC").bind(artistId).all();
        return json({followers:results});
      }
      // "Write to us": artists and venues send notes; the administrator reads and closes them.
      if(url.pathname==='/api/community/notes'){
        if(request.method==='GET'){
          if(!principal.administrator)return json({error:'Administrator access required.'},403);
          const {results}=await env.DB.prepare("SELECT id,artist_id,venue_id,name,email,topic,work_id,body,delivery_status,created_at FROM member_notes WHERE status='open' ORDER BY created_at DESC LIMIT 100").all<Record<string,string>>();
          return json({notes:results.map(note=>({...note,topicLabel:noteTopics[note.topic]||note.topic}))});
        }
        if(request.method==='PUT'){
          const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,16384))) as Record<string,unknown>;
          if(body.action==='handled'){
            if(!principal.administrator)return json({error:'Administrator access required.'},403);
            if(!validId(body.id))return json({error:'Invalid note.'},400);
            await env.DB.prepare("UPDATE member_notes SET status='handled',handled_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?1").bind(body.id).run();
            return json({saved:true});
          }
          const topic=String(body.topic??''),text=String(body.body??'').trim(),workId=body.workId===undefined||body.workId===''?null:body.workId;
          if(!noteTopics[topic]||!text||text.length>4000||workId!==null&&!validId(workId))return json({error:'Pick what it’s about and write a few words.'},400);
          if(!principal.artistId&&!principal.venueId)return json({error:'Only artists and venues can write from a workspace.'},403);
          const recent=await env.DB.prepare("SELECT count(*) AS n FROM member_notes WHERE user_id=?1 AND created_at>strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 day')").bind(principal.userId).first<{n:number}>();
          if((recent?.n??0)>=10)return json({error:'That’s a lot of notes for one day. Please write to info@artistsarejerks.com instead.'},429);
          const record=async(collection:string,id:string)=>{const row=await env.DB.prepare('SELECT payload FROM community_records WHERE collection=?1 AND id=?2 AND payload IS NOT NULL').bind(collection,id).first<{payload:string}>();return row?JSON.parse(row.payload):null};
          let name='',email='',where='';
          if(principal.artistId){const artist=await record('artists',principal.artistId),application=await record('applications',principal.artistId);name=String(artist?.name||application?.name||'An artist');email=String(artist?.email||application?.email||'');where='artist'}
          else{const venue=await record('venues',principal.venueId!);name=String(venue?.contactName||venue?.name||'A venue');email=String(venue?.email||'');where=`venue: ${String(venue?.name||'')}`}
          if(!/^\S+@\S+\.\S+$/.test(email))return json({error:'Your account has no email address to answer. Please write to info@artistsarejerks.com.'},400);
          const status=await sendMemberNote(env as NotificationEnv,{name,email,topic,body:text,where});
          await env.DB.prepare('INSERT INTO member_notes(id,user_id,artist_id,venue_id,name,email,topic,work_id,body,delivery_status) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)').bind(crypto.randomUUID(),principal.userId,principal.artistId||null,principal.venueId||null,name,email,topic,workId,text,status).run();
          return json({sent:true});
        }
      }
      // The administrator's "New work" list: every piece on the site, newest first,
      // plus the ones already hidden, so a hide can be undone.
      if(url.pathname==='/api/community/admin/new-work'){
        if(!principal.administrator)return json({error:'Administrator access required.'},403);
        if(request.method==='GET'){
          const records=await loadRecords(),live=new Set(publicRecords(records).filter(record=>record.collection==='artists').map(record=>record.id));
          const items=records.filter(record=>record.collection==='artists'&&record.payload).flatMap(record=>{const artist=record.payload!,shown=new Set(visibleWorks(artist).map((work:Record<string,unknown>)=>work.id));
            return (Array.isArray(artist.works)?artist.works:[]).filter((work:Record<string,any>)=>work&&(work.hiddenByAdmin===true||live.has(record.id)&&shown.has(work.id))).map((work:Record<string,any>)=>({artistId:record.id,artistName:artist.name,workId:work.id,title:work.title,medium:work.medium||'',imageKey:work.imageKey||'',sampleImage:work.sampleImage||'',madeWithAI:work.madeWithAI===true,publicAt:work.publicAt||'',hidden:work.hiddenByAdmin===true,hiddenAt:work.hiddenAt||'',hiddenReason:work.hiddenReason||'',hiddenNotice:work.hiddenNotice||''}))});
          items.sort((a,b)=>String(b.hidden?b.hiddenAt:b.publicAt).localeCompare(String(a.hidden?a.hiddenAt:a.publicAt)));
          return json({items:items.slice(0,120)});
        }
        if(request.method==='PUT'){
          const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,4096)));
          if(!validId(body.artistId)||!validId(body.workId)||typeof body.hidden!=='boolean')return json({error:'Invalid request.'},400);
          if(!await setWorkHidden(env,body.artistId,body.workId,body.hidden,String(body.reason||'other')))return json({error:'That piece wasn’t found.'},404);
          if(!body.hidden)await env.DB.prepare("UPDATE artwork_reports SET status='dismissed',closed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE artist_id=?1 AND work_id=?2 AND status='hidden'").bind(body.artistId,body.workId).run();
          return json({saved:true});
        }
      }
      if(url.pathname==='/api/community/admin/reports'){
        if(!principal.administrator)return json({error:'Administrator access required.'},403);
        if(request.method==='GET'){
          const {results}=await env.DB.prepare("SELECT id,artist_id,work_id,reason,details,reporter_email,status,created_at FROM artwork_reports WHERE status='open' ORDER BY created_at DESC LIMIT 100").all<Record<string,string>>();
          const pages=new Map((await loadRecords()).filter(record=>record.collection==='artists'&&record.payload).map(record=>[record.id,record.payload!]));
          return json({reports:results.map(report=>{const artist=pages.get(report.artist_id),work=(artist?.works||[]).find((item:Record<string,unknown>)=>item.id===report.work_id);return {...report,reasonLabel:reportReasons[report.reason]||report.reason,artistName:artist?.name||'Unknown artist',title:work?.title||'A removed piece',imageKey:work?.imageKey||'',sampleImage:work?.sampleImage||'',hidden:work?.hiddenByAdmin===true}})});
        }
        if(request.method==='PUT'){
          const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,4096)));
          if(!validId(body.id)||!['hide','dismiss'].includes(body.action))return json({error:'Invalid request.'},400);
          const report=await env.DB.prepare("SELECT artist_id,work_id,reason FROM artwork_reports WHERE id=?1 AND status='open'").bind(body.id).first<{artist_id:string;work_id:string;reason:string}>();
          if(!report)return json({error:'That report is already closed.'},409);
          if(body.action==='hide')await setWorkHidden(env,report.artist_id,report.work_id,true,report.reason);
          // Hiding a piece settles every open report about it.
          await (body.action==='hide'
            ?env.DB.prepare("UPDATE artwork_reports SET status='hidden',closed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE artist_id=?1 AND work_id=?2 AND status='open'").bind(report.artist_id,report.work_id)
            :env.DB.prepare("UPDATE artwork_reports SET status='dismissed',closed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?1").bind(body.id)).run();
          return json({saved:true});
        }
      }
      if(url.pathname==='/api/community/messages'){
        // An administrator looking at an artist's workspace sees that artist's messages.
        const requested=url.searchParams.get('artist');
        const artistId=principal.administrator&&validId(requested)?requested:principal.artistId;
        if(!artistId)return json({error:'Only artists receive messages.'},403);
        if(request.method==='GET'){
          const {results}=await env.DB.prepare('SELECT id,sender_name,sender_email,body,delivery_status,created_at,read_at FROM artist_messages WHERE artist_id=?1 ORDER BY created_at DESC LIMIT 200').bind(artistId).all();
          return json({messages:results});
        }
        if(request.method==='PUT'){
          const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,4096)));
          if(!validId(body.id)||!['read','delete'].includes(body.action))return json({error:'Invalid message action.'},400);
          // Only the artist's own viewing marks a message read, so an administrator's look doesn't hide it.
          if(body.action==='read'&&artistId!==principal.artistId)return json({saved:false});
          const statement=body.action==='read'
            ?env.DB.prepare("UPDATE artist_messages SET read_at=coalesce(read_at,strftime('%Y-%m-%dT%H:%M:%fZ','now')) WHERE id=?1 AND artist_id=?2").bind(body.id,artistId)
            :env.DB.prepare('DELETE FROM artist_messages WHERE id=?1 AND artist_id=?2').bind(body.id,artistId);
          await statement.run();return json({saved:true});
        }
      }
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
          if(body.artistId){
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
        // An artist page goes public only after its artist agrees to the current terms.
        if(body.collection==='artists'&&!principal.administrator&&(body.payload as Record<string,unknown>|null)?.published===true&&existing?.published!==true){
          const application=await env.DB.prepare("SELECT payload FROM community_records WHERE collection='applications' AND id=?1 AND payload IS NOT NULL").bind(body.id).first<{payload:string}>();
          if(!application||JSON.parse(application.payload).terms?.version!==TERMS_VERSION)return json({error:'Please agree to the current Artist Terms before publishing.'},403);
        }
        if(body.collection==='artists'&&body.payload)settleWorks(body.payload as Record<string,unknown>,existing,new Date().toISOString());
        const payload=body.payload===null?null:JSON.stringify(body.payload);
        const result=await env.DB.prepare(`INSERT INTO community_records(collection,id,payload,revision) SELECT ?1,?2,?3,1 WHERE ?4=0
          ON CONFLICT(collection,id) DO UPDATE SET payload=?3,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE revision=?4 RETURNING revision`).bind(body.collection,body.id,payload,body.revision).first<{revision:number}>();
        // Existing records need an UPDATE when the insert SELECT has no row.
        const updated=result|| (body.revision>0?await env.DB.prepare("UPDATE community_records SET payload=?1,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE collection=?2 AND id=?3 AND revision=?4 RETURNING revision").bind(payload,body.collection,body.id,body.revision).first<{revision:number}>():null);
        // A showing published for the first time tells the artist's followers.
        if(updated&&body.collection==='artists'&&(body.payload as Record<string,unknown>|null)?.published===true&&existing?.published!==true)ctx.waitUntil(notifyPendingShowings(env as NotificationEnv,body.id).catch(error=>console.error(JSON.stringify({event:'notify_pending_error',message:error instanceof Error?error.message:String(error)}))));
        if(updated&&body.collection==='showings'&&(body.payload as Record<string,unknown>|null)?.status==='published'&&existing?.status!=='published')ctx.waitUntil(notifyFollowers(env as NotificationEnv,body.id).catch(error=>console.error(JSON.stringify({event:'notify_followers_error',message:error instanceof Error?error.message:String(error)}))));
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
  },
  // The 1st of the month runs the Privacy Notice cleanup; every day sends any "Still up?" reminders.
  async scheduled(controller:ScheduledController,env:Env,ctx:ExecutionContext){ctx.waitUntil(controller.cron==='0 10 1 * *'?cleanUp(env):sendStillUpReminders(env as NotificationEnv))}
} satisfies ExportedHandler<Env>;
