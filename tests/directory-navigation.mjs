import fs from 'node:fs/promises';
import {transform} from 'esbuild';
import assert from 'node:assert/strict';
const page=await fs.readFile('src/pages/showing-now.astro','utf8');
const source=page.match(/<script>([\s\S]*?)<\/script>/)[1];
// Hold all shared-storage imports indefinitely: navigation must still initialize.
const {code}=await transform(source.replace(/import\('\.\.\/lib\/[^']+'\)/g,'new Promise(()=>{})'),{loader:'ts',format:'esm'});
class Node {
 constructor(value){this.dataset={viewChoice:value};this.attributes={};this.handlers={};this.hidden=false;this.textContent=''}
 addEventListener(name,handler){this.handlers[name]=handler}
 setAttribute(name,value){this.attributes[name]=value}
 scrollIntoView(){}
 click(){this.handlers.click()}
}
const tabs=['overview','showings','artists'].map(value=>new Node(value));
const nodes={'.directory':new Node(),'#showings-panel':new Node(),'#artists-panel':new Node(),'.view-bar':new Node(),'#community-heading':new Node(),'#community-intro':new Node(),'#result-count':new Node(),'#no-results':new Node()};
globalThis.document={querySelector:selector=>nodes[selector]||null,querySelectorAll:selector=>selector.includes('[data-view-choice]')?tabs:[],title:''};
globalThis.window={addEventListener(){}};
await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
tabs[1].click();assert.equal(nodes['.directory'].dataset.view,'showings');assert.equal(nodes['#artists-panel'].hidden,true);assert.equal(nodes['#showings-panel'].hidden,false);
tabs[2].click();assert.equal(nodes['#artists-panel'].hidden,false);assert.equal(nodes['#showings-panel'].hidden,true);assert.equal(nodes['#community-heading'].textContent,'Our Artists');assert.equal(tabs[2].attributes['aria-pressed'],'true');assert.equal(tabs[1].attributes['aria-pressed'],'false');
tabs[0].click();assert.equal(nodes['#artists-panel'].hidden,false);assert.equal(nodes['#showings-panel'].hidden,false);
console.log('Directory navigation passed while shared-storage imports remained stalled.');
