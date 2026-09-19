import {spawnSync} from 'node:child_process';
import {readdir,readFile} from 'node:fs/promises';
const result=spawnSync(process.execPath,['node_modules/astro/astro.js','build','--config','astro.test.config.mjs','--mode','online-test'],{stdio:'inherit',env:{...process.env,CLERK_SECRET_KEY:'',COMMUNITY_GATEWAY_SECRET:''}});
if(result.status!==0)process.exit(result.status||1);
// The second write occurs after Astro recreates the output directory.
const {writeFile}=await import('node:fs/promises');
await writeFile('dist-test/.assetsignore','_worker.js\n_routes.json\n_redirects\n**/.DS_Store\n.DS_Store\n');
async function scan(directory){for(const entry of await readdir(directory,{withFileTypes:true})){const path=directory+'/'+entry.name;if(entry.isDirectory())await scan(path);else if(/\.(mjs|js|html|json)$/.test(path)&&/sk_(test|live)_[A-Za-z0-9]{20,}/.test(await readFile(path,'utf8')))throw new Error('A Clerk secret was embedded in the test build. Deployment blocked.')}}
await scan('dist-test');
console.log('Test bundle secret scan passed.');
