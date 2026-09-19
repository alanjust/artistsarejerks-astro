import {build} from 'esbuild';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
import assert from 'node:assert/strict';
const compiled=await build({entryPoints:['src/lib/test-site-access.ts'],bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'});
const {testSiteAccess}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const env={TEST_ACCESS_TEAM:'https://isolated-test.cloudflareaccess.com',TEST_ACCESS_AUD:'test-audience'};
assert.equal(await testSiteAccess(new Request('https://test.invalid'),env),false);
assert.equal(await testSiteAccess(new Request('https://test.invalid',{headers:{'Cf-Access-Jwt-Assertion':'forged'}}),{}),false);
const {privateKey,publicKey}=await generateKeyPair('RS256');
const jwk={...await exportJWK(publicKey),kid:'isolated-key',alg:'RS256',use:'sig'};
const oldFetch=globalThis.fetch;
try{
 globalThis.fetch=async()=>Response.json({keys:[jwk]});
 async function request(audience='test-audience',expiry='2m',issuer=env.TEST_ACCESS_TEAM){const token=await new SignJWT({email:'test@example.test'}).setProtectedHeader({alg:'RS256',kid:'isolated-key'}).setIssuer(issuer).setAudience(audience).setIssuedAt().setExpirationTime(expiry).sign(privateKey);return new Request('https://test.invalid',{headers:{'Cf-Access-Jwt-Assertion':token}})}
 assert.equal(await testSiteAccess(await request(),env),true);
 assert.equal(await testSiteAccess(await request('wrong-audience'),env),false);
 assert.equal(await testSiteAccess(await request('test-audience','-1m'),env),false);
 assert.equal(await testSiteAccess(await request('test-audience','2m','https://wrong.cloudflareaccess.com'),env),false);
 console.log('Private test gate checks passed: signed token accepted; missing, expired, wrong issuer and wrong audience rejected.');
}finally{globalThis.fetch=oldFetch}
