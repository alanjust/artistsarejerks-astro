import {COLLECTION_KEYS,SHARED_MODE_KEY,api,sharedStorageEnabled,type SharedRecord} from './community-storage';
function snapshot(){const result:Record<string,string>={};for(const key of Object.values(COLLECTION_KEYS)){const value=localStorage.getItem(key);if(value)result[key]=value}for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i)!;if(key.startsWith('aaj-featured-'))result[key]=localStorage.getItem(key)!}return result}
function backup(){const data=snapshot();localStorage.setItem(`aaj-storage-backup-${new Date().toISOString()}`,JSON.stringify(data));return data}
async function originalImage(key:string){return new Promise<Blob|null>((resolve,reject)=>{const open=indexedDB.open('aaj-artwork-images-prototype',1);open.onupgradeneeded=()=>open.result.createObjectStore('images');open.onerror=()=>reject(open.error);open.onsuccess=()=>{const db=open.result,request=db.transaction('images').objectStore('images').get(key);request.onsuccess=()=>{resolve(request.result||null);db.close()};request.onerror=()=>{reject(request.error);db.close()}}})}
export function initStorageManager(){
 const onlineTest=import.meta.env.MODE==='online-test';
 const connected=onlineTest?sharedStorageEnabled():localStorage.getItem(SHARED_MODE_KEY)==='1';
 const mode=document.querySelector<HTMLElement>('[data-storage-mode]');if(mode)mode.textContent=onlineTest?(connected?'Connected to the private test site’s cloud storage.':'Cloud storage is unavailable. Check the top banner before editing.'):connected?'This browser is connected to shared storage on this Mac. You do not need to copy or connect again.':'This browser currently uses its own copy. Connect below if you want to use the information shared on this Mac.';
 const help=document.querySelector<HTMLElement>('[data-connected-help]');if(help)help.textContent=connected?'Already connected: these setup buttons are normally unnecessary.':'New browser: choose the connection option that matches your situation.';
 const setup=document.querySelector<HTMLDetailsElement>('[data-storage-connection]');if(setup)setup.open=!connected;
 const message=document.querySelector<HTMLElement>('[data-storage-message]')!;
 const root=document.querySelector('[data-storage-counts]')!;
 for(const [collection,key] of Object.entries(COLLECTION_KEYS)){if(collection==='alan-workspace')continue;const rows=JSON.parse(localStorage.getItem(key)||'[]');const p=document.createElement('p');p.textContent=`${rows.length} ${collection}`;root.append(p)}
 const buttons=[...document.querySelectorAll<HTMLButtonElement>('[data-import-browser],[data-connect-shared]')];
 document.querySelector('[data-export-browser]')?.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({format:'aaj-browser-record-backup-v1',records:snapshot()},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='artists-are-jerks-record-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message.textContent='Record backup downloaded. Original images remain safely stored in this browser.'});
 async function connect(importData:boolean){buttons.forEach(b=>b.disabled=true);try{
  if(JSON.parse(localStorage.getItem('aaj-shared-storage-pending')||'[]').length)throw new Error('Unsynced edits remain in this browser. Resolve the shared save error before reconnecting.');
  const current=backup(),shared:{records:SharedRecord[]}=await (await api('state')).json();
  if(importData){
   const operations:Omit<SharedRecord,'revision'>[]=[];
   for(const [collection,key] of Object.entries(COLLECTION_KEYS)){if(!current[key])continue;const payload=JSON.parse(current[key]);const rows=collection==='alan-workspace'?[{id:'alan-just',payload}]:payload.map((row:Record<string,unknown>)=>({id:row.id,payload:row}));for(const row of rows)operations.push({collection,...row})}
   for(const [key,value] of Object.entries(current)){if(key.startsWith('aaj-featured-'))operations.push({collection:'featured',id:key.slice('aaj-featured-'.length),payload:{value}})}
   for(const op of operations){const existing=shared.records.find(row=>row.collection===op.collection&&row.id===op.id);if(existing&&JSON.stringify(existing.payload)!==JSON.stringify(op.payload))throw new Error(`Import stopped: ${op.collection}/${op.id} already has different shared information. Your browser data is unchanged. Use Connect to view the shared version; your original data is backed up.`)}
   const artists=JSON.parse(current[COLLECTION_KEYS.artists]||'[]');
   for(const artist of artists)for(const work of artist.works){if(work.sampleImage)continue;message.textContent=`Copying artwork: ${work.title}`;const image=await originalImage(work.imageKey);if(!image){const response=await fetch(`/api/community/images/${encodeURIComponent(work.imageKey)}`);if(!response.ok)throw new Error(`Original image unavailable for “${work.title}”. Import paused; existing data is retained.`)}else await api(`images/${encodeURIComponent(work.imageKey)}`,{method:'PUT',body:image})}
   for(const op of operations){if(shared.records.some(row=>row.collection===op.collection&&row.id===op.id))continue;message.textContent=`Copying ${op.collection}…`;await api('record',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...op,revision:0})})}
  }
  localStorage.setItem(SHARED_MODE_KEY,'1');location.href='/prototype/workspaces/';
 }catch(cause){message.textContent=(cause as Error).message}finally{buttons.forEach(b=>b.disabled=false)}}
 document.querySelector('[data-import-browser]')?.addEventListener('click',()=>void connect(true));
 document.querySelector('[data-connect-shared]')?.addEventListener('click',()=>void connect(false));
 document.querySelector('[data-reload-shared]')?.addEventListener('click',()=>{backup();localStorage.setItem(`aaj-unsynced-backup-${new Date().toISOString()}`,localStorage.getItem('aaj-shared-storage-pending')||'[]');localStorage.removeItem('aaj-shared-storage-pending');location.reload()});
 document.querySelector('[data-disconnect-shared]')?.addEventListener('click',()=>{backup();localStorage.removeItem(SHARED_MODE_KEY);location.reload()});
}
