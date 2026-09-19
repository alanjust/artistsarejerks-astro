import {getMemberArtist,imageUrl} from './member-artists';
import {initShowingForm} from './showing-form';
import pilot from '../data/community-pilot.json';
export async function initMemberShowing(){
 const id=new URLSearchParams(location.search).get('artist')||'',artist=getMemberArtist(id),status=document.querySelector('[data-member-showing-status]');
 if(!status)return;
 if(!artist){status.textContent='Accept your approved invitation before creating a showing.';return}
 document.querySelector<HTMLAnchorElement>('[data-back-artist-setup]')!.href=`/prototype/workspace/member/?artist=${encodeURIComponent(id)}`;
 const works=artist.works.filter(w=>w.public);if(!works.length){status.textContent='Add at least one public artwork in your workspace first.';return}
 status.textContent=artist.published?'Select the work people can see at this place.':'Your page is offline. You can save showings here, but they stay hidden until your artist page is public.';
 const resolved:{id:string;title:string;image:string}[]=[];for(const work of works){try{const image=await imageUrl(work);if(image)resolved.push({id:work.id,title:work.title,image})}catch{}}
 if(!resolved.length){status.textContent='Saved artwork images are unavailable. Add an image again from your workspace.';return}
 document.querySelector<HTMLElement>('[data-member-showing-content]')!.hidden=false;
 document.querySelector('[data-showing-artist-name]')!.textContent=artist.name;
 const root=document.querySelector('[data-member-showing-works]')!;
 resolved.forEach(work=>{const label=document.createElement('label');label.className='check';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.name='works';checkbox.value=work.id;const img=document.createElement('img');img.src=work.image;img.alt='';img.style.cssText='width:50px;height:60px;object-fit:contain';const name=document.createElement('span');name.textContent=work.title;label.append(checkbox,img,name);root.append(label)});
 initShowingForm({artist:{id,name:artist.name,practice:artist.practice.split(',').map(s=>s.trim())},venue:pilot.venues[0],works:resolved});
 window.addEventListener('pagehide',()=>resolved.filter(w=>w.image.startsWith('blob:')).forEach(w=>URL.revokeObjectURL(w.image)));
}
