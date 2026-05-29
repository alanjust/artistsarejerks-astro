export const prerender = false;
import type { APIRoute } from 'astro';

const KEYS = [
  'ap_1','ap_2','ap_3','ap_4','ap_5','ap_6','ap_7','ap_8','ap_9','ap_10',
  'ap_11','ap_12','ap_13','ap_14','ap_15',
  'ta_1','ta_2','ta_4','ta_5','ta_13','ta_15','ta_20','ta_28',
  'ta_47','ta_48','ta_49','ta_51',
];

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
    const [targetRow, othersResult] = await Promise.all([
      db.prepare(`SELECT * FROM principle_vectors WHERE analysis_id = ?`).bind(id).first(),
      db.prepare(`
        SELECT
          pv.*,
          a.object_class_identified, a.object_name,
          a.tradition_identified, a.tradition_confidence,
          a.analysis_mode, a.audience, a.created_at,
          o.culture, o.period_label,
          (SELECT storage_url FROM images WHERE object_id = o.id AND is_primary = 1 LIMIT 1) AS primary_image_url
        FROM principle_vectors pv
        JOIN analyses a ON a.id = pv.analysis_id
        JOIN objects o ON o.id = a.object_id
        WHERE pv.analysis_id != ?
      `).bind(id).all(),
    ]);

    if (!targetRow) {
      return new Response(JSON.stringify({ results: [], warning: 'no_vector' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const targetMag = Math.sqrt(
      KEYS.reduce((s, k) => s + (Number((targetRow as any)[k]) || 0) ** 2, 0)
    );

    const results = targetMag === 0
      ? []
      : ((othersResult.results as any[]).map(row => {
          const dot = KEYS.reduce((s, k) =>
            s + (Number((targetRow as any)[k]) || 0) * (Number(row[k]) || 0), 0);
          const mag = Math.sqrt(KEYS.reduce((s, k) => s + (Number(row[k]) || 0) ** 2, 0));
          const similarity = mag === 0 ? 0 : dot / (targetMag * mag);
          return {
            id:                     row.analysis_id,
            object_class_identified: row.object_class_identified,
            object_name:             row.object_name,
            tradition_identified:    row.tradition_identified,
            tradition_confidence:    row.tradition_confidence,
            analysis_mode:           row.analysis_mode,
            audience:                row.audience,
            created_at:              row.created_at,
            culture:                 row.culture,
            period_label:            row.period_label,
            primary_image_url:       row.primary_image_url,
            similarity: Math.round(similarity * 1000) / 10,
          };
        }).sort((a, b) => b.similarity - a.similarity));

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
