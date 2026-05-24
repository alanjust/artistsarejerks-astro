import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import principlesData from '../../data/hg-principles.json';

export const prerender = false;

// Tier A only — universal perceptual principles, domain-agnostic
const PRINCIPLE_NAMES: string[] = (principlesData.principles as any[])
  .filter((p: any) => p.tier === 'A')
  .map((p: any) => p.name as string)
  .sort((a, b) => b.length - a.length);

const PASS1_PROMPT_SINGLE = `Describe only what you can directly observe in this image. Cover: what's present and where, spatial relationships, how edges behave, how light and dark are distributed, color relationships, surface quality, what draws the eye and what doesn't, how near and far space is handled. Be specific and granular. Report in the order the eye encounters things. No interpretation. No art historical references. No quality judgments.`;

const PASS1_PROMPT_MULTI = (count: number) =>
  `You are looking at ${count} images of the same artifact. Each image is labeled with its view. Work through each view in sequence, using the label as a header. For each view, describe only what you can directly observe — what's present and where, spatial relationships, how edges behave, how light and dark are distributed, color relationships, surface quality, what draws the eye. Be specific and granular. No interpretation. No art historical references. No quality judgments.`;

const ARTIFACT_PROMPT = (pass1: string, principleNames: string[], audience: string, views: string[] = []) => {
  const audienceFrame = audience.includes('curator')
    ? `You are analyzing this artifact for a museum curator. Address: typological placement and what it establishes, condition and what it affects interpretively, cultural significance and what tradition this object represents, and what comparable documented examples exist. Use field vocabulary precisely.`
    : audience.includes('educator')
    ? `You are analyzing this artifact for an educator. Prioritize: what this object makes directly visible about production technique, cultural practice, or social organization — things a student can learn to see in other objects by looking carefully at this one.`
    : `You are analyzing this artifact for a researcher. Be precise, systematic, and evidence-grounded. Maintain explicit uncertainty where the image cannot resolve a question.`;

  const viewLine = views.length > 1
    ? `\nAVAILABLE VIEWS: ${views.join(', ')} — draw on all views in your analysis where relevant.\n`
    : '';

  return `${audienceFrame}
${viewLine}
---

DISPLACEMENT — read before analyzing:

Do not apply fine art critical frameworks. Do not assess this object for aesthetic merit, compositional tension, artistic achievement, or formal innovation. Do not use language from museum wall text, gallery criticism, or art market vocabulary. Do not use: painterly, aesthetic, artistic, composition as an evaluative term, or any language that treats this object as made for contemplation or display.

This object was made by people living within a specific cultural tradition, for purposes embedded in that tradition. Evaluate it against what it was made to do and what it tells us about the people who made it.

Do not apply Western individualist frameworks to production. The maker was working within strong cultural conventions. Variability within those conventions is social and cultural signal — not personal artistic expression.

Frame all interpretive claims as readings supported by specific visual evidence. Where meaning cannot be determined from the image, say so plainly. The people who made this object are gone; meaning cannot be fully recovered.

---

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

PERCEPTUAL PRINCIPLES REFERENCE: Where your analysis references a perceptual mechanism that matches one of the following, use the exact name and follow it immediately with a plain-English phrase explaining what it means in this specific context:

${principleNames.join(', ')}

---

EVALUATIVE FRAMEWORK:

Analyze across these four dimensions. For each, work from what is directly observable before moving to interpretation. Use these exact headers.

## FORM AND CONSTRUCTION

Describe vessel form: rim diameter (estimate from proportions if not documented), depth, wall curvature, base form. Assess wall thickness consistency — even walls indicate skilled coil construction; variation signals production-stage issues. Look for coil construction evidence: oblique striations, coil junctures at breaks or thin spots, paddle-and-anvil compression marks on the exterior.

Assess surface treatment: slip coverage and quality (even, well-adhered white vs. mottled or thin), burnishing degree (uniform light reflection vs. textured surface), slip color (brilliant white suggests high kaolin content; cream or buff suggests lower-grade preparation).

Assess paint: mineral paint (matte or semi-matte, permanent, iron-based) vs. carbon/organic paint (potentially shiny surface). Read line quality directly — single-stroke control, line weight consistency, evidence of hesitation or correction.

## FUNCTION AND USE

What does the form indicate about use? A bowl used for food preparation or serving shows different proportions and wear than one made for ritual or mortuary purposes. Look for use wear: interior abrasion from food contact, sooting on exterior base surfaces. Ancient repairs (pitch fills, drilled holes for lacing breaks) indicate the vessel was valued enough to repair during its working life.

If a kill hole is present — a deliberate perforation through the base — this confirms burial context. Note: location (centered vs. off-center), method (punched vs. drilled), and placement relative to any image on the surface.

Where function cannot be determined from the image, state what the evidence suggests and what remains uncertain.

## CULTURAL CONTEXT

Place this object within what is known about the tradition that produced it. What does the construction technique, surface treatment, and design system tell us about the technology available and the production conventions followed? What does the investment level — quality of slip preparation, precision of design execution, vessel form complexity — signal about the social context of production?

Address: Was this household production or does the quality suggest emergent specialization? What does the iconographic program (if present) signal about social identity, community membership, or ritual role? What trade relationships or cultural contacts does the material or design vocabulary suggest?

Frame all interpretations as readings supported by specific observable evidence. Where the evidence is insufficient to support a claim, say so.

## ICONOGRAPHIC CONTENT

Describe before interpreting. What figures, motifs, or geometric elements are present? Where are they located in the design field? How is the field organized — quartered, halved, continuous border, central medallion? Is the program figurative, geometric, or mixed?

If figurative: identify specific figure types (species, human, composite being). Note whether action is depicted (hunting scene, movement, interaction between figures) or whether the figure functions emblematically. Composite figures — beings that combine human and animal characteristics — carry higher interpretive weight and greater uncertainty.

After full description: what corpus parallels exist? What readings does the visual evidence support? Where iconographic meaning is contested or cannot be determined from this image alone, name the specific evidence and state what remains open.

---

REFERENCE CLASS: Treat well-documented assemblages — the Swarts Ruin collection (Peabody Museum) and the NAN Ranch material (Shafer 2003) — as your primary comparison baseline for Classic Mimbres ceramics. The range of production quality within these assemblages is your scale. Do not use unprovenanced market examples as reference points for contextual interpretation.`;
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

interface ImageInput { data: string; label: string; }

interface ParsedImage {
  imageData: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  label: string;
}

function buildImageBlocks(parsed: ParsedImage[]) {
  return parsed.flatMap(img => [
    { type: 'text' as const, text: `[${img.label}]` },
    { type: 'image' as const, source: { type: 'base64' as const, media_type: img.mediaType, data: img.imageData } },
  ]);
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

  const { images, audience, fields = {} } = body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return new Response(JSON.stringify({ error: 'No images provided.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  let parsedImages: ParsedImage[];
  try {
    parsedImages = (images as ImageInput[]).map((img) => {
      const mediaType = img.data.split(';')[0].split(':')[1];
      if (!supportedTypes.includes(mediaType)) {
        throw new Error(`Unsupported image format: ${mediaType}. Please convert to JPEG or PNG and try again.`);
      }
      return {
        imageData: img.data.split(',')[1],
        mediaType: mediaType as ParsedImage['mediaType'],
        label: img.label || 'View',
      };
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const imageBlocks = buildImageBlocks(parsedImages);
  const imageCount = parsedImages.length;
  const viewLabels = parsedImages.map(img => img.label);
  const pass1Prompt = imageCount === 1 ? PASS1_PROMPT_SINGLE : PASS1_PROMPT_MULTI(imageCount);

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
              ...imageBlocks,
              { type: 'text', text: pass1Prompt },
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
          ARTIFACT_PROMPT(pass1Text, PRINCIPLE_NAMES, audience || '', viewLabels);

        const pass2Stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          system: 'You are a specialist in Southwest archaeology and anthropological artifact analysis, with deep knowledge of Mimbres ceramics and the Mogollon tradition. Apply the evaluative frameworks of J.J. Brody (formal and comparative iconographic analysis), Harry Shafer (production sequence and technological style), and Michelle Hegmon (ceramic variability as social information). Do not apply fine art criticism, aesthetic vocabulary, or art market language. Use field vocabulary precisely: provenience not provenance, chaîne opératoire, kill hole, slip, mineral vs. carbon paint, technological style. Be evidence-grounded and explicit about uncertainty — frame all interpretive claims as readings supported by specific observable evidence, not settled conclusions.',
          messages: [{
            role: 'user',
            content: [
              ...imageBlocks,
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
              ...imageBlocks,
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
