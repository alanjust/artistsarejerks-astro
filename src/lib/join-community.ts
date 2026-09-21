import {populateRegionSelects} from './regions';
import {applicationApi,type SharedApplication} from './shared-applications';
const element=(tag:string,text='',className='')=>{const node=document.createElement(tag);node.textContent=text;node.className=className;return node};
const link=(text:string,url:string)=>{const node=element('a',text) as HTMLAnchorElement;node.href=url;return node};
const workspaceUrl=(id:string)=>`/prototype/workspace/member/?artist=${encodeURIComponent(id)}`;
// A "where can we see your work" answer that is just a web address doubles as the portfolio link.
function portfolioFrom(answer:string){
 if(/\s/.test(answer)||!answer.includes('.'))return '';
 try{const url=new URL(/^[a-z][a-z0-9+.-]*:/i.test(answer)?answer:`https://${answer}`);return ['http:','https:'].includes(url.protocol)&&url.hostname.includes('.')&&!url.username&&!url.password?url.href:''}catch{return ''}
}
export function initJoin(){
 const choices=document.querySelector<HTMLElement>('[data-join-choices]'),form=document.querySelector<HTMLFormElement>('[data-artist-application]'),prompt=document.querySelector<HTMLElement>('[data-signup-prompt]');
 const result=document.querySelector<HTMLElement>('[data-join-result]'),existing=document.querySelector<HTMLElement>('[data-existing-application]'),listRoot=document.querySelector<HTMLElement>('[data-my-applications]');
 if(!choices)return;
 let own:SharedApplication[]=[];
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
 function open(){const current=active();if(current)showExisting(current);else show(form??prompt)}
 document.querySelector('[data-open-artist]')?.addEventListener('click',open);
 document.querySelectorAll('[data-close-artist]').forEach(button=>button.addEventListener('click',()=>show(choices)));
 if(form){
  void populateRegionSelects(form).then(()=>{const select=form.querySelector<HTMLSelectElement>('[data-region-select]');const field=form.querySelector<HTMLElement>('[data-region-field]');if(field&&select)field.hidden=select.options.length<=1});
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   const data=new FormData(form),get=(name:string)=>String(data.get(name)||'').trim(),error=form.querySelector('[data-application-error]')!;
   if(['name','city','practice','where'].some(name=>!get(name))){error.textContent='Please fill in all four: your name, your city, what you make, and where we can see it.';return}
   const button=form.querySelector<HTMLButtonElement>('button:not([type])');if(button)button.disabled=true;error.textContent='Sending…';
   try{
    const saved=await applicationApi({kind:'artist',payload:{name:get('name'),email:'',regionId:get('regionId')||'region-rogue-valley',city:get('city'),practice:get('practice'),portfolio:portfolioFrom(get('where')),note:get('where'),opportunities:false}});
    await list();
    if(result&&saved.id){result.replaceChildren(element('h2','Got it'),element('p','A real person looks at every request, usually within a few days. You don’t have to wait, though. Your page is already open, and you can start putting work in it now. Nothing goes public until you’re approved.'),link('Start your page →',workspaceUrl(saved.id)));show(result)}
   }catch(cause){error.textContent=cause instanceof Error?cause.message:'Unable to send this request.'}
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
