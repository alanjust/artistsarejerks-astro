export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, locals }) => {
  const db = (locals as any).runtime?.env?.artlab_analyses;

  if (!db) {
    return new Response(JSON.stringify({ error: 'Database unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url      = new URL(request.url);
  const p        = url.searchParams;
  const tradition   = p.get('tradition')   || '';
  const confidence  = p.get('confidence')  || '';
  const functionCat = p.get('function')    || '';
  const production  = p.get('production')  || '';
  const audience    = p.get('audience')    || '';
  const mode        = p.get('mode')        || '';
  const principle   = p.get('principle')   || '';
  const weightMin   = Math.max(1, Math.min(3, parseInt(p.get('weight_min') || '1', 10)));

  const conditions: string[] = [];
  const bindings: unknown[]  = [];

  if (tradition)   { conditions.push('a.tradition_identified = ?'); bindings.push(tradition); }
  if (confidence)  { conditions.push('a.tradition_confidence = ?'); bindings.push(confidence); }
  if (functionCat) { conditions.push('a.function_category = ?');    bindings.push(functionCat); }
  if (production)  { conditions.push('a.production_level = ?');     bindings.push(production); }
  if (audience)    { conditions.push('a.audience = ?');             bindings.push(audience); }
  if (mode)        { conditions.push('a.analysis_mode = ?');        bindings.push(mode); }
  if (principle) {
    conditions.push('a.id IN (SELECT analysis_id FROM principle_firings WHERE principle_name = ? AND weight >= ?)');
    bindings.push(principle, weightMin);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const sql = `
      SELECT
        a.id, a.object_id, a.analysis_mode, a.audience,
        a.object_class_identified, a.tradition_identified, a.tradition_confidence,
        a.function_category, a.function_confidence, a.production_level,
        a.temporal_note, a.created_at,
        o.object_name, o.culture, o.period_label, o.material, o.site, o.collection
      FROM analyses a
      JOIN objects o ON o.id = a.object_id
      ${where}
      ORDER BY a.created_at DESC
      LIMIT 100
    `;

    const stmt            = db.prepare(sql);
    const analysesResult  = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();
    const analyses        = analysesResult.results as Record<string, unknown>[];

    if (analyses.length === 0) {
      return new Response(JSON.stringify({ total: 0, analyses: [], firings: [], rap_flags: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ids = analyses.map((a) => a.id as number);
    const ph  = ids.map(() => '?').join(',');

    const [firingsResult, rapResult] = await Promise.all([
      db.prepare(`SELECT * FROM principle_firings WHERE analysis_id IN (${ph}) ORDER BY analysis_id, weight DESC`).bind(...ids).all(),
      db.prepare(`SELECT * FROM rap_flags WHERE analysis_id IN (${ph}) ORDER BY analysis_id`).bind(...ids).all(),
    ]);

    return new Response(JSON.stringify({
      total:    analyses.length,
      analyses,
      firings:  firingsResult.results,
      rap_flags: rapResult.results,
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
