import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import principlesData from '../../data/hg-principles.json';

export const prerender = false;

const PRINCIPLE_NAMES: string[] = (principlesData.principles as any[])
  .map((p: any) => p.name as string)
  .sort((a, b) => b.length - a.length);

const PASS1_PROMPT = `Describe only what you can directly observe in this image. Cover: what's present and where, spatial relationships, how edges behave, how light and dark are distributed, color relationships, surface quality, what draws the eye and what doesn't, how near and far space is handled. Be specific and granular. Report in the order the eye encounters things. No interpretation. No art historical references. No quality judgments.`;

const PASS2_PROMPT = (pass1: string, principleNames: string[]) => `You are analyzing a work of art across four independent registers. A formal observation pass has already been completed — use it as your evidence base, but look at the image directly too, especially for the material and cultural registers.

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

FRAMEWORK TERMINOLOGY: When your analysis references a perceptual or compositional mechanism that corresponds to one of the following named Principles, use the exact name as written. Use these names naturally in prose — don't force them, but don't paraphrase them either:

${principleNames.join(', ')}

---

CLAIMS AND CERTAINTY:
State intent and agency as readings, not facts. "This reads as deliberate" is allowed. "This was deliberate" is not. The test: if the claim requires knowing what was in someone's head — the artist's intent, the figure's motivation, the work's conceptual position — frame it as an observation about effect or a possible reading. This applies in all four registers, the Synthesis, and the Noise section.

---

PROCESS ORDER vs. OUTPUT ORDER:
Complete your full analysis of all four registers before writing any output. Then present results in this order:
1. SYNTHESIS — write this first
2. PERCEPTUAL
3. MATERIAL AND FORMAL
4. CULTURAL
5. CONCEPTUAL
6. NOISE — CONSOLIDATED — write this last

Run all four registers. Do not collapse them into each other. A finding in one register is not evidence in another.

OUTPUT FORMAT FOR EACH REGISTER:
Write full detailed prose only. No bullet summaries. No inline noise sub-sections — all noise findings go to the NOISE — CONSOLIDATED section at the end.

---

SYNTHESIS

Which register is this work most alive in? Where does it earn the most — and where is it losing ground?

If an audience context was provided, address directly what's actionable for that person.

One closing sentence. Not a quality verdict. A direction.

---

REGISTER 1: PERCEPTUAL

What does the eye do with this work in the first seconds of looking — before interpretation, before meaning?

Analyze: where attention goes first and why. What holds the eye and what lets it go. How visual weight is distributed. Where contrast, edges, and spatial relationships create movement or stop it. What the work is asking a viewer to do visually — and whether those requests conflict.

Plain language. Name specific visual features.

---

REGISTER 2: MATERIAL AND FORMAL

What is this work physically made of, and how is the making visible?

Analyze: what medium, substrate, and process are present. Whether the surface is honest about how it was constructed. Whether the physical choices support or contradict what the work appears to be doing. What the material asks of the viewer up close versus at a distance.

---

REGISTER 3: CULTURAL

Where does this work sit in the larger field of what gets valued, desired, and validated — by institutions, markets, critics, communities?

Draw on the full breadth of art history and cultural knowledge. No framework limits.

Analyze: what cultural conversation this work is entering. What it signals about where it belongs — and whether those signals are legible to the audience it needs to reach. What institutions or communities would recognize it and why. Whether it's building on, departing from, or ignoring the cultural conditions around it.

Illegibility here is not automatically failure. It may be deliberate transgression. Name which and say why.

---

REGISTER 4: CONCEPTUAL

What argument or system of ideas is this work in dialogue with?

Draw on the full breadth of art theory, philosophy, and art history. No framework limits.

Analyze: what intellectual or artistic tradition this work is responding to. What position it appears to be taking — and whether the visual and material choices support that position. Where thinness in the perceptual register might be the conceptual point. What historical precedents matter for reading this accurately.

---

NOISE — CONSOLIDATED

Four named sub-sections. Each names the specific conflict or interference. If nothing is interfering in a register, say so in one sentence.

PERCEPTUAL: What is interfering with a clean read? Name the specific visual conflict.

MATERIAL: Where are the material or formal choices fighting the work's own logic?

CULTURAL: What is preventing this work from being read clearly within the cultural field it's aimed at?

CONCEPTUAL: Where does the work undercut its own argument?

End with one sentence: which of these noise findings are intentional — serving a purpose in another register — versus accidental across all four.

---

Write directly. Specific. No hedging. Short sentences where a short sentence is enough.`;

function getAudienceFraming(audience: string): string {
  const a = audience?.toLowerCase() || '';

  if (a.includes('progress') || a.includes('wip') || a.includes('making')) {
    return `AUDIENCE FRAMING — ARTIST, WORK IN PROGRESS:
The Material/Formal and Perceptual registers are most live for this person. Frame noise findings as decisions still available — not verdicts on what's broken. The work is open. What can still change? What's worth reconsidering before going further? Keep the Conceptual and Cultural registers thorough but frame them as context, not urgency.`;
  }

  if (a.includes('show') || a.includes('gallery') || a.includes('exhibit') || a.includes('pre-show')) {
    return `AUDIENCE FRAMING — ARTIST, PRE-SHOW REVIEW:
The Cultural register is primary here. The work is done — the question is whether it's legible to the institution and audience the show is aimed at. Frame noise findings around what might misfire in that specific context. If findings suggest the work may read differently than intended within the show's thesis, say so directly. Note: if this is one of several works, flag any signals that might create coherence problems across the body of work.`;
  }

  if (a.includes('curator') || a.includes('preparator') || a.includes('museum')) {
    return `AUDIENCE FRAMING — CURATOR OR MUSEUM PREPARATOR:
The Cultural register is the primary instrument. The Conceptual register matters for building or testing a curatorial argument. Frame noise findings around what might weaken an exhibit's through-line or confuse the institutional thesis. This person is making decisions about placement and grouping — findings should be actionable at that level.`;
  }

  if (a.includes('critic') || a.includes('educator') || a.includes('teacher') || a.includes('student')) {
    return `AUDIENCE FRAMING — ART CRITIC OR EDUCATOR:
All four registers carry equal weight. The noise detector here is pedagogical — its job is to show how domain failures are distinct from each other, so they can be named and taught separately. Don't collapse findings into a single verdict. The goal is to model the analytical distinction between perceptual failure, material dishonesty, cultural illegibility, and conceptual contradiction — because most criticism conflates them.`;
  }

  if (a.includes('history') || a.includes('instructor') || a.includes('canon') || a.includes('historical')) {
    return `AUDIENCE FRAMING — ART HISTORY INSTRUCTOR:
The Conceptual/Historical register is primary. The Cultural register explains the work's reception and canon position. The noise detector has a specific job here: show where historical significance lives despite what might look like failure in another domain. Mondrian is the model — perceptual thinness is the conceptual argument. Frame findings to help an instructor explain why a work matters in the canon even when students might initially find it visually unrewarding.`;
  }

  return audience
    ? `AUDIENCE CONTEXT: ${audience}\nShape the synthesis and noise findings to be actionable for this specific context.`
    : '';
}

function buildArtworkContext(fields: Record<string, string>): string {
  const labels: Record<string, string> = {
    artist:     'Artist',
    title:      'Title',
    year:       'Date',
    medium:     'Medium',
    substrate:  'Support / Substrate',
    dimensions: 'Dimensions',
    genre:      'Type',
    series:     'Series',
    movement:   'Movement / Style',
    collection: 'Collection',
    exhibition: 'Exhibition context',
    edition:    'Edition',
    condition:  'Condition',
    notes:      'Notes',
  };

  const lines = Object.entries(fields)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${labels[k] || k}: ${v}`);

  return lines.length > 0
    ? `ARTWORK DOCUMENTATION:\n${lines.join('\n')}\n`
    : '';
}

export const POST: APIRoute = async ({ request, locals }) => {
  const apiKey = locals.runtime?.env?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { image, audience, fields = {} } = body;

  if (!image) {
    return new Response(JSON.stringify({ error: 'No image provided' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const imageData = image.split(',')[1];
  const mediaType = image.split(';')[0].split(':')[1];
  const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!supportedTypes.includes(mediaType)) {
    return new Response(
      JSON.stringify({ error: `Unsupported image format: ${mediaType}. Please convert to JPEG or PNG and try again.` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const anthropic = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        send({ type: 'status', message: 'Pass 1 — formal observation…' });

        const pass1Stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: 'You are a visual observer. Report only what is directly present. No interpretation, no art history, no quality judgments.',
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: imageData } },
              { type: 'text', text: PASS1_PROMPT },
            ],
          }],
        });

        for await (const event of pass1Stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            send({ type: 'pass1_delta', text: event.delta.text });
          }
        }

        const pass1Msg = await pass1Stream.finalMessage();
        const pass1Text = pass1Msg.content
          .filter((b: any) => b.type === 'text')
          .map((b: any) => b.text)
          .join('\n\n');

        send({ type: 'pass1_complete', pass1: pass1Text });
        send({ type: 'status', message: 'Pass 2 — four domain readings…' });

        const artworkContext = buildArtworkContext(fields);
        const audienceFraming = getAudienceFraming(audience || '');
        const contextBlock = [artworkContext, audienceFraming].filter(Boolean).join('\n');
        const pass2UserText = (contextBlock ? contextBlock + '\n---\n\n' : '') + PASS2_PROMPT(pass1Text, PRINCIPLE_NAMES);

        const pass2Stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 8000,
          system: 'You are a rigorous art analyst working across perceptual, material, cultural, and conceptual registers simultaneously.',
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: imageData } },
              { type: 'text', text: pass2UserText },
            ],
          }],
        });

        for await (const event of pass2Stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            send({ type: 'delta', text: event.delta.text });
          }
        }

        const pass2Msg = await pass2Stream.finalMessage();
        const pass2Text = pass2Msg.content
          .filter((b: any) => b.type === 'text')
          .map((b: any) => b.text)
          .join('\n\n');

        send({ type: 'complete', success: true, pass1: pass1Text, analysis: pass2Text });

      } catch (err) {
        try {
          send({ type: 'error', error: err instanceof Error ? err.message : String(err) });
        } catch { /* controller may already be closed */ }
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
};
