export const prerender = false;
import type { APIRoute } from 'astro';

// ─── URL parsers ──────────────────────────────────────────────────────────────

function parseMetUrl(url: string): string | null {
  const match = url.match(/metmuseum\.org\/art\/collection\/search\/(\d+)/i);
  return match ? match[1] : null;
}

function parseSmithsonianUrl(url: string): string | null {
  try {
    // edanmdm:xxx or edanmdm_xxx embedded anywhere in the URL
    const edanMatch = url.match(/edanmdm[_:]([^&?#/\s]+)/i);
    if (edanMatch) return `edanmdm:${edanMatch[1]}`;

    const u = new URL(url);

    // ark= query param (collections.nmnh.si.edu and other SI subdomains)
    const arkParam = u.searchParams.get('ark');
    if (arkParam) return arkParam;

    // /object/xxx path segment
    const objMatch = url.match(/\/object\/([^?#\s]+)/i);
    if (objMatch) return decodeURIComponent(objMatch[1]);

    // id= query param
    const idParam = u.searchParams.get('id');
    if (idParam) return idParam;
  } catch {
    // URL parse failure
  }
  return null;
}

// ─── Field mappers ────────────────────────────────────────────────────────────

function mapMetRecord(data: Record<string, unknown>): Record<string, string> {
  const fields: Record<string, string> = {};

  const objectName = String(data.objectName || '');
  const title      = String(data.title      || '');
  if (objectName) fields.objectType = objectName;
  // Include title in notes if it adds information beyond the object name
  if (title && title !== objectName) fields.notes = title;

  const accession = String(data.accessionNumber || '');
  if (accession) fields.accession = accession;

  const culture = String(data.culture || '');
  if (culture) fields.culture = culture;

  const period = String(data.objectDate || '');
  if (period) fields.period = period;

  const material = String(data.medium || '');
  if (material) fields.material = material;

  const dimensions = String(data.dimensions || '');
  if (dimensions) fields.dimensions = dimensions;

  const siteParts = [data.excavation, data.locale, data.locus, data.subregion, data.region, data.state]
    .map(s => String(s || '').trim())
    .filter(Boolean);
  if (siteParts.length > 0) fields.site = siteParts.join(', ');

  const collection = String(data.creditLine || data.department || '');
  if (collection) fields.collection = collection;

  fields.sourceInstitution = 'Metropolitan Museum of Art';

  const imageUrl = String(data.primaryImage || '');
  if (imageUrl) fields.imageUrl = imageUrl;

  return fields;
}

function firstText(arr: unknown[] | undefined): string {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  const item = arr[0];
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    const o = item as Record<string, unknown>;
    return String(o.content ?? o.label ?? '');
  }
  return '';
}

function mapSmithsonianRecord(record: unknown): Record<string, string> {
  const r   = record as Record<string, unknown>;
  const c   = (r.content || {}) as Record<string, unknown>;
  const dnr = (c.descriptiveNonRepeating || {}) as Record<string, unknown>;
  const is_ = (c.indexedStructured       || {}) as Record<string, unknown>;
  const ft  = (c.freetext                || {}) as Record<string, unknown>;

  const fields: Record<string, string> = {};

  const objectType = firstText(is_.object_type as unknown[]) || firstText(ft.objectType as unknown[]);
  if (objectType) fields.objectType = objectType;

  const accession = String(dnr.record_ID || firstText(ft.identifier as unknown[]) || '');
  if (accession) fields.accession = accession;

  const culture = firstText(is_.culture as unknown[]) || firstText(ft.culture as unknown[]);
  if (culture) fields.culture = culture;

  const period = firstText(is_.date as unknown[]) || firstText(ft.date as unknown[]);
  if (period) fields.period = period;

  const materialArr = Array.isArray(is_.material) ? (is_.material as unknown[]) : [];
  const materialStr = materialArr.map(m => typeof m === 'string' ? m : ((m as Record<string, unknown>)?.content ?? '')).filter(Boolean).join(', ');
  const material = materialStr || firstText(ft.physicalDescription as unknown[]);
  if (material) fields.material = material;

  if (Array.isArray(ft.physicalDescription)) {
    const dimEntry = (ft.physicalDescription as Array<Record<string, unknown>>).find(p => /dimension/i.test(String(p?.label || '')));
    if (dimEntry?.content) fields.dimensions = String(dimEntry.content);
  }

  const site = firstText(is_.place as unknown[]) || firstText(ft.place as unknown[]);
  if (site) fields.site = site;

  const collection = String(dnr.unit_name || firstText(ft.creditLine as unknown[]) || '');
  if (collection) fields.collection = collection;

  fields.sourceInstitution = 'Smithsonian Institution';

  const notes = firstText(ft.notes as unknown[]);
  if (notes) fields.notes = notes;

  const mediaParent = dnr.online_media as Record<string, unknown> | undefined;
  const mediaArr = Array.isArray(mediaParent?.media) ? (mediaParent!.media as Array<Record<string, unknown>>) : [];
  if (mediaArr.length > 0) {
    const img = mediaArr.find(m => /\.(jpg|jpeg|png|gif|webp)/i.test(String(m?.content || ''))) || mediaArr[0];
    if (img?.content) fields.imageUrl = String(img.content);
  }

  return fields;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request, locals }) => {
  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { url } = body;
  if (!url || typeof url !== 'string') {
    return new Response(JSON.stringify({ error: 'url required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const json = (obj: unknown, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  // ── Metropolitan Museum of Art ──────────────────────────────────────────────
  const metId = parseMetUrl(url);
  if (metId) {
    let res: Response;
    try {
      res = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${metId}`);
    } catch {
      return json({ error: 'Failed to reach Met API' }, 502);
    }
    if (!res.ok) return json({ error: `Met API error: ${res.status}` }, 502);
    let data: Record<string, unknown>;
    try { data = await res.json(); } catch { return json({ error: 'Could not parse Met response' }, 502); }
    if (data.message) return json({ error: String(data.message) }, 404);
    return json({ institution: 'met', fields: mapMetRecord(data) });
  }

  // ── Smithsonian ─────────────────────────────────────────────────────────────
  if (/si\.edu|n2t\.net/i.test(url)) {
    let resolvedUrl = url;
    if (/n2t\.net/i.test(url) || /^ark:/i.test(url)) {
      try {
        const redirected = await fetch(url, { redirect: 'follow' });
        resolvedUrl = redirected.url;
      } catch { /* fall through */ }
    }

    const objectId = parseSmithsonianUrl(resolvedUrl);
    if (!objectId) {
      return json({ error: 'Could not parse a Smithsonian object ID from that URL' }, 400);
    }

    const env = (locals as any).runtime?.env;
    const apiKey = env?.SMITHSONIAN_API_KEY || '';
    const isArk = objectId.startsWith('ark:');
    const localId = isArk ? objectId.replace(/^ark:\/\d+\//i, '') : objectId;
    const apiUrl = isArk
      ? `https://api.si.edu/openaccess/api/v1.0/search?q=${encodeURIComponent(`"${localId}"`)}&api_key=${apiKey}`
      : `https://api.si.edu/openaccess/api/v1.0/content/${encodeURIComponent(objectId)}?api_key=${apiKey}`;

    let siRes: Response;
    try { siRes = await fetch(apiUrl); } catch { return json({ error: 'Failed to reach Smithsonian API' }, 502); }
    if (!siRes.ok) return json({ error: `Smithsonian API error: ${siRes.status}` }, 502);

    let data: Record<string, unknown>;
    try { data = await siRes.json(); } catch { return json({ error: 'Could not parse Smithsonian response' }, 502); }

    const responseObj = data?.response as Record<string, unknown> | undefined;
    const record = isArk
      ? (Array.isArray(responseObj?.rows) ? (responseObj!.rows as unknown[])[0] : undefined)
      : responseObj;

    if (!record) {
      const isNmnh = resolvedUrl.includes('nmnh.si.edu');
      return json({
        error: isNmnh
          ? 'This NMNH record is not in the Smithsonian Open Access API — enter metadata manually'
          : 'Record not found in Smithsonian Open Access API — enter metadata manually',
      }, 404);
    }

    return json({ institution: 'smithsonian', fields: mapSmithsonianRecord(record) });
  }

  return json({ error: 'Unrecognized URL — paste a metmuseum.org or si.edu collection URL' }, 400);
};
