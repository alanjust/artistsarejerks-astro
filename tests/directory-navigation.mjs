import fs from 'node:fs/promises';
import {transform} from 'esbuild';
import assert from 'node:assert/strict';
const page=await fs.readFile('src/pages/showing-now.astro','utf8');
const source=page.match(/<script>([\s\S]*?)<\/script>/)[1];
// The list controls must never wait on shared storage, which loads over the network.
assert.doesNotMatch(source,/community-storage|member-artists|prototype-showings/,'Showing Now script must not import storage modules');
const {code}=await transform(source,{loader:'ts',format:'esm'});
class Card {constructor(city,search,sort){this.dataset={city,search,sort};this.hidden=false}}
const cards=[new Card('Medford','alan just painting','just'),new Card('Ashland','rae adams collage','adams'),new Card('Medford','kenji sato print','sato')];
const grid={querySelectorAll:()=>cards,append(card){cards.splice(cards.indexOf(card),1);cards.push(card)}};
const options=[{value:''}];
const city={value:'',options,add(option){options.push(option)},addEventListener(){}};
const search={value:'',addEventListener(){}};
const nodes={'#city':city,'#search':search,'#result-count':{textContent:''},'#no-results':{hidden:false},'.showing-grid':grid};
globalThis.document={querySelector:selector=>nodes[selector]||null,querySelectorAll:selector=>selector==='.showing-grid .showing-card'?cards:[]};
globalThis.window={addEventListener(){}};
globalThis.Option=class{constructor(text,value){this.text=text;this.value=value}};
await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
assert.deepEqual(cards.map(card=>card.dataset.sort),['adams','just','sato'],'cards sort A–Z by last name');
assert.equal(nodes['#result-count'].textContent,'3 showings');
assert.ok(options.some(option=>option.value==='Ashland'),'city menu grows to match listed cards');
console.log('Showing Now list sorts and counts without any storage module.');
