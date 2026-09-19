import {createRemoteJWKSet,jwtVerify} from 'jose';
export async function testSiteAccess(request:{headers:{get(name:string):string|null}},env:Record<string,unknown>):Promise<boolean>{
 const team=env.TEST_ACCESS_TEAM,audience=env.TEST_ACCESS_AUD;
 if(typeof team!=='string'||!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(team)||typeof audience!=='string'||!audience)return false;
 const token=request.headers.get('Cf-Access-Jwt-Assertion');if(!token)return false;
 try{await jwtVerify(token,createRemoteJWKSet(new URL(team+'/cdn-cgi/access/certs')),{issuer:team,audience,algorithms:['RS256']});return true}catch{return false}
}
