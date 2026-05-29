export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const db = (locals as any).runtime?.env?.artlab_analyses;

  if (!db) {
    return new Response(JSON.stringify({ error: 'no db binding' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const before = await db.prepare('SELECT COUNT(*) as n FROM analyses').first();
    const ins = await db.prepare(
      "INSERT INTO objects (object_name) VALUES ('__ping__')"
    ).run();
    const objectId = ins.meta.last_row_id;
    const ins2 = await db.prepare(
      "INSERT INTO analyses (object_id, analysis_mode, pass1_text, pass2_text, pass3_text) VALUES (?, 'artifact', 'ping', 'ping', 'ping')"
    ).bind(objectId).run();
    const analysisId = ins2.meta.last_row_id;
    const verify = await db.prepare('SELECT id FROM analyses WHERE id = ?').bind(analysisId).first();
    const after = await db.prepare('SELECT COUNT(*) as n FROM analyses').first();
    await db.prepare('DELETE FROM analyses WHERE id = ?').bind(analysisId).run();
    await db.prepare('DELETE FROM objects WHERE id = ?').bind(objectId).run();

    return new Response(JSON.stringify({
      db_binding: 'present',
      count_before: (before as any)?.n,
      inserted_object_id: objectId,
      inserted_analysis_id: analysisId,
      verify_found: !!verify,
      count_after: (after as any)?.n,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : String(err),
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
