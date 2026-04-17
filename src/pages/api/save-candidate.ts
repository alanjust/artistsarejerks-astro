import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { candidate, observation } = body;

    if (!candidate || typeof candidate !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Missing candidate object' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cloudflare Workers do not have Node fs — this endpoint is dev-only.
    // Check for Cloudflare runtime and return a helpful error if not in dev.
    if (locals.runtime?.env) {
      return new Response(
        JSON.stringify({
          error: 'save-candidate is a local development endpoint. Run npm run dev to use it.',
          candidate,
          observation,
        }),
        { status: 501, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Resolve path relative to project root (two levels up from src/pages/api/)
    const candidatesPath = resolve(process.cwd(), 'src/data/hg-candidates.json');

    let existing: any[] = [];
    try {
      const raw = await readFile(candidatesPath, 'utf-8');
      existing = JSON.parse(raw);
    } catch {
      // File missing or malformed — start fresh
      existing = [];
    }

    const entry = {
      ...candidate,
      _savedAt: new Date().toISOString(),
      _sourceObservation: observation || null,
    };

    existing.push(entry);

    await writeFile(candidatesPath, JSON.stringify(existing, null, 2) + '\n', 'utf-8');

    return new Response(
      JSON.stringify({ success: true, count: existing.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Save candidate error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Save failed', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
