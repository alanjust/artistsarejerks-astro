import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import principlesData from '../../data/hg-principles.json';

export const prerender = false;

// Tier A only — universal perceptual principles, domain-agnostic
const PRINCIPLE_NAMES: string[] = (principlesData.principles as any[])
  .filter((p: any) => p.tier === 'A')
  .map((p: any) => p.name as string)
  .sort((a, b) => b.length - a.length);

const PASS1_PROMPT = `Describe only what you can directly observe in this image. Cover: what's present and where, spatial relationships, how edges behave, how light and dark are distributed, color relationships, surface quality, what draws the eye and what doesn't, how near and far space is handled. Be specific and granular. Report in the order the eye encounters things. No interpretation. No art historical references. No quality judgments.`;

const ARTIFACT_PROMPT = (pass1: string, principleNames: string[], audience: string) => {
  const audienceFrame = audience.includes('curator')
    ? 'You are analyzing this artifact for a museum curator considering acquisition, display, and cultural significance.'
    : audience.includes('educator')
    ? 'You are analyzing this artifact for an educator preparing to teach with it — what it demonstrates, what it makes visible, why it matters as a teaching example.'
    : 'You are analyzing this artifact for a researcher. Be precise, systematic, and grounded in observable evidence.';

  return `${audienceFrame}

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

FRAMEWORK REFERENCE: When your analysis references a perceptual or visual mechanism that corresponds to one of the following named Principles, use the exact name as written and follow it immediately with a plain-English phrase explaining what it means in this specific context:

${principleNames.join(', ')}

---

IMPORTANT: This is an archaeological or anthropological artifact, not a work of fine art. Do not apply fine art criticism, aesthetic evaluation, or art market vocabulary. Do not use words like "painterly," "compositional tension," "aesthetic," or "artistic." Evaluate against what the object was made to do and what it tells us about the culture that produced it. State uncertainty plainly — if something cannot be determined from the image, say so.

---

Analyze this artifact across four dimensions. Write full prose for each. Use these headers exactly:

## FORM AND CONSTRUCTION
What is this object physically? Describe the form, material, construction technique, surface treatment, scale, and condition as observable from the image. What does the physical evidence tell you about how it was made?

## FUNCTION AND USE
What was this object used for? Ground your analysis in the physical evidence — form, wear patterns, surface treatment, context indicators visible in the image. Where function cannot be determined from the image alone, state what the evidence suggests and what remains uncertain.

## CULTURAL CONTEXT
Where does this object sit in the cultural context of its makers? What does it signal about the society that produced it — its technology, social organization, trade relationships, or belief systems? Draw on what is observable in the object and what is known about the cultural tradition it belongs to. Frame interpretations as readings supported by evidence, not settled conclusions.

## ICONOGRAPHIC CONTENT
What visual program, symbolic content, or decorative system is present? Describe specific motifs, figures, patterns, or symbols. What tradition or convention do they belong to? Where iconographic meaning is contested or uncertain, name the specific visual evidence and state what readings it supports.`;
};

const COMPETENCY_PROMPT = (pass1: string, pass2: string, audience: string): string => {
  const audienceLine = audience
    ? `This analysis was prepared for: ${audience}.\n\n`
    : '';

  return `${audienceLine}An analysis of an archaeological artifact has been completed. Your job is to make the analytical moves explicit — to help the person who received this analysis build skills they can apply to other artifacts.

FORMAL OBSERVATIONS (PASS 1):
${pass1}

ANALYSIS (PASS 2):
${pass2}

---

Write two sections. Use these headers exactly:

## WAYS OF LOOKING

Identify 3–4 analytical habits this analysis demonstrated that apply to any artifact — not just this one. For each one, start with a specific moment from this analysis before naming the general habit. Calibrate to the person: if the audience is a researcher, frame around evidence and uncertainty; if a curator, around significance and context; if an educator, around what makes this a useful teaching object.

## WHAT THIS ARTIFACT MAKES VISIBLE

Identify 2–3 things this specific artifact made unusually clear — aspects of material culture, construction technique, or cultural practice that you can now recognize in other objects because you've looked carefully at this one. Open with what was concrete and specific in this artifact before naming the larger pattern.

Write for someone curious and smart who doesn't already speak the vocabulary. Open with something specific from this artifact before naming the principle. Jargon only when immediately followed by plain English. Total: 300–450 words.`;
};

function buildArtifactContext(fields: Record<string, string>): string {
  const labels: Record<string, string> = {
    culture:    'Culture / People',
    period:     'Period / Date',
    objectType: 'Object Type',
    material:   'Material',
    dimensions: 'Dimensions',
    site:       'Site / Provenance',
    collection: 'Collection / Location',
    condition:  'Condition',
    context:    'Research Context',
    notes:      'Notes',
  };

  const lines = Object.entries(fields)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${labels[k] || k}: ${v}`);

  return lines.length > 0
    ? `ARTIFACT DOCUMENTATION:\n${lines.join('\n')}\n`
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

        const audienceLower = (audience || '').toLowerCase();
        const statusMsg = audienceLower.includes('curator')
          ? 'Pass 2 — curatorial analysis…'
          : audienceLower.includes('educator')
          ? 'Pass 2 — teaching context…'
          : 'Pass 2 — artifact analysis…';
        send({ type: 'status', message: statusMsg });

        const artifactContext = buildArtifactContext(fields);
        const pass2UserText = (artifactContext ? artifactContext + '\n---\n\n' : '') +
          ARTIFACT_PROMPT(pass1Text, PRINCIPLE_NAMES, audience || '');

        const pass2Stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          system: 'You are a specialist in archaeological and anthropological artifact analysis. Evaluate objects against what they were made to do and what they reveal about the cultures that produced them. Do not apply fine art criticism, aesthetic vocabulary, or art market language. Be precise, evidence-grounded, and honest about uncertainty. When you cannot determine something from the image, say so.',
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

        send({ type: 'status', message: 'Pass 3 — what to take forward…' });

        const pass3Msg = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: 'You are an educator writing for someone curious and smart who wants to understand how to look at artifacts. Write the way Ira Glass tells a story: open with something concrete and recognizable, move toward the insight, land it plainly. If you use a technical term, follow it immediately with plain English. The goal is to leave the reader thinking "I can do that next time."',
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: imageData } },
              { type: 'text', text: COMPETENCY_PROMPT(pass1Text, pass2Text, audience || '') },
            ],
          }],
        });

        const pass3Text = pass3Msg.content
          .filter((b: any) => b.type === 'text')
          .map((b: any) => b.text)
          .join('\n\n');

        send({ type: 'complete', success: true, pass1: pass1Text, analysis: pass2Text, competency: pass3Text });

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
