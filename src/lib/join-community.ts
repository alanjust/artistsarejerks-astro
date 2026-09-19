import {setStoredItem} from './community-storage';
import {deleteMemberArtist} from './member-artists';
import {readArtistApplications,saveArtistApplication,ARTIST_APPLICATIONS_KEY} from './artist-applications';
import {populateRegionSelects} from './regions';
import {applicationApi,type SharedApplication} from './shared-applications';
const element=(tag:string,text='',className='')=>{const node=document.createElement(tag);node.textContent=text;node.className=className;return node};
const link=(text:string,url:string)=>{const node=element('a',text) as HTMLAnchorElement;node.href=url;return node};
const action=(text:string,fn:()=>void)=>{const node=element('button',text) as HTMLButtonElement;node.type='button';node.addEventListener('click',fn);return node};
export function initJoin(){
 const formNode=document.querySelector<HTMLFormElement>('[data-artist-application]');if(!formNode)return;const form=formNode;
 void populateRegionSelects(form);
 const result=document.querySelector<HTMLElement>('[data-join-result]')!,choices=document.querySelector<HTMLElement>('[data-join-choices]')!,invite=document.querySelector<HTMLElement>('[data-invitation-panel]')!;
 let own:SharedApplication[]=[];
 async function list(){const root=document.querySelector('[data-my-applications]')!;try{own=(await applicationApi()).applications.filter(entry=>entry.kind==='artist');root.replaceChildren();if(!own.length)root.append(element('p','You have not submitted an artist application.'));own.forEach(({id,payload:a})=>{const row=element('p',`${a.name}: ${a.status}${a.invitationAccepted?' · invitation accepted':''} `);if(a.status==='approved'&&!a.invitationAccepted)row.append(link('Accept invitation →',`/join/?invitation=${encodeURIComponent(id)}`));root.append(row)})}catch(error){root.replaceChildren(element('p',error instanceof Error?error.message:'Sign in to submit and review an application.'))}}
 function open(){choices.hidden=true;form.hidden=false;result.hidden=true;form.scrollIntoView({block:'start',behavior:'smooth'})}
 document.querySelector('[data-open-artist]')?.addEventListener('click',open);document.querySelector('[data-close-artist]')?.addEventListener('click',()=>{form.hidden=true;choices.hidden=false});
 form.addEventListener('submit',async event=>{event.preventDefault();const data=new FormData(form),get=(name:string)=>String(data.get(name)||'').trim();const error=document.querySelector('[data-application-error]')!;
 if(['name','practice','note'].some(name=>!get(name))){error.textContent='Please enter your name, media, and a short description of your work.';return}
 let portfolio='';
 if(get('portfolio')){
  try{
   const entered=get('portfolio');
   const url=new URL(/^[a-z][a-z0-9+.-]*:/i.test(entered)?entered:`https://${entered}`);
   if(!['http:','https:'].includes(url.protocol)||!url.hostname.includes('.')||url.username||url.password||/\s/.test(entered))throw new Error('Invalid website');
   portfolio=url.href;
  }catch{error.textContent='Enter a website address such as yourwebsite.com, or leave it blank.';return}
 }

 const payload={name:get('name'),email:get('email'),regionId:get('regionId')||'region-rogue-valley',city:get('city'),practice:get('practice'),portfolio,note:get('note'),opportunities:data.has('opportunities')};
 try{await applicationApi({kind:'artist',payload})}catch(cause){error.textContent=cause instanceof Error?cause.message:'Unable to submit this application.';return}
 form.hidden=true;result.hidden=false;result.replaceChildren(element('h2','Your request is awaiting review'),element('p','The application is saved to your signed-in account. An administrator can now review it in the application inbox.'));await list();
 });
 async function invitation(){const id=new URLSearchParams(location.search).get('invitation');if(!id)return;invite.hidden=false;choices.hidden=true;form.hidden=true;invite.replaceChildren();if(!own.length)await list();const entry=own.find(application=>application.id===id&&application.payload.status==='approved');if(!entry){invite.append(element('h2','Invitation unavailable'),element('p','This invitation must belong to the signed-in applicant and have administrator approval.'));return}const application=entry.payload;
 invite.append(element('h2',application.invitationAccepted?'Welcome to the community':`You’re invited, ${application.name}`),element('p',`${application.practice} · ${application.city}`));
 if(application.invitationAccepted){invite.append(element('p','Invitation accepted. An administrator can now assign your artist workspace to this account.'));return}
 invite.append(element('p','Accepting confirms that this signed-in account belongs to the approved applicant.'),action('Accept invitation',()=>void (async()=>{try{await applicationApi({action:'accept',id});await list();await invitation()}catch(error){invite.append(element('p',error instanceof Error?error.message:'Unable to accept this invitation.'))}})()));
 }
 void (async()=>{await list();await invitation()})();if(new URLSearchParams(location.search).get('kind')==='artist'&&!new URLSearchParams(location.search).has('invitation'))open();
}
export function initArtistReview(){
 const root=document.querySelector('[data-artist-review]');if(!root)return;
 function render(){root!.replaceChildren();const records=readArtistApplications();if(!records.length)root!.append(element('p','No artist requests yet. Submit a sample request from Join the Community.'));
 records.forEach(a=>{const card=element('article','','card');card.append(element('h2',a.name),element('p',`${a.status} · ${a.city} · ${a.practice}`),element('p',`Private contact: ${a.email}`),element('p',a.note),element('p',a.opportunities?'Opted into venue opportunities after approval':'No venue opportunity emails requested'));if(a.portfolio&&/^https?:\/\//i.test(a.portfolio))card.append(link('Review portfolio ↗',a.portfolio));
 const actions=element('div','','actions');if(a.status!=='approved'){actions.append(action('Approve & preview invitation',()=>{saveArtistApplication({...a,status:'approved'});render()}));if(a.status!=='declined')actions.append(action('Decline request',()=>{saveArtistApplication({...a,status:'declined'});render()}))}
 if(a.status==='approved'){const url=`/join/?invitation=${encodeURIComponent(a.id)}`;card.append(element('h3','Sample account invitation'),element('p',`To: ${a.email}`),element('p',`Hello ${a.name}, your request to join Artists Are Jerks has been approved. Accept your invitation to begin setting up your artist profile.`),link('Open sample acceptance page →',url));actions.append(action('Simulate sending invitation',()=>{document.querySelector('[data-artist-review-status]')!.textContent=`Invitation simulated for ${a.name}. No email was sent.`}))}
 actions.append(action('Delete sample request',()=>{setStoredItem(ARTIST_APPLICATIONS_KEY,JSON.stringify(readArtistApplications().filter(item=>item.id!==a.id)));void deleteMemberArtist(a.id).catch(()=>{});render()}));card.append(actions);root!.append(card)});
 }
 render();window.addEventListener('storage',e=>{if(e.key===ARTIST_APPLICATIONS_KEY)render()});
}
