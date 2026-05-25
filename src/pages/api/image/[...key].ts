export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const r2 = (locals as any).runtime?.env?.artlab_images;

  if (!r2) {
    return new Response('R2 unavailable', { status: 503 });
  }

  const key = params.key;
  if (!key) {
    return new Response('Missing key', { status: 400 });
  }

  const object = await r2.get(key);
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const contentType = object.httpMetadata?.contentType || 'image/jpeg';
  const body = await object.arrayBuffer();

  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
