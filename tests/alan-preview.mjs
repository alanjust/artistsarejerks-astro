import {build} from 'esbuild';
import assert from 'node:assert/strict';
// Two galleries reproduce the old bug: the exhibition grid comes first.
class Element {
 constructor(tag){this.tagName=tag;this.children=[];this.dataset={};this.attributes={};this.textContent=''}
 append(...nodes){this.children.push(...nodes)}
 querySelectorAll(){return this.children.flatMap(node=>[node,...node.querySelectorAll('*')])}
 getAttributeNames(){return Object.keys(this.attributes)}
 setAttribute(name,value){this.attributes[name]=value}
}
const exhibition=new Element('div'),selected=new Element('div');
const work={id:'iris',title:'Iris',medium:'Painting',year:'2026',visibility:'public',sale:'private-price',price:'hidden-price',imageKey:'iris-image',sampleImage:''};
globalThis.previewState={uploadedWorks:[work,{...work,id:'hidden',title:'Hidden artwork',visibility:'private'}]};
globalThis.document={querySelector:selector=>selector==='[data-selected-artwork]'?selected:selector==='.artwork-grid'?exhibition:null,createElement:tag=>new Element(tag)};
const result=await build({entryPoints:['src/lib/alan-artwork.ts'],bundle:true,write:false,format:'esm',plugins:[{name:'isolated-preview-data',setup(builder){builder.onResolve({filter:/^\.\/(community-storage|member-artists)$/},args=>({path:args.path,namespace:'preview-data'}));builder.onLoad({filter:/.*/,namespace:'preview-data'},args=>({contents:args.path.endsWith('community-storage')?`export const getStoredItem=()=>JSON.stringify(globalThis.previewState);export const sharedStorageRequired=()=>true;export const sharedStorageEnabled=()=>true;`:`export const imageUrl=async work=>'/api/community/public/images/'+work.imageKey;`,loader:'js'}))}}]});
const {renderAlanUploads}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
await renderAlanUploads(false);
assert.equal(exhibition.children.length,0,'upload must not be attached to the exhibition gallery');
assert.equal(selected.children.length,1,'only visible uploads appear in Selected work');
const card=selected.children[0],nodes=card.querySelectorAll('*');
assert.ok(nodes.some(node=>node.textContent==='Iris'));
assert.ok(!nodes.some(node=>node.textContent.includes('hidden-price')));
const image=nodes.find(node=>node.tagName==='img');assert.equal(image.src,'/api/community/public/images/iris-image');assert.equal(image.loading,'lazy');assert.equal(image.decoding,'async');
console.log('Artist preview regression passed: correct gallery, visibility, private price, and image loading.');
