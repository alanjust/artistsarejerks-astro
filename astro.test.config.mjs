import {defineConfig} from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import clerk from '@clerk/astro';
import {webcore} from 'webcoreui/integration';
export default defineConfig({
 output:'static',
 outDir:'./dist-test',
 adapter:cloudflare({platformProxy:{enabled:false},imageService:'compile',workerEntryPoint:{path:'src/test-worker.ts'}}),
 integrations:[clerk(),webcore()],
 build:{assets:'_assets'},
 vite:{build:{target:'esnext',cssCodeSplit:false}}
});
