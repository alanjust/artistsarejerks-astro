import { defineMiddleware } from 'astro:middleware';

async function passwordHash(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 48);
}

export const onRequest = defineMiddleware(async ({ url, cookies, locals, redirect }, next) => {
  const { pathname } = url;

  // Only gate the /hidden-grammar/* tree
  if (!pathname.startsWith('/hidden-grammar')) return next();

  // Skip auth in local dev — wrangler proxy doesn't forward Set-Cookie to the browser
  if (import.meta.env.DEV) return next();

  // Never gate the login page or auth endpoint themselves
  if (pathname === '/hidden-grammar/login' || pathname.startsWith('/api/hg-auth')) return next();

  const password = (locals as any).runtime?.env?.HG_PASSWORD || process.env.HG_PASSWORD;

  // No password configured — allow through (local dev fallback)
  if (!password) return next();

  const rawCookieHeader = request.headers.get('cookie') || '';
  const cookieValue = rawCookieHeader.split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('hg_auth='))
    ?.slice('hg_auth='.length) || '';

  const expected = await passwordHash(password);

  if (!cookieValue || cookieValue !== expected) {
    const reason = cookieValue && cookieValue !== expected ? 'expired' : '';
    const from = encodeURIComponent(pathname + url.search);
    const loginUrl = `/hidden-grammar/login?from=${from}${reason ? '&reason=' + reason : ''}`;
    return redirect(loginUrl, 302);
  }

  return next();
});
