export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const db = (locals as any).runtime?.env?.artlab_analyses;

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = parseInt(params.id || '', 10);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const [analysisRow, firingsResult, rapResult, imagesResult, vectorRow] = await Promise.all([
      db.prepare(`
        SELECT
          a.id, a.object_id, a.analysis_mode, a.audience,
          a.object_class_identified, a.tradition_identified, a.tradition_confidence,
          a.function_category, a.function_confidence, a.production_level,
          a.temporal_note, a.created_at,
          a.pass1_text, a.pass2_text, a.pass3_text,
          o.object_name, o.accession_number, o.culture, o.period_label,
          o.material, o.dimensions, o.site, o.collection,
          o.source_institution, o.source_url, o.field_notes, o.notes,
          o.object_class, o.condition, o.research_context
        FROM analyses a
        JOIN objects o ON o.id = a.object_id
        WHERE a.id = ?
      `).bind(id).first(),
      db.prepare(`SELECT * FROM principle_firings WHERE analysis_id = ? ORDER BY weight DESC`).bind(id).all(),
      db.prepare(`SELECT * FROM rap_flags WHERE analysis_id = ? ORDER BY id`).bind(id).all(),
      db.prepare(`SELECT storage_url, view_label, is_primary FROM images WHERE object_id = (SELECT object_id FROM analyses WHERE id = ?) ORDER BY is_primary DESC, id ASC`).bind(id).all(),
      db.prepare(`SELECT * FROM principle_vectors WHERE analysis_id = ?`).bind(id).first(),
    ]);

    if (!analysisRow) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      analysis:  analysisRow,
      firings:   firingsResult.results,
      rap_flags: rapResult.results,
      images:    imagesResult.results,
      vector:    vectorRow ?? null,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const db  = (locals as any).runtime?.env?.artlab_analyses;
  const r2  = (locals as any).runtime?.env?.artlab_images;

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = parseInt(params.id || '', 10);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const analysis = await db.prepare(
      'SELECT object_id FROM analyses WHERE id = ?'
    ).bind(id).first() as { object_id: number } | null;

    if (!analysis) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const objectId = analysis.object_id;

    // Delete analysis-scoped rows (CASCADE may not be enforced in D1)
    await db.batch([
      db.prepare('DELETE FROM principle_vectors  WHERE analysis_id = ?').bind(id),
      db.prepare('DELETE FROM principle_firings  WHERE analysis_id = ?').bind(id),
      db.prepare('DELETE FROM rap_flags          WHERE analysis_id = ?').bind(id),
      db.prepare('DELETE FROM section_readings   WHERE analysis_id = ?').bind(id),
      db.prepare('DELETE FROM connections_records WHERE analysis_id = ?').bind(id),
      db.prepare('DELETE FROM analyses           WHERE id = ?').bind(id),
    ]);

    // Delete object + images only if no other analyses reference it
    const remaining = await db.prepare(
      'SELECT COUNT(*) as n FROM analyses WHERE object_id = ?'
    ).bind(objectId).first() as { n: number };

    if (remaining.n === 0) {
      const imageRows = await db.prepare(
        'SELECT storage_url FROM images WHERE object_id = ?'
      ).bind(objectId).all();

      if (r2 && imageRows.results.length > 0) {
        await Promise.allSettled(
          (imageRows.results as { storage_url: string }[]).map(row => r2.delete(row.storage_url))
        );
      }

      await db.batch([
        db.prepare('DELETE FROM images  WHERE object_id = ?').bind(objectId),
        db.prepare('DELETE FROM objects WHERE id = ?').bind(objectId),
      ]);
    }

    return new Response(JSON.stringify({ deleted: id }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
