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

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const form = await request.formData();
  const submitted = form.get('password')?.toString().trim() || '';
  const from = form.get('from')?.toString() || '/hidden-grammar';

  const password = (locals as any).runtime?.env?.HG_PASSWORD || process.env.HG_PASSWORD;

  // No password configured — let them through
  if (!password) return redirect(from, 302);

  if (submitted !== password) {
    const loginUrl = `/hidden-grammar/login?from=${encodeURIComponent(from)}&error=wrong`;
    return redirect(loginUrl, 302);
  }

  const hash = await passwordHash(password);

  const secure = import.meta.env.DEV ? '' : '; Secure';
  const cookieHeader = `hg_auth=${hash}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;

  // Use meta-refresh instead of 302 redirect so the browser stores the
  // Set-Cookie header before navigating (Cloudflare follows 302s server-side).
  const safeFrom = from.startsWith('/') ? from : '/hidden-grammar';
  return new Response(
    `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${safeFrom}"></head><body></body></html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': cookieHeader,
      },
    }
  );
};
