import {createExports as astroExports} from '@astrojs/cloudflare/entrypoints/server.js';
import {testSiteAccess} from './lib/test-site-access';
import type {SSRManifest} from 'astro';
export function createExports(manifest:SSRManifest){
 const server=astroExports(manifest);
 return {default:{async fetch(...args:Parameters<typeof server.default.fetch>){
  const [request,env]=args;
  if(!await testSiteAccess(request,env))return new Response('Private test site. Cloudflare Access is required.',{status:403,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
  const response=await server.default.fetch(...args);
  const headers=new Headers(response.headers);headers.set('X-Robots-Tag','noindex, nofollow');headers.set('Cache-Control','private, no-store');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
 }}};
}
