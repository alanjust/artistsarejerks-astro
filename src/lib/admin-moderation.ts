// The administrator's Reports and New work lists. Hide takes a piece off the site
// right away (the storage service enforces it); Unhide puts it back.
const make=(tag:string,text='',className='')=>{const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node};
const button=(text:string,handler:()=>void)=>{const node=make('button',text) as HTMLButtonElement;node.type='button';node.addEventListener('click',handler);return node};
export const adminImageUrl=(imageKey:string,sampleImage='')=>sampleImage||`/api/community/images/${encodeURIComponent(imageKey)}`;
export function artworkFrame(imageKey:string,sampleImage:string,alt:string){const frame=make('div','','frame');if(imageKey||sampleImage){const image=document.createElement('img');image.src=adminImageUrl(imageKey,sampleImage);image.alt=alt;image.loading='lazy';frame.append(image)}return frame}
export function aiTag(){return make('span','Made with AI','aaj-ai-label')}
const day=(value:string)=>value?new Date(value).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'';
const pageUrl=(artistId:string)=>`/prototype/artists/member/?artist=${encodeURIComponent(artistId)}`;
async function adminApi(path:string,body?:unknown){
 const response=await fetch(`/api/community/admin/${path}`,{method:body?'PUT':'GET',headers:{Accept:'application/json',...(body?{'Content-Type':'application/json','x-aaj-prototype':'local'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store'});
 const result=await response.json().catch(()=>({error:'The server returned an unreadable response.'}));
 if(!response.ok)throw new Error(result.error||'That didn’t go through.');
 return result;
}
type Report={id:string;artist_id:string;work_id:string;reasonLabel:string;details:string;reporter_email:string;created_at:string;artistName:string;title:string;imageKey:string;sampleImage:string;hidden:boolean};
type Item={artistId:string;artistName:string;workId:string;title:string;medium:string;imageKey:string;sampleImage:string;madeWithAI:boolean;publicAt:string;hidden:boolean;hiddenAt:string};

export function initModeration(){
 const reportsSection=document.querySelector<HTMLElement>('[data-reports]'),reportList=document.querySelector<HTMLElement>('[data-report-list]'),workList=document.querySelector<HTMLElement>('[data-new-work-list]'),status=document.querySelector<HTMLElement>('[data-inbox-status]'),reportCount=document.querySelector<HTMLElement>('[data-report-count]');
 if(!reportsSection||!reportList||!workList)return;
 const say=(text:string)=>{if(status)status.textContent=text};
 async function act(label:string,run:()=>Promise<unknown>,done:string){say(label);try{await run();say(done);await render()}catch(error){say(error instanceof Error?error.message:'That didn’t go through.')}}
 async function renderReports(){
  const {reports}=await adminApi('reports') as {reports:Report[]};
  reportsSection!.hidden=!reports.length;
  if(reportCount)reportCount.textContent=reports.length?`Reports (${reports.length})`:'Reports';
  reportList!.replaceChildren(...reports.map(report=>{
   const card=make('article','','card report-card');
   const copy=make('div');
   const heading=make('h3');heading.append(document.createTextNode(`“${report.title}” by `),Object.assign(make('a',report.artistName),{href:pageUrl(report.artist_id)}));
   copy.append(heading,make('p',report.reasonLabel));
   if(report.details)copy.append(make('p',report.details));
   copy.append(make('p',`Reported ${day(report.created_at)}${report.reporter_email?` by ${report.reporter_email}`:' anonymously'}${report.hidden?' · already hidden':''}`));
   const actions=make('div','','actions');
   if(!report.hidden)actions.append(button('Hide the piece',()=>void act(`Hiding “${report.title}”…`,()=>adminApi('reports',{id:report.id,action:'hide'}),`“${report.title}” is off the site.`)));
   actions.append(button(report.hidden?'Close this report':'Dismiss',()=>void act('Saving…',()=>adminApi('reports',{id:report.id,action:'dismiss'}),'Report closed.')));
   copy.append(actions);
   card.append(artworkFrame(report.imageKey,report.sampleImage,report.title),copy);
   return card;
  }));
 }
 async function renderNewWork(){
  const {items}=await adminApi('new-work') as {items:Item[]};
  if(!items.length){workList!.replaceChildren(make('p','Nothing is on the site yet.'));return}
  workList!.replaceChildren(...items.map(item=>{
   const tile=make('figure','',`moderation-tile${item.hidden?' is-hidden':''}`);
   const caption=make('figcaption');
   caption.append(make('p',item.title,'tile-title'));
   const by=make('p','','tile-meta');by.append(Object.assign(make('a',item.artistName),{href:pageUrl(item.artistId)}));caption.append(by);
   caption.append(make('p',item.hidden?`Hidden ${day(item.hiddenAt)}`:item.publicAt?`Added ${day(item.publicAt)}`:'Added before tracking began',item.hidden?'hidden-flag':'tile-meta'));
   if(item.madeWithAI)caption.append(aiTag());
   tile.append(artworkFrame(item.imageKey,item.sampleImage,item.title),caption,item.hidden
    ?button('Unhide',()=>void act(`Putting “${item.title}” back…`,()=>adminApi('new-work',{artistId:item.artistId,workId:item.workId,hidden:false}),`“${item.title}” is back on the site.`))
    :button('Hide',()=>void act(`Hiding “${item.title}”…`,()=>adminApi('new-work',{artistId:item.artistId,workId:item.workId,hidden:true}),`“${item.title}” is off the site.`)));
   return tile;
  }));
 }
 async function render(){
  try{await Promise.all([renderReports(),renderNewWork()])}
  catch(error){say(error instanceof Error?error.message:'The moderation lists couldn’t load.')}
 }
 void render();
}
