import type { APIRoute } from 'astro';

export const prerender = false;

async function passwordHash(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 48);
}

export const GET: APIRoute = async ({ request, locals }) => {
  const rawCookie = request.headers.get('cookie') || '(none)';

  const cookieValue = rawCookie.split(';')
    .map((c: string) => c.trim())
    .find((c: string) => c.startsWith('hg_auth='))
    ?.slice('hg_auth='.length) || '';

  const password = (locals as any).runtime?.env?.HG_PASSWORD || process.env.HG_PASSWORD;
  const expected = password ? await passwordHash(password) : '(no password set)';

  return new Response(JSON.stringify({
    rawCookie,
    cookieValue: cookieValue || '(not found)',
    passwordSet: !!password,
    expected,
    match: cookieValue === expected,
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
};
