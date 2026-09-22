import {storageReady} from './community-storage';
import pilot from '../data/community-pilot.json';
import {getMemberArtist} from './member-artists';
import {readArtistApplications} from './artist-applications';
import {readVenues,saveVenue,availableVenues,seedLeo,venueProfileUrl,VENUES_KEY,type VenueRecord} from './prototype-venues';
import {readShowings,showingStatus,renderShowings} from './prototype-showings';
import {populateRegionSelects} from './regions';
const node=(tag:string,text='',className='')=>{const el=document.createElement(tag);el.textContent=text;el.className=className;return el};
const anchor=(text:string,href:string)=>{const a=node('a',text) as HTMLAnchorElement;a.href=href;return a};
const button=(text:string,action:()=>void)=>{const b=node('button',text) as HTMLButtonElement;b.type='button';b.addEventListener('click',action);return b};
const approvedMembers=[...pilot.artists.filter(a=>a.admission==='invited-and-approved'&&a.adminVisibility==='visible').map(a=>({id:a.id,name:a.name,homeCity:a.homeCity,opportunities:true})),...readArtistApplications().filter(a=>a.status==='approved'&&a.invitationAccepted).map(a=>({id:a.id,name:a.name,homeCity:a.city,opportunities:a.opportunities}))];
const opportunityMembers=approvedMembers.filter(a=>a.opportunities);
export async function initVenueWorkspace(){await storageReady;
 const formNode=document.querySelector<HTMLFormElement>('#venue-intake');if(!formNode)return;const form=formNode;
 void populateRegionSelects(form);
 const ownedVenue=document.querySelector<HTMLElement>('[data-owned-venue]')?.dataset.ownedVenue;
 const selector=document.querySelector<HTMLSelectElement>('[data-working-venue]')!;
 const status=document.querySelector<HTMLElement>('[data-venue-status]')!;
 const tools=document.querySelector<HTMLElement>('[data-approved-tools]')!;
 const result=document.querySelector<HTMLElement>('[data-intake-result]')!;
 const fields=['name','type','regionId','city','address','postalCode','description','website','phone','hours','accessibility','instructions','contactName','email','opportunities'];
 let active:VenueRecord|null=null;let campaign:VenueRecord['campaigns'][number]|null=null;
 const value=(name:string)=>form.elements.namedItem(name) as HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement;
 function persist(record:VenueRecord){try{saveVenue(record);active=record;return true}catch{result.textContent='Browser storage is unavailable. Enable storage and try again.';return false}}
 function options(){if(ownedVenue){const venue=readVenues().find(v=>v.id===ownedVenue);selector.replaceChildren(new Option(venue?.name||'Your venue',ownedVenue));selector.disabled=true;return}selector.replaceChildren(new Option('Start a new application','new'),new Option('Claim Leo’s sample listing','venue-leos-brewpub'));readVenues().filter(v=>v.id!=='venue-leos-brewpub').forEach(v=>selector.add(new Option(v.name,v.id)));selector.value=active?.id||'new'}
 function reflect(){
  const approved=active?.status==='approved';tools.hidden=!approved||Boolean(ownedVenue);
  status.textContent=active?`${active.name} · ${active.status}${!active.visible?' · Public visibility removed by administrator':''}`:'Start a new application, or claim Leo’s sample listing.';
  document.querySelector('[data-venue-submit]')!.textContent=approved?'Save venue details':'Submit for administrator approval';
  document.querySelector<HTMLAnchorElement>('[data-public-venue]')!.href=venueProfileUrl(active?.id||'');
  const members=document.querySelector('[data-venue-members]')!;members.replaceChildren();
  approvedMembers.forEach(artist=>{const label=node('label','','check');const input=document.createElement('input');input.type='checkbox';input.value=artist.id;input.dataset.memberId=artist.id;input.checked=active?.memberIds.includes(artist.id)||false;label.append(input,node('span',`${artist.name} · ${artist.homeCity}`));members.append(label)});
  const opportunity=document.querySelector<HTMLFormElement>('[data-opportunity-form]')!;(opportunity.elements.namedItem('subject') as HTMLInputElement).value=active?`${active.name} is available to host artists`:'';(opportunity.elements.namedItem('body') as HTMLTextAreaElement).value=active?.opportunities||'';
  const history=document.querySelector('[data-campaign-history]')!;history.replaceChildren();(active?.campaigns||[]).forEach(c=>history.append(node('p',`${c.subject} · ${c.recipients.length} simulated recipients · ${new Date(c.createdAt).toLocaleString()}`)));
 }
 function load(id:string){active=readVenues().find(v=>v.id===id)|| (id==='venue-leos-brewpub'?seedLeo():null);form.reset();fields.forEach(name=>{if(active)value(name).value=String(active[name as keyof VenueRecord]||(name==='regionId'?'region-rogue-valley':''))});(value('available') as HTMLInputElement).checked=active?.available??true;result.textContent='';document.querySelector<HTMLElement>('[data-campaign-preview]')!.hidden=true;campaign=null;reflect();}
 function collect(statusValue:VenueRecord['status']):VenueRecord{
  const previous=active||{...seedLeo(),id:crypto.randomUUID(),name:'',memberIds:[],campaigns:[]};
  const record={...previous,status:statusValue,available:(value('available') as HTMLInputElement).checked};fields.forEach(name=>Object.assign(record,{[name]:value(name).value.trim()}));return record;
 }
 function valid(){if(!form.reportValidity())return false;for(const name of ['name','address','contactName'])if(!value(name).value.trim()){result.textContent='Enter a venue name, street address, and contact person.';return false}if(value('website').value&&!/^https?:\/\//i.test(value('website').value)){result.textContent='Use an http:// or https:// website address.';return false}return true}
 selector.addEventListener('change',()=>load(selector.value));
 document.querySelector('[data-venue-draft]')?.addEventListener('click',()=>{if(!valid())return;const next=collect(active?.status==='approved'?'approved':'draft');if(persist(next)){options();reflect();result.textContent=next.status==='approved'?'Venue details saved.':'Draft saved; not submitted for approval.'}});
 form.addEventListener('submit',e=>{e.preventDefault();if(!valid())return;const next=collect(active?.status==='approved'?'approved':'pending');if(persist(next)){options();reflect();result.replaceChildren(node('span',next.status==='approved'?'Venue details queued for saving; check the top banner for confirmation.':'Application submitted for administrator review.'));if(!ownedVenue)result.append(anchor('Open prototype review →','/prototype/admin/venues/'))}});
 document.querySelector('[data-save-members]')?.addEventListener('click',()=>{if(active?.status!=='approved')return;const memberIds=[...document.querySelectorAll<HTMLInputElement>('[data-member-id]:checked')].map(i=>i.value).filter(id=>approvedMembers.some(a=>a.id===id));if(persist({...active,memberIds}))document.querySelector('[data-member-result]')!.textContent='Private artist list saved. No public showing was created.'});
 function previewEmail(kind:string,subject:string,body:string,recipients:string[]){if(active?.status!=='approved')return;campaign={kind,subject,body,recipients,createdAt:new Date().toISOString()};document.querySelector<HTMLElement>('[data-campaign-preview]')!.hidden=false;document.querySelector('[data-campaign-subject]')!.textContent=subject;document.querySelector('[data-campaign-body]')!.textContent=body;document.querySelector('[data-campaign-audience]')!.textContent=kind==='opportunity'?`Sample opted-in AAJ members: ${opportunityMembers.map(a=>a.name).join(', ')}`:`Outside invitees: ${recipients.join(', ')}`;document.querySelector('[data-campaign-result]')!.textContent='';document.querySelector('[data-campaign-preview]')?.scrollIntoView({block:'start',behavior:'smooth'});}
 document.querySelector<HTMLFormElement>('[data-opportunity-form]')?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget as HTMLFormElement);previewEmail('opportunity',String(data.get('subject')).trim(),`${String(data.get('body')).trim()}\n\nVenue: ${active?.name}\n${active?.city}, Oregon\nReply with interest to coordinate with the venue. Artists create all dated showings.\n\nYou receive this because you opted into venue opportunities. [Manage email preferences]`,opportunityMembers.map(a=>a.id))});
 document.querySelector<HTMLFormElement>('[data-invitation-form]')?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget as HTMLFormElement);const emails=[...new Set(String(data.get('emails')).split(/[\s,;]+/).filter(Boolean))];const error=document.querySelector('[data-invite-error]')!;if(!emails.length||emails.some(email=>!/^\S+@\S+\.\S+$/.test(email))){error.textContent='Enter valid email addresses, separated by lines or commas.';return}error.textContent='';previewEmail('invitation',`${active?.name} invites you to explore Artists Are Jerks`,`${String(data.get('body')).trim()}\n\nExplore Artists Are Jerks: https://artistsarejerks.com\nAsk to join: ${location.origin}/join/?kind=artist\n\nMembership requires administrator approval. This invitation does not create an account or a showing.`,emails)});
 document.querySelector('[data-campaign-cancel]')?.addEventListener('click',()=>{campaign=null;document.querySelector<HTMLElement>('[data-campaign-preview]')!.hidden=true});
 document.querySelector('[data-campaign-confirm]')?.addEventListener('click',()=>{const current=readVenues().find(v=>v.id===active?.id);if(!campaign||current?.status!=='approved'){document.querySelector('[data-campaign-result]')!.textContent='The venue must be approved before preparing a send.';return}if(persist({...current,campaigns:[...current.campaigns,campaign]})){campaign=null;reflect();document.querySelector('[data-campaign-result]')!.textContent='Simulated send recorded. No email was sent; no memberships were created.'}});
 window.addEventListener('storage',e=>{if(e.key===VENUES_KEY){const id=active?.id;options();if(id)load(id)}});
 const requested=new URLSearchParams(location.search).get('venue');options();if(requested)selector.value=requested;load(selector.value);
}
export async function initVenueAdmin(){await storageReady;
 const root=document.querySelector('[data-admin-venues]');if(!root)return;
 function render(){root!.replaceChildren();const records=readVenues();if(!records.length)root!.append(node('p','No venue applications yet. Submit a venue application first.'));
 records.forEach(venue=>{const card=node('article','','card');card.append(node('h2',venue.name),node('p',`${venue.status} · ${venue.city} · ${venue.type}`),node('p',`${venue.address} ${venue.postalCode}`),node('p',venue.description),node('p',`Private contact: ${venue.contactName} · ${venue.email}`),node('p',venue.opportunities));
 const action=(status:VenueRecord['status'],visible=venue.visible)=>{saveVenue({...venue,status,visible});render();document.querySelector('[data-admin-result]')!.textContent=`${venue.name}: ${status}, ${visible?'visible':'hidden'}.`};
 const actions=node('div','','actions');
 if(venue.status==='pending'||venue.status==='declined')actions.append(button('Approve venue',()=>action('approved',true)),button('Decline application',()=>action('declined',false)));
 if(venue.status==='approved')actions.append(button(venue.visible?'Remove public visibility':'Restore public visibility',()=>action('approved',!venue.visible)),anchor('Public venue page →',venueProfileUrl(venue.id)));
 card.append(actions,anchor('Venue workspace →',`/prototype/venues/workspace/?venue=${encodeURIComponent(venue.id)}`));root!.append(card);
 });}
 render();window.addEventListener('storage',e=>{if(e.key===VENUES_KEY)render()});
}
export async function initVenueDirectory(){await storageReady;
 const root=document.querySelector('[data-venue-directory]');if(!root)return;
 const city=document.querySelector<HTMLSelectElement>('[data-venue-city]')!,search=document.querySelector<HTMLInputElement>('[data-venue-search]')!;
 function render(){root!.replaceChildren();const raw=readVenues();const leo=raw.find(v=>v.id==='venue-leos-brewpub');const records=availableVenues();if(!leo)records.unshift({...seedLeo(),status:'approved',available:false});else if(leo.status!=='approved'&&leo.visible)records.unshift({...seedLeo(),available:false});
 records.filter(v=>(!city.value||v.city===city.value)&&`${v.name} ${v.type}`.toLowerCase().includes(search.value.trim().toLowerCase())).forEach(v=>{const card=node('article','','card');const h=node('h2');h.append(anchor(v.name,v.id==='venue-leos-brewpub'?'/prototype/venues/leos-brewpub-and-grill/':venueProfileUrl(v.id)));const artists=new Set([...pilot.exhibitions.filter(s=>s.venueId===v.id&&s.publicationStatus==='published'&&showingStatus({start:s.startDate,end:s.endDate})==='showing-now').map(s=>s.artistId),...readShowings().filter(s=>s.venueId===v.id&&s.status==='published'&&showingStatus(s)==='showing-now'&&(pilot.artists.some(a=>a.id===s.artistId)||getMemberArtist(s.artistId)?.published)).map(s=>s.artistId)]);card.append(h,node('p',`${v.city} · ${v.type}`),node('p',artists.size?`Showing now: ${[...artists].map(id=>pilot.artists.find(a=>a.id===id)?.name||getMemberArtist(id)?.name).filter(Boolean).join(', ')}`:v.available?'Available to host artists':'No current showing'),node('p',v.description));root!.append(card)});document.querySelector<HTMLElement>('[data-venue-empty]')!.hidden=Boolean(root!.children.length)}
 city.addEventListener('change',render);search.addEventListener('input',render);render();window.addEventListener('storage',e=>{if(e.key===VENUES_KEY)render()});
}
export async function initVenueProfile(){await storageReady;
 const id=new URLSearchParams(location.search).get('venue'),venue=availableVenues().find(v=>v.id===id);const root=document.querySelector('[data-venue-profile]')!;const heading=document.querySelector('[data-venue-name]')!;const shows=document.querySelector<HTMLElement>('[data-browser-showings]')!;
 if(!venue){heading.textContent='Venue unavailable';document.querySelector<HTMLElement>('[data-venue-unavailable]')!.hidden=false;shows.dataset.venue='';renderShowings(shows);return}
 heading.textContent=venue.name;document.title=`${venue.name} | Artists Are Jerks`;root.append(node('p',`${venue.city} · ${venue.type}`),node('p',venue.description));
 const card=node('section','','card');card.append(node('h2','Plan a visit'),node('p',`${venue.address}, ${venue.city}, Oregon ${venue.postalCode}`));
 if(venue.website)card.append(anchor('Venue website ↗',venue.website));if(venue.phone)card.append(node('p',venue.phone));
 for(const [title,text] of [['Hours',venue.hours],['Accessibility',venue.accessibility],['Visitor instructions',venue.instructions],['Hosting opportunities',venue.available?venue.opportunities:'']])if(text)card.append(node('h3',title),node('pre',text));
 card.append(node('p',venue.available?'Available to host AAJ artists. Coordinate directly with the venue.':'Not currently seeking artists.'),node('p','Map integration is planned. This prototype displays the visitor address.'));root.append(card);
 if(venue.id==='venue-leos-brewpub')root.append(anchor('Sample current and upcoming artists →','/prototype/venues/leos-brewpub-and-grill/'));
 shows.dataset.venue=venue.id;renderShowings(shows);
}

let watchingVisibility=false;
export function applyVenueVisibility(){
 if(!watchingVisibility){watchingVisibility=true;window.addEventListener('storage',e=>{if(e.key===VENUES_KEY){applyVenueVisibility();updatePilotVenue()}})}
 const hidden=readVenues().filter(v=>!v.visible).map(v=>v.id);
 document.querySelectorAll<HTMLElement>('[data-public-venue]').forEach(el=>{
   el.dataset.adminHidden=String(hidden.includes(el.dataset.publicVenue||''));el.hidden=el.dataset.adminHidden==='true';
 });
 const main=document.querySelector<HTMLElement>('[data-venue-page]');
 if(main){main.hidden=hidden.includes(main.dataset.venuePage||'');document.querySelector('[data-hidden-venue-notice]')?.remove();if(main.hidden){const message=node('p','This venue is not currently available publicly.');message.dataset.hiddenVenueNotice='';message.style.padding='2rem';main.after(message)}}
 window.dispatchEvent(new Event('aaj-showings-updated'));
}

export function updatePilotVenue(){
 const main=document.querySelector<HTMLElement>('[data-venue-page]');if(!main)return;
 const venue=availableVenues().find(v=>v.id===main.dataset.venuePage);if(!venue)return;
 document.querySelector('[data-managed-venue-name]')!.textContent=venue.name;
 document.querySelector('[data-managed-description]')!.textContent=venue.description||'See the artists showing at this location.';
 const actions=document.querySelector('[data-managed-actions]')!;actions.replaceChildren();if(venue.website)actions.append(anchor('Venue website ↗',venue.website));actions.append(anchor('Map & info','#map'));
 const visit=document.querySelector('[data-managed-visit]')!;visit.replaceChildren(node('p','Plan a visit','eyebrow'),node('h2','Address & hours'),node('p',`${venue.address}, ${venue.city}, Oregon ${venue.postalCode}`));
 for(const [title,text] of [['Hours',venue.hours],['Public phone',venue.phone],['Accessibility',venue.accessibility],['Visitor instructions',venue.instructions],['Hosting opportunities',venue.available?venue.opportunities:'']])if(text)visit.append(node('h3',title),node('pre',text));
 if(venue.available)visit.append(node('p','Available to host AAJ artists.'));
 visit.querySelectorAll('pre').forEach(el=>{el.style.whiteSpace='pre-wrap';el.style.font='inherit'});
}
