import type {APIRoute} from 'astro';
import {clerkClient} from '@clerk/astro/server';
import {communityFetch,gatewaySecret} from '../../../lib/community-transport';
import {communityAccess} from '../../../lib/community-access';
import {signCapability} from '../../../../community-api/security';
export const prerender=false;
export const ALL:APIRoute=async (context)=>{
 const {request,locals}=context;
 const fail=(error:string,status:number)=>Response.json({error},{status,headers:{'Cache-Control':'no-store'}});
 const url=new URL(request.url);
 if(request.method==='GET'&&(url.pathname==='/api/community/public/state'||url.pathname==='/api/community/public/regions'||/^\/api\/community\/public\/images\/[a-zA-Z0-9_-]{1,160}$/.test(url.pathname))){
  try{const response=await communityFetch(url.pathname,{signal:AbortSignal.timeout(15000)},locals);const headers=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});headers.set('Content-Type',response.headers.get('content-type')||'application/json');return new Response(response.body,{status:response.status,headers})}catch{return fail('Public directory storage unavailable.',503)}
 }
 const {isAuthenticated,userId}=locals.auth();
 if(!isAuthenticated||!userId)return fail('Sign in to access shared storage.',401);
 const access=await communityAccess(userId,locals);
 const openIntake=url.pathname==='/api/community/region-proposals'||url.pathname==='/api/community/applications';
 if(!access&&!openIntake)return fail('This account has no assigned community access.',403);
 const secret=gatewaySecret(locals);
 if(!secret)return fail('Shared storage authentication is not configured.',503);
 if(!['GET','PUT'].includes(request.method))return fail('Method not allowed.',405);
 if(request.method!=='GET'&&(request.headers.get('origin')!==url.origin||request.headers.get('x-aaj-prototype')!=='local'))return fail('Origin rejected.',403);
 const chunks:Uint8Array[]=[],reader=request.body?.getReader();let size=0;
 if(reader)while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>10*1024*1024){await reader.cancel();return fail('Upload too large.',413)}chunks.push(value)}
 let body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length}
 // Artist applications use the signed-in account's own email, never a typed one.
 if(url.pathname==='/api/community/applications'&&request.method==='PUT'){
  try{
   const intake=JSON.parse(new TextDecoder().decode(body));
   if(intake?.kind==='artist'&&!intake.action&&intake.payload&&typeof intake.payload==='object'){
    const user=await clerkClient(context).users.getUser(userId);
    const email=user.primaryEmailAddress?.emailAddress||user.emailAddresses[0]?.emailAddress;
    if(!email)return fail('Add an email address to your account before applying.',400);
    intake.payload.email=email;body=new TextEncoder().encode(JSON.stringify(intake));
   }
  }catch{return fail('Unable to read this application.',400)}
 }
 if(url.pathname==='/api/community/memberships'){
  if(!access?.administrator)return fail('Administrator access required.',403);
  if(request.method==='PUT'){
   try{const assignment=JSON.parse(new TextDecoder().decode(body));if(typeof assignment.userId!=='string'||!/^user_[a-zA-Z0-9]+$/.test(assignment.userId))return fail('Enter a valid Clerk user ID.',400);await clerkClient(context).users.getUser(assignment.userId)}catch{return fail('This user was not found in this project’s Clerk application.',400)}
  }
 }
 const capability=await signCapability(secret,{userId,administrator:access?.administrator??false,artistId:access?.artistId},request.method,url.pathname,body);
 try{
  const response=await communityFetch(url.pathname,{method:request.method,headers:{'x-aaj-prototype':'local','x-aaj-capability':capability.value,'x-aaj-signature':capability.signature,'Content-Type':request.headers.get('content-type')||'application/json'},body:request.method==='GET'?undefined:body,signal:AbortSignal.timeout(15000),redirect:'manual'},locals);
  if(response.status>=300&&response.status<400)throw new Error('Unexpected storage redirect');
  const headers=new Headers({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'});headers.set('Content-Type',response.headers.get('content-type')||'application/json');
  return new Response(response.body,{status:response.status,headers});
 }catch{return fail('Shared storage is unavailable. Your browser changes are retained.',503)}
};
