import type { APIContext } from 'astro';

import {communityFetch,gatewaySecret} from './community-transport';
import {signCapability} from '../../community-api/security';
export async function communityAccess(userId: string | null,locals?:unknown): Promise<{artistId?:string;venueId?:string;administrator:boolean}|null> {
 const secret=gatewaySecret(locals);
 if(!userId||!secret)return null;
 const path='/api/community/access';
 const capability=await signCapability(secret,{userId,administrator:false},'GET',path,new Uint8Array());
 try{const response=await communityFetch(path,{headers:{'x-aaj-capability':capability.value,'x-aaj-signature':capability.signature},signal:AbortSignal.timeout(10000)},locals);return response.ok?await response.json():null}catch{return null}
}
export async function communityApplications(userId:string|null,locals?:unknown):Promise<{id:string;kind:'artist'|'venue';payload:Record<string,unknown>;assignedArtistId?:string|null;assignedVenueId?:string|null}[]> {
 const secret=gatewaySecret(locals);
 if(!userId||!secret)return [];
 const path='/api/community/applications';
 const capability=await signCapability(secret,{userId,administrator:false},'GET',path,new Uint8Array());
 try{const response=await communityFetch(path,{headers:{'x-aaj-capability':capability.value,'x-aaj-signature':capability.signature},signal:AbortSignal.timeout(10000)},locals);if(!response.ok)return [];const body=await response.json() as {applications?:{id:string;kind:'artist'|'venue';payload:Record<string,unknown>;assignedArtistId?:string|null;assignedVenueId?:string|null}[]};return body.applications||[]}catch{return []}
}
export async function requireCommunityAccess(context: Pick<APIContext, 'locals' | 'redirect'> & {response: {headers: Headers};url:URL}, role: 'alan' | 'administrator' | 'venue' | 'artist') {
  const {isAuthenticated, userId} = context.locals.auth();
  if (!isAuthenticated) return context.redirect('/sign-in/');
  const access = await communityAccess(userId,context.locals);
  if (!access || (role === 'administrator' ? !access.administrator : role==='venue' ? !access.administrator&&(!access.venueId||context.url.searchParams.get('venue')!==access.venueId) : role==='artist' ? !access.administrator&&(!access.artistId||context.url.searchParams.get('artist')!==access.artistId) : access.artistId !== 'artist-alan-just')) {
    return new Response('This account does not have access to this workspace.', {status: 403, headers: {'Cache-Control':'private, no-store'}});
  }
  context.response.headers.set('Cache-Control', 'private, no-store');
  return null;
}
