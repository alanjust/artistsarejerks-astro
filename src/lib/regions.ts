export interface CommunityRegion {id:string;name:string;slug:string;core_city:string;state_code:string;country_code:string;coverage:string}

export async function loadRegions():Promise<CommunityRegion[]>{
 try{const response=await fetch('/api/community/public/regions',{headers:{Accept:'application/json'}});if(!response.ok)throw new Error();const data=await response.json();return Array.isArray(data.regions)?data.regions:[]}catch{return []}
}

export async function populateRegionSelects(root:ParentNode=document){
 const regions=await loadRegions();
 root.querySelectorAll<HTMLSelectElement>('[data-region-select]').forEach(select=>{
  const selected=select.value||'region-rogue-valley';
  if(regions.length)select.replaceChildren(...regions.map(region=>new Option(`${region.name} · ${region.state_code}`,region.id)));
  if([...select.options].some(option=>option.value===selected))select.value=selected;
 });
}
