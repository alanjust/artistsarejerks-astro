import type { APIRoute } from 'astro';

function parseSmithsonianUrl(url: string): string | null {
  try {
    // edanmdm:xxx or edanmdm_xxx embedded anywhere in the URL
    const edanMatch = url.match(/edanmdm[_:]([^&?#/\s]+)/i);
    if (edanMatch) return `edanmdm:${edanMatch[1]}`;

    // /object/xxx path segment
    const objMatch = url.match(/\/object\/([^?#\s]+)/i);
    if (objMatch) return decodeURIComponent(objMatch[1]);

    // id= query param
    const u = new URL(url);
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

  const objectId = parseSmithsonianUrl(url);
  if (!objectId) {
    return new Response(JSON.stringify({ error: 'Could not parse a Smithsonian object ID from that URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env;
  const apiKey = env?.SMITHSONIAN_API_KEY || '';
  const apiUrl = `https://api.si.edu/openaccess/api/v1.0/content/${encodeURIComponent(objectId)}?api_key=${apiKey}`;

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

  const record = data?.response;
  if (!record) {
    return new Response(JSON.stringify({ error: 'Record not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fields = mapSmithsonianRecord(record);
  return new Response(JSON.stringify({ institution: 'smithsonian', fields }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
