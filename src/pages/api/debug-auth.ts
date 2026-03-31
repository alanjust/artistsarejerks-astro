import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const rawCookie = request.headers.get('cookie') || '(none)';
  return new Response(JSON.stringify({ cookie: rawCookie }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
