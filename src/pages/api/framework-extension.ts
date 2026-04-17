import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import principlesData from '../../data/hg-principles.json';

export const prerender = false;

const PASS1_PROMPT = `Analyze this image as a visual formalist. Describe only what you can directly observe: spatial relationships, edge behavior, value distribution, color temperature, figure-ground dynamics, surface quality, compositional forces, rhythm, weight, tension. Be specific and granular. Do not interpret meaning. Do not reference art historical context. Report what the eye encounters, in the order it encounters it.`;

const DRAFT_STRUCTURE = `{
  "name": "Short descriptive label for the mechanism",
  "subtitle": "One-sentence description",
  "tier": "",
  "claimType": "",
  "neuralFact": "The underlying perceptual or neural mechanism. Write 'needs research' if uncertain.",
  "studioTool": "What this mechanism gives an artist to work with.",
  "howToUse": "Practical guidance for applying this in the studio.",
  "combineWith": ["PrincipleName1", "PrincipleName2"]
}`;

function buildPass2Prompt(pass1Output: string): string {
  const principlesList = (principlesData as any).principles.map((p: any) =>
    `  { "id": ${p.id}, "name": "${p.name}", "subtitle": "${p.subtitle}", "tier": "${p.tier}" }`
  ).join(',\n');

  return `You have a set of formal observations about an image. You also have the Hidden Grammar framework: 54 perceptual principles organized around 11 Roots.

HIDDEN GRAMMAR PRINCIPLES:
[
${principlesList}
]

For each observation from the analysis below, attempt to match it to one or more existing principles. Then identify any observations that don't map cleanly to any existing principle. For each unmapped observation, generate a draft principle entry using exactly this JSON structure:

${DRAFT_STRUCTURE}

Populate these fields: name, subtitle, neuralFact, studioTool, howToUse, combineWith. Leave tier and claimType blank — do not guess. If you can't confidently write the neuralFact, write "needs research" in that field.

In addition to the mapped/unmapped results, also produce:

LEAD FINDING: One sentence identifying the single most formally distinctive observation from the unmapped candidates. If there are no unmapped candidates, pull the most significant mapped observation instead.

THREE LENS SUMMARIES — 3–4 sentences each, written in the specified voice:

Art Critic lens: frame toward what is formally distinctive, what mechanism is operating, what makes this work different from work that uses similar elements.

Finished Work lens: frame toward what the artist actually built, which two or three decisions are driving everything, what's resolved.

Work in Progress lens: frame toward what's unresolved, what formal problem needs a decision before the work moves forward.

FORMAL OBSERVATIONS:
${pass1Output}

Return ONLY a valid JSON object in exactly this shape — no preamble, no markdown fencing, no trailing text:
{
  "leadFinding": "...",
  "mapped": [
    { "observation": "...", "principleId": 1, "principleName": "..." }
  ],
  "unmapped": [
    {
      "observation": "...",
      "draft": ${DRAFT_STRUCTURE}
    }
  ],
  "summaries": {
    "critic": "...",
    "finished": "...",
    "wip": "..."
  }
}`;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const apiKey = locals.runtime?.env?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set.');

    const anthropic = new Anthropic({ apiKey });
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const imageData = image.split(',')[1];
    const mediaType = image.split(';')[0].split(':')[1] as
      'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    // ── PASS 1: Pure formalism — no framework framing ─────────────────────
    const pass1Msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: 'You are a visual formalist. Report only what is directly observable. No interpretation, no art historical context, no quality judgments.',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
            { type: 'text', text: PASS1_PROMPT },
          ],
        },
      ],
    });

    const pass1Text = pass1Msg.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n\n');

    // ── PASS 2: Principle mapping + lead finding + lens summaries ─────────
    const pass2Msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      system: 'You are a precise JSON-generating assistant. Return only valid JSON — no preamble, no markdown code fences, no trailing text.',
      messages: [
        { role: 'user', content: buildPass2Prompt(pass1Text) },
      ],
    });

    const pass2Raw = pass2Msg.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');

    let result: {
      leadFinding: string;
      mapped: any[];
      unmapped: any[];
      summaries: { critic: string; finished: string; wip: string };
    };

    try {
      const cleaned = pass2Raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/, '')
        .trim();
      result = JSON.parse(cleaned);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Pass 2 returned invalid JSON', raw: pass2Raw }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ensure tier/claimType are blank strings on all draft entries
    for (const item of result.unmapped || []) {
      if (item.draft) {
        item.draft.tier = '';
        item.draft.claimType = '';
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        pass1: pass1Text,
        leadFinding: result.leadFinding || '',
        mapped: result.mapped || [],
        unmapped: result.unmapped || [],
        summaries: result.summaries || { critic: '', finished: '', wip: '' },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Framework extension error:', error);
    return new Response(
      JSON.stringify({ error: 'Analysis failed', details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
