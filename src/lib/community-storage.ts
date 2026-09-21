// Existing synchronous form controllers read a hydrated cache. Writes are queued
// per entity with optimistic revisions; a visible status reports network failures.
export const COLLECTION_KEYS:Record<string,string>={applications:'aaj-artist-applications-prototype',artists:'aaj-member-artists-prototype',venues:'aaj-venues-prototype',showings:'aaj-showings-prototype','alan-workspace':'aaj-artist-workspace-prototype'};
export const SHARED_MODE_KEY='aaj-shared-storage-enabled';
const PENDING_KEY='aaj-shared-storage-pending';
type RecordValue=Record<string,unknown>;
export interface SharedRecord {collection:string;id:string;payload:RecordValue|null;revision:number}
type Operation=SharedRecord;
const onlineTest=import.meta.env.MODE==='online-test';
const loopback=typeof location!=='undefined'&&['127.0.0.1','localhost','[::1]'].includes(location.hostname);
const privatePreview=(loopback||onlineTest)&&location.pathname.startsWith('/prototype/artists/member')&&new URLSearchParams(location.search).get('preview')==='1';
const publicView=(loopback||onlineTest)&&!privatePreview&&(location.pathname==='/showing-now/'||location.pathname==='/our-artists/'||location.pathname.startsWith('/prototype/artists/')||location.pathname==='/prototype/venues/'||location.pathname.startsWith('/prototype/venues/')&&!location.pathname.startsWith('/prototype/venues/workspace'));
const CACHE_OWNER_KEY='aaj-shared-cache-owner';
const protectedWorkspace=(loopback||onlineTest)&&(privatePreview||/\/prototype\/(workspace|admin|onboarding|storage)(\/|$)/.test(location.pathname)||location.pathname.startsWith('/prototype/venues/workspace'));
const publicCache=new Map<string,string>();
export function publicStorageMode(){return publicView}
let enabled=(loopback||onlineTest)&&(protectedWorkspace||localStorage.getItem(SHARED_MODE_KEY)==='1'),ready=!enabled,error='',pending:Operation[]=[];
const revisions=new Map<string,number>();let sending=false;
function status(){let node=document.querySelector<HTMLElement>('[data-community-storage-status]');if(!node){node=document.createElement('div');node.dataset.communityStorageStatus='';node.setAttribute('role','status');node.style.cssText='padding:var(--space-3) var(--space-6);background:var(--color-black);color:var(--color-gold);font-size:var(--font-size-sm)';document.body.prepend(node)}node.replaceChildren();node.append(document.createTextNode(error?`Shared storage: ${error}`:enabled?(pending.length?'Saving to shared storage…':(onlineTest?'Private test cloud storage · Saved':'Shared local storage · Saved')):'Browser-only prototype'));const link=document.createElement('a');link.href='/prototype/storage/';link.textContent=' · Storage settings';link.style.color='inherit';node.append(link)}
export function sharedStorageRequired(){return enabled||publicView}
export function sharedStorageEnabled(){return (enabled||publicView)&&ready&&!error}
export async function api(path:string,init:RequestInit={}){const response=await fetch(`/api/community/${path}`,{...init,headers:{'x-aaj-prototype':'local',...init.headers},cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok){const body=await response.json().catch(()=>({})) as {error?:string};throw new Error(body.error||`Storage request failed (${response.status})`)}return response}
function descriptor(key:string){if(key.startsWith('aaj-featured-'))return {collection:'featured',singleton:true,id:key.slice('aaj-featured-'.length)};const collection=Object.keys(COLLECTION_KEYS).find(c=>COLLECTION_KEYS[c]===key);return collection?{collection,singleton:collection==='alan-workspace',id:'alan-just'}:null}
function records(key:string,value:string|null):Map<string,RecordValue>{const spec=descriptor(key);if(!spec||value===null)return new Map();if(spec.collection==='featured')return new Map([[spec.id,{value}]]);const parsed=JSON.parse(value);if(spec.singleton)return new Map([[spec.id,parsed]]);return new Map((Array.isArray(parsed)?parsed:[]).map(row=>[row.id,row]))}
export function getStoredItem(key:string){return publicView?publicCache.get(key)||null:enabled&&!ready?null:localStorage.getItem(key)}
export function setStoredItem(key:string,value:string){
 if(publicView)throw new Error('Public pages are read-only. Open your workspace to make changes.');
 if(!enabled||!descriptor(key)){localStorage.setItem(key,value);return}
 if(!ready||error)throw new Error('Shared storage is unavailable. Open Storage & migration before saving.');
 const before=records(key,localStorage.getItem(key)),after=records(key,value),collection=descriptor(key)!.collection;
 const changes:Operation[]=[];for(const id of new Set([...before.keys(),...after.keys()])){if(JSON.stringify(before.get(id))!==JSON.stringify(after.get(id)))changes.push({collection,id,payload:after.get(id)||null,revision:(revisions.get(`${collection}/${id}`)||0)+pending.filter(op=>op.collection===collection&&op.id===id).length})}
 pending.push(...changes);localStorage.setItem(PENDING_KEY,JSON.stringify(pending));localStorage.setItem(key,value);status();void flush();
}
export async function waitForSharedSave(){
 if(!enabled)return;
 while(sending)await new Promise(resolve=>setTimeout(resolve,25));
 await flush();
 if(error||pending.length)throw new Error(error||"Changes are still waiting to save.");
}
async function flush(){if(sending||!pending.length||!ready||error)return;sending=true;try{while(pending.length){const operation=pending[0],key=`${operation.collection}/${operation.id}`;const result=await (await api('record',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(operation)})).json() as {revision:number};revisions.set(key,result.revision);pending.shift();localStorage.setItem(PENDING_KEY,JSON.stringify(pending))}}catch(cause){error=(cause as Error).message+' Your unsynced changes remain saved in this browser.'}finally{sending=false;status()}}
function hydrate(rows:SharedRecord[]){
 for(const [collection,key] of Object.entries(COLLECTION_KEYS)){const active=rows.filter(row=>row.collection===collection&&row.payload!==null);localStorage.setItem(key,JSON.stringify(collection==='alan-workspace'?active[0]?.payload||{}:active.map(row=>row.payload)))}
 for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i)!;if(key.startsWith('aaj-featured-'))localStorage.removeItem(key)}
 for(const row of rows){revisions.set(`${row.collection}/${row.id}`,row.revision);if(row.collection==='featured'&&row.payload)localStorage.setItem(`aaj-featured-${row.id}`,String(row.payload.value))}
 for(const op of pending){if(op.collection==='featured'){if(op.payload)localStorage.setItem(`aaj-featured-${op.id}`,String(op.payload.value));continue}const key=COLLECTION_KEYS[op.collection];if(!key)continue;if(op.collection==='alan-workspace'){localStorage.setItem(key,JSON.stringify(op.payload||{}));continue}const list=JSON.parse(localStorage.getItem(key)||'[]').filter((r:RecordValue)=>r.id!==op.id);if(op.payload)list.push(op.payload);localStorage.setItem(key,JSON.stringify(list))}
}
if(publicView){ready=false;try{const body=await (await api('public/state')).json() as {records:SharedRecord[]};for(const [collection,key] of Object.entries(COLLECTION_KEYS)){const active=body.records.filter(r=>r.collection===collection&&r.payload);publicCache.set(key,JSON.stringify(collection==='alan-workspace'?active[0]?.payload||{}:active.map(r=>r.payload)))}ready=true}catch(cause){error=(cause as Error).message}}
else if(enabled){try{
 const body=await (await api('state')).json() as {userId:string;administrator:boolean;records:SharedRecord[]};
 const previousOwner=localStorage.getItem(CACHE_OWNER_KEY);
 if(previousOwner!==body.userId){
  const backup:Record<string,string>={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i)!;if(descriptor(key)||key===PENDING_KEY)backup[key]=localStorage.getItem(key)!}
  if(Object.keys(backup).length)localStorage.setItem(`aaj-account-backup-${previousOwner||'legacy'}-${Date.now()}`,JSON.stringify(backup));
  // Preserve the existing administrator's migration queue once. Never replay
  // a previous person's edits with a newly signed-in account's permissions.
  if(previousOwner||!body.administrator)localStorage.removeItem(PENDING_KEY);
  localStorage.setItem(CACHE_OWNER_KEY,body.userId);
 }
 pending=JSON.parse(localStorage.getItem(PENDING_KEY)||'[]');hydrate(body.records);ready=true;void flush()
}catch(cause){error=(cause as Error).message+' Existing browser data has been retained.'}}

if(typeof document!=='undefined'&&(loopback||onlineTest)&&!publicView){status();window.addEventListener('beforeunload',event=>{if(pending.length){event.preventDefault()}})}
if(typeof window!=='undefined'&&(loopback||onlineTest)){window.addEventListener('storage',event=>{if(!publicView&&(event.key===SHARED_MODE_KEY||event.key===CACHE_OWNER_KEY)){enabled=protectedWorkspace||localStorage.getItem(SHARED_MODE_KEY)==='1';ready=false;error='Storage mode changed in another tab. Reload this page before saving.';status()}})}
