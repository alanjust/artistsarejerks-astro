export const prerender = false;
import type { APIRoute } from 'astro';

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
  const r     = record as Record<string, unknown>;
  const c     = (r.content || {}) as Record<string, unknown>;
  const dnr   = (c.descriptiveNonRepeating || {}) as Record<string, unknown>;
  const is_   = (c.indexedStructured       || {}) as Record<string, unknown>;
  const ft    = (c.freetext                || {}) as Record<string, unknown>;

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

  // n2t.net ARK resolver URLs redirect to the real SI subdomain URL — follow
  // the redirect chain so parseSmithsonianUrl can extract the object ID.
  let resolvedUrl = url;
  if (/n2t\.net/i.test(url) || /^ark:/i.test(url)) {
    try {
      const redirected = await fetch(url, { redirect: 'follow' });
      resolvedUrl = redirected.url;
    } catch {
      // fall through and try parsing the original URL
    }
  }

  const objectId = parseSmithsonianUrl(resolvedUrl);
  if (!objectId) {
    return new Response(JSON.stringify({ error: 'Could not parse a Smithsonian object ID from that URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = (locals as any).runtime?.env;
  const apiKey = env?.SMITHSONIAN_API_KEY || '';

  // ARK IDs go through the search API; EDAN IDs go through the content API.
  const isArk = objectId.startsWith('ark:');
  const apiUrl = isArk
    ? `https://api.si.edu/openaccess/api/v1.0/search?q=${encodeURIComponent(objectId)}&api_key=${apiKey}`
    : `https://api.si.edu/openaccess/api/v1.0/content/${encodeURIComponent(objectId)}?api_key=${apiKey}`;

  let siResponse: Response;
  try {
    siResponse = await fetch(apiUrl);
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to reach Smithsonian API' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!siResponse.ok) {
    return new Response(JSON.stringify({ error: `Smithsonian API error: ${siResponse.status}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let data: Record<string, unknown>;
  try {
    data = await siResponse.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Could not parse Smithsonian response' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Search returns rows[]; content returns the record directly.
  const responseObj = data?.response as Record<string, unknown> | undefined;
  const record = isArk
    ? (Array.isArray(responseObj?.rows) ? (responseObj!.rows as unknown[])[0] : undefined)
    : responseObj;

  if (!record) {
    const rowCount = Array.isArray(responseObj?.rows) ? (responseObj!.rows as unknown[]).length : 'rows not array';
    const keys = Object.keys(responseObj || {}).join(',');
    return new Response(JSON.stringify({ error: `Record not found — rows:${rowCount} keys:${keys} url:${apiUrl}` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fields = mapSmithsonianRecord(record);
  return new Response(JSON.stringify({ institution: 'smithsonian', fields }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
