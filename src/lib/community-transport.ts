interface CommunityRuntime {runtime?:{env?:{COMMUNITY?:{fetch(request:Request):Promise<Response>};COMMUNITY_GATEWAY_SECRET?:string}}}
const testBuild=import.meta.env.MODE==='online-test';
export function gatewaySecret(locals?:unknown){
 const env=(locals as CommunityRuntime|undefined)?.runtime?.env;
 return testBuild?env?.COMMUNITY_GATEWAY_SECRET:import.meta.env.COMMUNITY_GATEWAY_SECRET;
}
export async function communityFetch(path:string,init:RequestInit={},locals?:unknown){
 if(!path.startsWith('/api/community/'))throw new Error('Invalid community path');
 const request=new Request('http://127.0.0.1:8787'+path,init);
 if(testBuild){const binding=(locals as CommunityRuntime|undefined)?.runtime?.env?.COMMUNITY;if(!binding)throw new Error('Test storage binding unavailable');return binding.fetch(request)}
 return fetch(request);
}
