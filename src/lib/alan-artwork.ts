import {getStoredItem,sharedStorageRequired,sharedStorageEnabled} from './community-storage';
import {imageUrl,type MemberWork} from './member-artists';
export interface UploadedWork {id:string;title:string;medium:string;year:string;visibility:string;sale:string;price:string;imageKey:string;sampleImage:string}
export function readAlanUploads():UploadedWork[]{const state=JSON.parse(getStoredItem('aaj-artist-workspace-prototype')||'{}');return Array.isArray(state.uploadedWorks)?state.uploadedWorks:[]}
export async function renderAlanUploads(privateView:boolean){
 const root=document.querySelector(privateView?'[data-panel="artwork"] .works':'[data-selected-artwork]');if(!root)return;
 if(!privateView&&sharedStorageRequired()&&!sharedStorageEnabled()){const notice=document.createElement('p');notice.setAttribute('role','status');notice.textContent='Uploaded artwork could not be loaded. Reload this preview to try again.';root.before(notice);return}
 const scopes=new Set([root,...root.querySelectorAll('*')].flatMap(node=>node.getAttributeNames().filter(name=>name.startsWith('data-astro-cid-'))));
 const works=readAlanUploads().filter(w=>privateView||w.visibility==='public');
 for(const work of works){
  const row=document.createElement('article');row.className=privateView?'work':'artwork-card';row.dataset.workId=work.id;
  const image=document.createElement('img');image.alt=work.title;image.loading='lazy';image.decoding='async';image.src=await imageUrl(work as unknown as MemberWork);
  const copy=document.createElement('div');copy.className=privateView?'work-copy':'artwork-copy';
  const heading=document.createElement('h3');heading.textContent=work.title;const details=document.createElement('p');details.textContent=[work.medium,work.year].filter(Boolean).join(' · ');copy.append(heading,details);
  if(privateView){
   const controls=document.createElement('div');controls.className='work-controls';
   for(const [labelText,attribute,options,value] of [['On artist page','visibility',[['public','Visible on artist page'],['private','Private']],work.visibility],['Availability','sale',[['contact-for-price','Contact for price'],['public-price','Show a price'],['private-price','Price kept private'],['not-for-sale','Not for sale'],['sold','Sold']],work.sale]] as const){
    const label=document.createElement('label');label.textContent=labelText;const select=document.createElement('select');select.dataset[attribute]='';for(const [value,text] of options)select.add(new Option(text,value));select.value=value;label.append(select);controls.append(label);
   }copy.append(controls);const note=document.createElement('small');note.textContent='Not in a confirmed showing';copy.append(note);row.append(image);
  }else{
   const button=document.createElement('button');button.type='button';button.className='artwork-image';button.dataset.enlargeArtwork='';button.dataset.image=image.src;button.dataset.title=work.title;button.setAttribute('aria-label',`Enlarge ${work.title}`);button.append(image);row.append(button);
   const sale=document.createElement('p');sale.textContent=work.sale==='public-price'?`$${Number(work.price).toLocaleString('en-US')}`:work.sale==='sold'?'Sold':work.sale==='not-for-sale'?'Not for sale':'Contact the artist for price';copy.append(sale);
  }row.append(copy);
  for(const node of [row,...row.querySelectorAll('*')])for(const scope of scopes)node.setAttribute(scope,'');
  root.append(row);
 }
}
