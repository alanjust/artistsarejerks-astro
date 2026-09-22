import {build} from 'esbuild';
import assert from 'node:assert/strict';

const compiled=await build({
 entryPoints:['src/lib/member-artists.ts'],bundle:true,write:false,format:'esm',platform:'browser',target:'es2022',
 plugins:[{name:'workspace-record-fixture',setup(builder){
  builder.onResolve({filter:/community-storage$/},()=>({path:'storage',namespace:'fixture'}));
  builder.onLoad({filter:/.*/,namespace:'fixture'},()=>({loader:'js',contents:`
   export const getStoredItem=key=>key==='aaj-member-artists-prototype'?JSON.stringify([{id:'assigned-artist',name:'Saved artist',works:[{id:'work-1'}]}]):'[]';
   export const storageReady=Promise.resolve();export const setStoredItem=()=>{};export const sharedStorageEnabled=()=>false;export const sharedStorageRequired=()=>false;export const publicStorageMode=()=>false;export const api=()=>{};
  `}));
 }}]
});
const module=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const artist=module.getMemberArtist('assigned-artist');
assert.equal(artist.name,'Saved artist');
assert.equal(artist.works.length,1);
assert.equal(module.getMemberArtist('missing'),null);
console.log('Artist workspace handoff passed: an assigned saved workspace loads without a browser-local application copy.');
