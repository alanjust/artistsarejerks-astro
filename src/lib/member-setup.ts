import {getMemberArtist,saveMemberArtist,imageUrl,saveImage,memberUrl,type MemberArtist,type MemberWork} from './member-artists';
import pilot from '../data/community-pilot.json';
import {readShowings,renderShowings} from './prototype-showings';
import {readArtistApplications} from './artist-applications';
import {storageReady} from './community-storage';
import {initShowingsPanel} from './member-showings';
const el=(tag:string,text='')=>{const node=document.createElement(tag);node.textContent=text;return node};
const $=<T extends Element=HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
// A web address typed without https:// still counts.
function normalizeWebsite(value:string){
 if(!value)return '';
 try{const url=new URL(/^[a-z][a-z0-9+.-]*:/i.test(value)?value:`https://${value}`);return ['http:','https:'].includes(url.protocol)&&url.hostname.includes('.')&&!url.username&&!url.password?url.href:null}catch{return null}
}
export async function initMemberSetup(){
 await storageReady;
 const id=new URLSearchParams(location.search).get('artist')||'',root=document.querySelector<HTMLElement>('[data-regular-workspace]');
 let serverInitial:MemberArtist|null=null;try{serverInitial=JSON.parse(root?.dataset.initialArtist||'null') as MemberArtist|null}catch{}
 const initial=getMemberArtist(id)||(serverInitial?.id===id?serverInitial:null);
 if(!initial){$('[data-setup-unavailable]').hidden=false;return}
 let artist:MemberArtist=initial;
 $('[data-setup-content]').hidden=false;
 const setTitle=()=>{$('[data-setup-title]').textContent=`${artist.name}’s page`;document.title=`${artist.name}’s page | Artists Are Jerks`};setTitle();
 const message=$('[data-setup-message]');

 // Applicants build privately while they wait; publishing opens once approved.
 const application=readArtistApplications().find(a=>a.id===id);
 const approved=!application||application.status==='approved';
 const approval=document.querySelector<HTMLElement>('[data-approval-status]');
 if(approval&&application){approval.hidden=false;approval.textContent=approved?'You’re approved. Your page can go public whenever you publish it.':'Your request is with us. Go ahead and build your page. It goes public once you’re approved.'}

 function persist(next:MemberArtist){try{saveMemberArtist(next);artist=next;message.textContent='';return true}catch{message.textContent='We couldn’t save that. Check your connection and try again; your entries are still here.';return false}}
 const showingCount=()=>readShowings().filter(s=>s.artistId===id).length;
 const panels=[...document.querySelectorAll<HTMLElement>('[data-panel]')],tabs=[...document.querySelectorAll<HTMLButtonElement>('[data-workspace-tab]')];
 let firstPiece=false;

 // Home says where things stand and offers the single most useful next step.
 function renderHome(){
  const works=artist.works.length,shows=showingCount();
  const [headline,detail,label,target]=showings.needsAttention()?['Is your work still up?','One of your ongoing showings is due for a quick check-in.','Check your showings →','showing']:!works?['Let’s put up your first piece','Start with one photo. Everything else can wait.','Add your first piece →','first']
   :!artist.published?[approved?'Your page is ready to publish':'Your page is taking shape',`${works} ${works===1?'piece':'pieces'} so far. ${approved?'Take a look, and publish it when you’re ready.':'It goes public once you’re approved.'}`,'See your page →','page']
   :!shows?['Your page is live','Next: tell visitors where they can see your work in person.','Add a showing →','showing']
   :['Your page is live',`${works} ${works===1?'piece':'pieces'} · ${shows} ${shows===1?'showing':'showings'}`,'Add another piece →','artwork'];
  $('[data-home-headline]').textContent=headline;$('[data-home-detail]').textContent=detail;
  const action=$<HTMLButtonElement>('[data-home-action]');action.textContent=label;action.onclick=()=>target==='first'?openFirstPiece():show(target);
  const publicLink=$<HTMLAnchorElement>('[data-home-public]');publicLink.hidden=!artist.published;publicLink.href=memberUrl(id);
 }
 function show(tab:string){
  firstPiece=false;
  panels.forEach(panel=>panel.hidden=panel.dataset.panel!==tab);
  tabs.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.workspaceTab===tab)));
  history.replaceState(null,'',`#${tab}`);
  if(tab==='home')renderHome();if(tab==='page')renderPage();if(tab==='profile')fillProfile();if(tab==='showing')showings.render();
  artworkMode();
 }
 function openFirstPiece(){show('artwork');firstPiece=true;artworkMode()}
 tabs.forEach(button=>button.addEventListener('click',()=>show(button.dataset.workspaceTab!)));
 document.querySelectorAll<HTMLButtonElement>('[data-go]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.go!)));

 // Artwork: one form for the first piece and for adding or editing later ones.
 const upload=$<HTMLFormElement>('[data-member-upload]'),image=$<HTMLImageElement>('[data-upload-preview]'),prompt=$('[data-drop-prompt]'),uploadMessage=$('[data-upload-message]');
 const input=upload.elements.namedItem('image') as HTMLInputElement,sale=upload.elements.namedItem('sale') as HTMLSelectElement,price=upload.elements.namedItem('price') as HTMLInputElement;
 const saveButton=$<HTMLButtonElement>('[data-save-artwork]'),cancelEdit=$<HTMLButtonElement>('[data-cancel-artwork-edit]'),formTitle=$('[data-artwork-form-title]');
 let selected:File|null=null,sample=false,previewUrl='',editingWorkId='';
 const showPreview=(src:string)=>{image.src=src;image.hidden=false;prompt.hidden=true};
 function artworkMode(){
  const editing=Boolean(editingWorkId);
  formTitle.textContent=editing?'Edit this piece':firstPiece?'Your first piece':'Add a piece';
  saveButton.textContent=editing?'Save changes':firstPiece?'Next: see your page →':'Save this piece';
  cancelEdit.hidden=!editing;
  $('[data-artwork-list]').hidden=firstPiece||!artist.works.length;
 }
 function clearArtworkForm(){editingWorkId='';upload.reset();selected=null;sample=false;if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=''}image.hidden=true;prompt.hidden=false;$('[data-member-price]').hidden=true;price.required=false;artworkMode()}
 input.addEventListener('change',async()=>{
  selected=null;sample=false;if(previewUrl)URL.revokeObjectURL(previewUrl);
  const file=input.files?.[0];if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){uploadMessage.textContent='Choose a JPEG, PNG, or WebP up to 10 MB.';input.value='';return}
  try{const decoded=await createImageBitmap(file);decoded.close()}catch{uploadMessage.textContent='That file couldn’t be read as an image.';input.value='';return}
  selected=file;previewUrl=URL.createObjectURL(file);showPreview(previewUrl);uploadMessage.textContent='';
 });
 $('[data-use-sample]').addEventListener('click',()=>{sample=true;selected=null;input.value='';showPreview(pilot.artworks[0].image);(upload.elements.namedItem('title') as HTMLInputElement).value='Sample artwork, for layout only';uploadMessage.textContent='A labeled sample image from Alan’s gallery, for trying things out.'});
 sale.addEventListener('change',()=>{$('[data-member-price]').hidden=sale.value!=='price';price.required=sale.value==='price'});
 async function editWork(work:MemberWork){
  editingWorkId=work.id;selected=null;sample=false;if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=''}
  (upload.elements.namedItem('title') as HTMLInputElement).value=work.title;(upload.elements.namedItem('medium') as HTMLInputElement).value=work.medium||'';(upload.elements.namedItem('year') as HTMLInputElement).value=work.year||'';
  sale.value=work.sale||'contact';price.value=work.price||'';(upload.elements.namedItem('public') as HTMLInputElement).checked=work.public;
  $('[data-member-price]').hidden=sale.value!=='price';price.required=sale.value==='price';
  showPreview(await imageUrl(work));artworkMode();uploadMessage.textContent='Choose a new photo only if you want to replace this one.';upload.scrollIntoView({behavior:'smooth',block:'start'});
 }
 cancelEdit.addEventListener('click',()=>{clearArtworkForm();uploadMessage.textContent='Nothing changed.'});
 async function works(){
  const list=$('[data-member-works]');list.replaceChildren();
  for(const work of artist.works){
   const row=el('article');row.className='card';const img=document.createElement('img');img.src=await imageUrl(work);img.alt=work.title;
   const copy=document.createElement('div'),details=[work.medium,work.year].filter(Boolean).join(' · ');copy.append(el('h3',work.title));if(details)copy.append(el('p',details));
   copy.append(el('p',work.public?(artist.published?'On your public page':'Will show when your page is published'):'Private'));
   const actions=document.createElement('div');actions.className='actions';
   const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';edit.addEventListener('click',()=>void editWork(work));
   const toggle=document.createElement('button');toggle.type='button';toggle.textContent=work.public?'Make private':'Show on my page';
   toggle.addEventListener('click',()=>{const updated=artist.works.map(w=>w.id===work.id?{...w,public:!w.public}:w);if(persist({...artist,works:updated,published:artist.published&&updated.some(w=>w.public)}))void works()});
   actions.append(edit,toggle);copy.append(actions);row.append(img,copy);list.append(row);
  }
  artworkMode();
 }
 upload.addEventListener('submit',async event=>{
  event.preventDefault();
  const existing=editingWorkId?artist.works.find(work=>work.id===editingWorkId):undefined;
  if(!existing&&!sample&&!selected){uploadMessage.textContent='Choose a photo of your work first.';return}
  saveButton.disabled=true;uploadMessage.textContent='Saving…';
  const data=new FormData(upload),replacement=Boolean(sample||selected),imageKey=replacement?crypto.randomUUID():existing?.imageKey||crypto.randomUUID();
  const work:MemberWork={id:existing?.id||crypto.randomUUID(),title:String(data.get('title')||'').trim()||'Untitled',medium:String(data.get('medium')||'').trim(),year:String(data.get('year')||''),sale:String(data.get('sale')),price:sale.value==='price'?price.value:'',public:data.has('public'),imageKey,sampleImage:sample?pilot.artworks[0].image:replacement?'':existing?.sampleImage||''};
  try{
   if(selected)await saveImage(work.imageKey,selected);
   const updated=existing?artist.works.map(item=>item.id===existing.id?work:item):[...artist.works,work];
   if(persist({...artist,works:updated})){
    const wasFirst=firstPiece,wasEditing=Boolean(existing);clearArtworkForm();await works();
    if(wasFirst){uploadMessage.textContent='';show('page');return}
    uploadMessage.textContent=wasEditing?'Saved.':'Saved. Add another, or see your page.';
   }
  }catch{uploadMessage.textContent='That photo couldn’t be saved. Check your connection and try again.'}
  finally{saveButton.disabled=false}
 });

 // Your page: the visitor view, how people reach the artist, and publishing.
 const publishForm=$<HTMLFormElement>('[data-publish-form]'),publication=$('[data-publication-message]');
 const reachChoice=()=>String(new FormData(publishForm).get('reach')||'none');
 const syncReach=()=>{$('[data-reach-website]').hidden=reachChoice()!=='website'};
 publishForm.querySelectorAll('input[name="reach"]').forEach(radio=>radio.addEventListener('change',syncReach));
 function renderPage(){
  const preview=$<HTMLIFrameElement>('[data-page-preview]'),url=memberUrl(id,true);
  preview.src=`${url}&v=${Date.now()}`;$<HTMLAnchorElement>('[data-member-preview]').href=url;
  const reach=artist.publicWebsite?'website':artist.publicEmail?'email':'none';
  publishForm.querySelectorAll<HTMLInputElement>('input[name="reach"]').forEach(radio=>radio.checked=radio.value===reach);
  (publishForm.elements.namedItem('website') as HTMLInputElement).value=artist.website||'';
  $('[data-reach-email]').textContent=artist.email||'your account email';syncReach();
  $('[data-rights-field]').hidden=Boolean(artist.rightsConfirmedAt);$('[data-rights-done]').hidden=!artist.rightsConfirmedAt;
  $('[data-publish-member]').textContent=artist.published?'Save changes':'Publish my page';$('[data-keep-private]').hidden=artist.published;$('[data-offline-member]').hidden=!artist.published;
  $('[data-live-next]').hidden=!artist.published;
 }
 publishForm.addEventListener('submit',event=>{
  event.preventDefault();
  const reach=reachChoice(),website=normalizeWebsite(String(new FormData(publishForm).get('website')||'').trim());
  if(reach==='website'&&!website){publication.textContent='Enter your website, like yourwebsite.com.';return}
  if(reach==='email'&&!artist.email){publication.textContent='Add an email in Profile first, or choose another option.';return}
  const confirmed=artist.rightsConfirmedAt||((publishForm.elements.namedItem('rights') as HTMLInputElement).checked?new Date().toISOString():'');
  if(!confirmed){publication.textContent='Please confirm that you made this work.';return}
  if(!artist.works.some(w=>w.public)){publication.textContent='Add at least one piece that shows on your page first.';return}
  const next={...artist,website:reach==='website'?website!:artist.website,publicWebsite:reach==='website',publicEmail:reach==='email',rightsConfirmedAt:confirmed};
  if(!approved){if(persist(next)){renderPage();publication.textContent='Saved. Your page can go public the moment you’re approved.'}return}
  const wasPublished=artist.published;if(persist({...next,published:true})){renderPage();publication.textContent=wasPublished?'Saved.':'Your page is public now, and you’re on Our Artists.'}
 });
 $('[data-keep-private]').addEventListener('click',()=>show('home'));
 $('[data-offline-member]').addEventListener('click',()=>{if(persist({...artist,published:false})){renderPage();publication.textContent='Your page is offline. Your artwork and details are still saved here.'}});

 // Profile and contact details.
 const profile=$<HTMLFormElement>('[data-setup-profile]'),contact=$<HTMLFormElement>('[data-setup-contact]');
 function fillProfile(){for(const form of [profile,contact])for(const [name,value] of Object.entries(artist)){const field=form.elements.namedItem(name) as HTMLInputElement|null;if(!field)continue;if(field.type==='checkbox')field.checked=Boolean(value);else field.value=String(value??'')}}
 profile.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(profile),name=String(data.get('name')).trim(),practice=String(data.get('practice')).trim();if(!name||!practice){message.textContent='Please enter your name and what you make.';return}if(persist({...artist,name,practice,city:String(data.get('city')||'').trim(),bio:String(data.get('bio')||'').trim(),venueOpportunities:data.has('venueOpportunities')})){setTitle();message.textContent='Saved.'}});
 contact.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(contact),website=normalizeWebsite(String(data.get('website')).trim()),email=String(data.get('email')).trim(),phone=String(data.get('phone')).trim();if(website===null){message.textContent='That website address doesn’t look right.';return}if((data.has('publicEmail')&&!email)||(data.has('publicPhone')&&!phone)||(data.has('publicWebsite')&&!website)){message.textContent='Fill in each contact detail you want to show.';return}if(persist({...artist,website,email,phone,publicEmail:data.has('publicEmail'),publicWebsite:data.has('publicWebsite'),publicPhone:data.has('publicPhone')}))message.textContent='Saved.'});

 const showings=initShowingsPanel({id,approved,artist:()=>artist,save:persist,changed:()=>{}});
 await works();
 const start=location.hash.slice(1);
 if(['home','artwork','showing','profile','page'].includes(start))show(start);else if(!artist.works.length)openFirstPiece();else show('home');
 window.addEventListener('pagehide',()=>{if(previewUrl)URL.revokeObjectURL(previewUrl)});
}
export async function initMemberPublicPage(){
 await storageReady;
 const id=new URLSearchParams(location.search).get('artist')||'',preview=new URLSearchParams(location.search).get('preview')==='1',artist=getMemberArtist(id);
 const status=document.querySelector('[data-member-page-status]')!;
 if(!artist||(!artist.published&&!preview)){document.querySelector('[data-member-name]')!.textContent='This artist page is not published';status.textContent='The artist can preview and publish this page from their workspace.';return}
 document.querySelector('[data-member-name]')!.textContent=artist.name;document.title=`${artist.name} | Artists Are Jerks`;if(preview)document.querySelector('[data-member-page-notice]')!.textContent='Private preview · Browser-only prototype';
 const showingRoot=document.querySelector<HTMLElement>('[data-browser-showings]');if(showingRoot){showingRoot.dataset.artist=id;await renderShowings(showingRoot)}
 document.querySelector('[data-member-city]')!.textContent=`${artist.city}, Oregon`;
 document.querySelector('[data-member-breadcrumb]')!.textContent=artist.name;
 document.querySelector('[data-member-address-name]')!.textContent=artist.name;
 const profile=document.querySelector('[data-member-public-profile]')!;const practice=el('p',artist.practice),bio=el('p',artist.bio),contacts=el('div');practice.className='practice';bio.className='bio';contacts.className='contact-actions';profile.append(practice,bio,contacts);
 const link=(text:string,url:string)=>{const a=document.createElement('a');a.textContent=text;a.href=url;contacts.append(a)};
 if(artist.publicWebsite&&/^https?:\/\//i.test(artist.website))link('Visit artist’s website',artist.website);if(artist.publicEmail)link('Email the artist',`mailto:${artist.email}`);if(artist.publicPhone){link('Call the artist',`tel:${artist.phone.replace(/[^+\d]/g,'')}`);link('Text the artist',`sms:${artist.phone.replace(/[^+\d]/g,'')}`)}
 const works=artist.works.filter(w=>w.public),root=document.querySelector('[data-member-public-works]')!,urls:string[]=[];const dialog=document.querySelector<HTMLDialogElement>('[data-member-viewer]')!,image=document.querySelector<HTMLImageElement>('[data-viewer-image]')!;let active=0;
 function display(index:number){active=(index+works.length)%works.length;image.src=urls[active];image.alt=works[active].title;document.querySelector('[data-viewer-caption]')!.textContent=`${works[active].title} · ${active+1} of ${works.length}`;}
 for(const work of works){let url='';try{url=await imageUrl(work)}catch{}urls.push(url);const index=urls.length-1;const card=el('article');card.className='artwork-card member-artwork';const button=document.createElement('button');button.type='button';button.className='artwork-image';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label',`Enlarge ${work.title}`);const img=document.createElement('img');img.alt=work.title;img.src=url;button.append(img);button.addEventListener('click',()=>{display(index);dialog.showModal()});const copy=el('div');copy.className='artwork-copy';const details=el('p',[work.medium,work.year].filter(Boolean).join(', '));details.className='details';copy.append(el('h3',work.title),details,el('p',work.sale==='price'?`$${Number(work.price).toLocaleString('en-US')}`:work.sale==='sold'?'Sold':work.sale==='not-for-sale'?'Not for sale':work.sale==='private'?'Price private':'Contact the artist for price'));copy.lastElementChild!.className='sale-state';card.append(button,copy);if(work.sampleImage)copy.append(el('p','Sample artwork — borrowed for prototype layout.'));root.append(card)}
 if(!works.length)status.textContent='No artwork selected for public display yet.';
 document.querySelector('[data-close-viewer]')?.addEventListener('click',()=>dialog.close());document.querySelector('[data-viewer-previous]')?.addEventListener('click',()=>display(active-1));document.querySelector('[data-viewer-next]')?.addEventListener('click',()=>display(active+1));dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();display(active-1)}if(e.key==='ArrowRight'){e.preventDefault();display(active+1)}});window.addEventListener('pagehide',()=>urls.filter(u=>u.startsWith('blob:')).forEach(u=>URL.revokeObjectURL(u)));
}
