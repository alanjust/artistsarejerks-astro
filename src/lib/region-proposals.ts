import {loadRegions} from './regions';

interface RegionProposal {id:string;user_id:string;proposed_name:string;core_city:string;state_code:string;country_code:string;coverage:string;local_connection:string;intended_role:string;rationale:string;status:'pending'|'approved'|'declined';region_id:string|null;created_at:string;reviewed_at:string|null}
const el=(tag:string,text='',className='')=>{const node=document.createElement(tag);node.textContent=text;node.className=className;return node};
async function request(method:'GET'|'PUT',body?:unknown){
 const response=await fetch('/api/community/region-proposals',{method,headers:{Accept:'application/json',...(method==='PUT'?{'Content-Type':'application/json','x-aaj-prototype':'local'}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await response.json().catch(()=>({error:'The server returned an unreadable response.'}));if(!response.ok)throw new Error(data.error||'Unable to complete this request.');return data;
}
function proposalCard(proposal:RegionProposal,review?:(status:'approved'|'declined')=>void){
 const card=el('article','', 'card');card.append(el('h2',proposal.proposed_name),el('p',`${proposal.status} · ${proposal.core_city}, ${proposal.state_code}`),el('p',proposal.coverage),el('h3','Connection to the area'),el('p',proposal.local_connection),el('h3','Proposed role'),el('p',proposal.intended_role),el('h3','Why this area'),el('p',proposal.rationale));
 if(proposal.region_id)card.append(el('p','Approved and available in artist and venue onboarding.'));
 if(review&&proposal.status==='pending'){const actions=el('div','', 'actions');for(const [label,status] of [['Approve region','approved'],['Decline proposal','declined']] as const){const button=el('button',label) as HTMLButtonElement;button.type='button';button.addEventListener('click',()=>review(status));actions.append(button)}card.append(actions)}
 return card;
}
export function initRegionProposal(){
 const form=document.querySelector<HTMLFormElement>('[data-region-proposal]');if(!form)return;const status=document.querySelector<HTMLElement>('[data-region-status]')!,list=document.querySelector<HTMLElement>('[data-region-proposals]')!;
 async function render(){try{const {proposals}=await request('GET');list.replaceChildren();if(!proposals.length)list.append(el('p','You have not proposed a region yet.'));else proposals.forEach((proposal:RegionProposal)=>list.append(proposalCard(proposal)))}catch(error){list.replaceChildren(el('p',error instanceof Error?error.message:'Unable to load proposals.'))}}
 form.addEventListener('submit',async event=>{event.preventDefault();status.textContent='Submitting…';const data=new FormData(form),value=(name:string)=>String(data.get(name)||'').trim();try{await request('PUT',{proposedName:value('proposedName'),coreCity:value('coreCity'),stateCode:value('stateCode').toUpperCase(),coverage:value('coverage'),localConnection:value('localConnection'),intendedRole:value('intendedRole'),rationale:value('rationale')});form.reset();status.textContent='Your proposal is awaiting administrator review.';await render()}catch(error){status.textContent=error instanceof Error?error.message:'Unable to submit this proposal.'}});void render();
}
export function initRegionReview(){
 const found=document.querySelector<HTMLElement>('[data-region-review]');if(!found)return;const root=found,status=document.querySelector<HTMLElement>('[data-region-review-status]')!;
 async function render(){try{const [{proposals},regions]=await Promise.all([request('GET'),loadRegions()]);root.replaceChildren();const active=el('section','', 'card');active.append(el('h2','Active regions'));regions.forEach(region=>active.append(el('p',`${region.name} · ${region.core_city}, ${region.state_code} · ${region.coverage}`)));root.append(active);if(!proposals.length)root.append(el('p','No region proposals yet.'));proposals.forEach((proposal:RegionProposal)=>root.append(proposalCard(proposal,async reviewStatus=>{status.textContent=`Saving ${proposal.proposed_name}…`;try{await request('PUT',{action:'review',id:proposal.id,status:reviewStatus});status.textContent=reviewStatus==='approved'?`${proposal.proposed_name} is now an active region.`:`${proposal.proposed_name} was declined.`;await render()}catch(error){status.textContent=error instanceof Error?error.message:'Unable to review this proposal.'}})))}catch(error){root.replaceChildren(el('p',error instanceof Error?error.message:'Unable to load region proposals.'))}}
 void render();
}
