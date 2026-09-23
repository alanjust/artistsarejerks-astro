import {populateRegionSelects} from './regions';
import {applicationApi,type SharedApplication} from './shared-applications';
const element=(tag:string,text='',className='')=>{const node=document.createElement(tag);node.textContent=text;node.className=className;return node};
const link=(text:string,url:string)=>{const node=element('a',text) as HTMLAnchorElement;node.href=url;return node};
const workspaceUrl=(id:string)=>`/prototype/workspace/member/?artist=${encodeURIComponent(id)}`;
// A "where can we see your work" answer that is just a web address doubles as the portfolio link.
// Sends one photo straight to storage. The applicant's page already exists, so the
// photo belongs to them from the start.
async function uploadPhoto(key:string,file:File){
 const response=await fetch(`/api/community/images/${encodeURIComponent(key)}`,{method:'PUT',headers:{'x-aaj-prototype':'local','Content-Type':file.type},body:file});
 if(!response.ok){const body=await response.json().catch(()=>({})) as {error?:string};throw new Error(body.error||'A photo didn’t upload.')}
}
type Pick={file:File;url:string;title:string;ai:boolean;key:string};
function portfolioFrom(answer:string){
 if(/\s/.test(answer)||!answer.includes('.'))return '';
 try{const url=new URL(/^[a-z][a-z0-9+.-]*:/i.test(answer)?answer:`https://${answer}`);return ['http:','https:'].includes(url.protocol)&&url.hostname.includes('.')&&!url.username&&!url.password?url.href:''}catch{return ''}
}
export function initJoin(){
 const choices=document.querySelector<HTMLElement>('[data-join-choices]'),form=document.querySelector<HTMLFormElement>('[data-artist-application]'),prompt=document.querySelector<HTMLElement>('[data-signup-prompt]');
 const result=document.querySelector<HTMLElement>('[data-join-result]'),existing=document.querySelector<HTMLElement>('[data-existing-application]'),listRoot=document.querySelector<HTMLElement>('[data-my-applications]');
 if(!choices)return;
 let own:SharedApplication[]=[];
 let picks:Pick[]=[];
 // A request saved before its pieces arrived only needs the pieces.
 const waitingForPieces=()=>own.find(entry=>entry.payload.status==='pending'&&!(Array.isArray(entry.payload.samples)&&entry.payload.samples.length));
 const active=()=>own.find(entry=>entry.payload.status!=='declined');
 const show=(panel:HTMLElement|null)=>{for(const node of [choices,form,prompt,result,existing])if(node)node.hidden=node!==panel;panel?.scrollIntoView({block:'start',behavior:'smooth'})};
 function describe(entry:SharedApplication){
  const status=String(entry.payload.status);
  return status==='approved'?'You’re approved. Your page can go live whenever you publish it.':'Your request is with us. While you wait, your page is open, and you can start putting work in it. Nothing goes public until you’re approved.';
 }
 function showExisting(entry:SharedApplication){
  if(!existing)return;
  existing.replaceChildren(element('h2',entry.payload.status==='approved'?`Welcome, ${entry.payload.name}`:'You’ve already asked'),element('p',describe(entry)));
  if(entry.assignedArtistId===entry.id)existing.append(link('Open your page →',workspaceUrl(entry.id)));
  show(existing);
 }
 async function list(){
  if(!form)return;
  try{
   own=(await applicationApi()).applications.filter(entry=>entry.kind==='artist');
   listRoot?.replaceChildren();
   if(!own.length)listRoot?.append(element('p','You haven’t sent an artist request yet.'));
   own.forEach(entry=>{const row=element('p',`${entry.payload.name}: ${entry.payload.status} `);if(entry.assignedArtistId===entry.id)row.append(link('Open your page →',workspaceUrl(entry.id)));listRoot?.append(row)});
  }catch(error){listRoot?.replaceChildren(element('p',error instanceof Error?error.message:'Unable to load your requests.'))}
 }
 function piecesOnly(on:boolean){
  if(!form)return;
  const about=form.querySelector<HTMLElement>('[data-about-fields]')!;about.hidden=on;
  about.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('input,textarea,select').forEach(field=>field.disabled=on);
  form.querySelector('[data-application-title]')!.textContent=on?'One more thing: your pieces':'Tell us who you are';
  form.querySelector('[data-application-intro]')!.textContent=on?'Your request is saved. We just need two or three pieces to look at before it goes to review.':'A few quick things, and two or three pieces. A real person reads every request.';
 }
 function open(){const current=active();if(current&&current===waitingForPieces()){piecesOnly(true);show(form)}else if(current)showExisting(current);else{piecesOnly(false);show(form??prompt)}}
 document.querySelector('[data-open-artist]')?.addEventListener('click',open);
 document.querySelectorAll('[data-close-artist]').forEach(button=>button.addEventListener('click',()=>show(choices)));
 if(form){
  const pickList=form.querySelector<HTMLElement>('[data-sample-picks]')!,picker=form.querySelector<HTMLInputElement>('[data-sample-input]')!,addLabel=form.querySelector<HTMLElement>('[data-sample-add]')!,error=form.querySelector('[data-application-error]')!;
  function renderPicks(){
   pickList.replaceChildren(...picks.map((pick,index)=>{
    const row=element('div','','sample-pick'),image=document.createElement('img');image.src=pick.url;image.alt=pick.title||`Piece ${index+1}`;
    const fields=element('div','','sample-pick-fields');
    const title=element('label','Title ');title.append(element('small','optional'));const titleInput=document.createElement('input');titleInput.maxLength=200;titleInput.placeholder='Untitled';titleInput.value=pick.title;titleInput.addEventListener('input',()=>{pick.title=titleInput.value});title.append(titleInput);
    const ai=element('label','','check');const aiInput=document.createElement('input');aiInput.type='checkbox';aiInput.checked=pick.ai;aiInput.addEventListener('change',()=>{pick.ai=aiInput.checked});ai.append(aiInput,document.createTextNode(' Made with AI'));
    const remove=element('button','Remove','remove-sample') as HTMLButtonElement;remove.type='button';remove.addEventListener('click',()=>{URL.revokeObjectURL(pick.url);picks=picks.filter(item=>item!==pick);renderPicks()});
    fields.append(title,ai,remove);row.append(image,fields);return row;
   }));
   addLabel.hidden=picks.length>=3;
   addLabel.firstChild!.textContent=picks.length?'Add another photo':'Add a photo';
  }
  picker.addEventListener('change',async()=>{
   error.textContent='';
   for(const file of [...picker.files??[]]){
    if(picks.length>=3){error.textContent='Three is the most. Remove one to swap it out.';break}
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){error.textContent=`“${file.name}” isn’t a JPEG, PNG, or WebP up to 10 MB.`;continue}
    try{const decoded=await createImageBitmap(file);decoded.close()}catch{error.textContent=`“${file.name}” couldn’t be read as an image.`;continue}
    picks.push({file,url:URL.createObjectURL(file),title:'',ai:false,key:''});
   }
   picker.value='';renderPicks();
  });
  renderPicks();
  void populateRegionSelects(form).then(()=>{const select=form.querySelector<HTMLSelectElement>('[data-region-select]');const field=form.querySelector<HTMLElement>('[data-region-field]');if(field&&select)field.hidden=select.options.length<=1});
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   const data=new FormData(form),get=(name:string)=>String(data.get(name)||'').trim(),resuming=waitingForPieces();
   if(!resuming&&['name','city','practice','where'].some(name=>!get(name))){error.textContent='Please fill in your name, your city, what you make, and where we can see it.';return}
   if(picks.length<2){error.textContent=picks.length?'Add one more piece. We need at least two.':'Add two or three photos of your work.';return}
   const button=form.querySelector<HTMLButtonElement>('button:not([type])');if(button)button.disabled=true;error.textContent='Sending…';
   try{
    // The request opens the page; the photos go into it; then the request is complete.
    let id=resuming?.id;
    if(!id){id=(await applicationApi({kind:'artist',payload:{name:get('name'),email:'',regionId:get('regionId')||'region-rogue-valley',city:get('city'),practice:get('practice'),portfolio:portfolioFrom(get('where')),note:get('where'),opportunities:false}})).id;await list()}
    if(!id)throw new Error('Unable to send this request.');
    for(const [index,pick] of picks.entries()){error.textContent=`Uploading photo ${index+1} of ${picks.length}…`;pick.key||=crypto.randomUUID();await uploadPhoto(pick.key,pick.file)}
    await applicationApi({action:'samples',id,works:picks.map(pick=>({imageKey:pick.key,title:pick.title.trim(),madeWithAI:pick.ai}))});
    picks.forEach(pick=>URL.revokeObjectURL(pick.url));picks=[];renderPicks();error.textContent='';
    await list();piecesOnly(false);
    if(result){result.replaceChildren(element('h2','Got it'),element('p','A real person looks at every request, usually within a few days. You don’t have to wait, though. Your page is already open, with your pieces in it, and you can keep adding to it now. Nothing goes public until you’re approved.'),link('Start your page →',workspaceUrl(id)));show(result)}
   }catch(cause){
    error.textContent=`${cause instanceof Error?cause.message:'Unable to send this request.'}${waitingForPieces()?' Your request is saved; try sending the pieces again.':''}`;
    if(waitingForPieces())piecesOnly(true);
   }
   finally{if(button)button.disabled=false}
  });
 }
 void (async()=>{
  await list();
  // Older invitation links now simply lead to the applicant's page.
  const params=new URLSearchParams(location.search),invited=params.get('invitation');
  const entry=invited?own.find(item=>item.id===invited):undefined;
  if(entry)showExisting(entry);else if(params.get('kind')==='artist')open();
 })();
}
