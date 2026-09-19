import {setStoredItem} from './community-storage';
import {memberUrl,deleteMemberArtist} from './member-artists';
import {readArtistApplications,saveArtistApplication,ARTIST_APPLICATIONS_KEY,type ArtistApplication} from './artist-applications';
import {populateRegionSelects} from './regions';
const element=(tag:string,text='',className='')=>{const node=document.createElement(tag);node.textContent=text;node.className=className;return node};
const link=(text:string,url:string)=>{const node=element('a',text) as HTMLAnchorElement;node.href=url;return node};
const action=(text:string,fn:()=>void)=>{const node=element('button',text) as HTMLButtonElement;node.type='button';node.addEventListener('click',fn);return node};
export function initJoin(){
 const formNode=document.querySelector<HTMLFormElement>('[data-artist-application]');if(!formNode)return;const form=formNode;
 void populateRegionSelects(form);
 const result=document.querySelector<HTMLElement>('[data-join-result]')!,choices=document.querySelector<HTMLElement>('[data-join-choices]')!,invite=document.querySelector<HTMLElement>('[data-invitation-panel]')!;
 function list(){const root=document.querySelector('[data-my-applications]')!;root.replaceChildren();readArtistApplications().forEach(a=>{const row=element('p',`${a.name}: ${a.status}${a.invitationAccepted?' · invitation accepted':''} `);if(a.status==='approved')row.append(link('Open sample invitation →',`/join/?invitation=${encodeURIComponent(a.id)}`));root.append(row)})}
 function open(){choices.hidden=true;form.hidden=false;result.hidden=true;form.scrollIntoView({block:'start',behavior:'smooth'})}
 document.querySelector('[data-open-artist]')?.addEventListener('click',open);document.querySelector('[data-close-artist]')?.addEventListener('click',()=>{form.hidden=true;choices.hidden=false});
 form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form),get=(name:string)=>String(data.get(name)||'').trim();const error=document.querySelector('[data-application-error]')!;
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

 const existing=readArtistApplications().find(a=>a.email.toLowerCase()===get('email').toLowerCase());if(existing){error.textContent=`This browser already has a ${existing.status} application for that email. Review its status below.`;return}
 const application:ArtistApplication={id:crypto.randomUUID(),name:get('name'),email:get('email'),regionId:get('regionId')||'region-rogue-valley',city:get('city'),practice:get('practice'),portfolio,note:get('note'),status:'pending',invitationAccepted:false,opportunities:data.has('opportunities')};
 try{saveArtistApplication(application)}catch{error.textContent='Unable to save in this browser. Allow local storage and try again.';return}
 form.hidden=true;result.hidden=false;result.replaceChildren(element('h2','Your request is ready for review'),element('p','In the live service, the administrator would review your work and contact you. Approval would be followed by an account invitation.'),element('p','Nothing has been emailed in this prototype.'),link('Review this sample application →','/prototype/admin/artists/'));list();
 });
 function invitation(){const id=new URLSearchParams(location.search).get('invitation');if(!id)return;invite.hidden=false;choices.hidden=true;form.hidden=true;invite.replaceChildren();const application=readArtistApplications().find(a=>a.id===id&&a.status==='approved');if(!application){invite.append(element('h2','Invitation unavailable'),element('p','Sample invitations require an approved application in this browser.'));return}
 invite.append(element('h2',application.invitationAccepted?'Welcome to the community':`You’re invited, ${application.name}`),element('p',`${application.practice} · ${application.city}`));
 if(application.invitationAccepted){invite.append(element('p','Invitation accepted in this browser. You are now selectable in the venue’s AAJ member list. Your public artist page and artwork will come after profile and upload setup.'),link('Open your artist workspace →',`/prototype/workspace/member/?artist=${encodeURIComponent(application.id)}`),link('Preview your page →',memberUrl(application.id,true)));return}
 invite.append(element('p','This simulates accepting the invitation after administrator approval. It does not create a login or publish a page.'),action('Accept sample invitation',()=>{saveArtistApplication({...application,invitationAccepted:true});invitation();list()}));
 }
 list();invitation();if(new URLSearchParams(location.search).get('kind')==='artist'&&!new URLSearchParams(location.search).has('invitation'))open();window.addEventListener('storage',e=>{if(e.key===ARTIST_APPLICATIONS_KEY){list();invitation()}});
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
