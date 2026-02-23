import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Always return 200 — feedback failure must never disrupt the user session
  const ok = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  try {
    const runtime = (locals as unknown as Record<string, unknown>).runtime as
      | { env?: Record<string, string> }
      | undefined;

    const airtableKey =
      runtime?.env?.AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
    const airtableBaseId =
      runtime?.env?.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

    if (!airtableKey || !airtableBaseId) {
      // Credentials not configured yet — silently succeed
      console.warn('submit-feedback: Airtable credentials not set. Skipping.');
      return ok;
    }

    const body = await request.json();
    const {
      rating,
      comment,
      modeId,
      promptId,
      submodeId,
      sessionId,
      timestamp,
    } = body;

    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${airtableBaseId}/HG%20Feedback`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${airtableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                Rating:    typeof rating === 'number' && rating > 0 ? rating : null,
                Comment:   comment   || '',
                Mode:      modeId    || '',
                Prompt:    promptId  || '',
                SubMode:   submodeId || '',
                SessionID: sessionId || '',
                Timestamp: timestamp || new Date().toISOString(),
              },
            },
          ],
        }),
      }
    );

    if (!airtableRes.ok) {
      const err = await airtableRes.text();
      console.error('submit-feedback: Airtable returned error:', err);
    }

  } catch (error) {
    console.error('submit-feedback: Unexpected error:', error);
  }

  return ok;
};
