import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

export const prerender = false;

const PASS1_PROMPT = `Describe only what you can directly observe in this image. Cover: what's present and where, spatial relationships, how edges behave, how light and dark are distributed, color relationships, surface quality, what draws the eye and what doesn't, how near and far space is handled. Be specific and granular. Report in the order the eye encounters things. No interpretation. No art historical references. No quality judgments.`;

const PASS2_PROMPT = (pass1: string) => `You are analyzing a work of art across four independent registers. A formal observation pass has already been completed — use it as your evidence base, but look at the image directly too, especially for the material and cultural registers.

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

Run all four registers. Do not collapse them into each other. A finding in one register is not evidence in another.

REGISTER 1: PERCEPTUAL

What does the eye do with this work in the first seconds of looking — before interpretation, before meaning?

Analyze: where attention goes first and why. What holds the eye and what lets it go. How visual weight is distributed. Where contrast, edges, and spatial relationships create movement or stop it. What the work is asking a viewer to do visually — and whether those requests conflict.

Plain language. Name specific visual features.

NOISE — PERCEPTUAL:
What is interfering with a clean read in this register? Name the specific visual conflict. If nothing is interfering, say so.

---

REGISTER 2: MATERIAL AND FORMAL

What is this work physically made of, and how is the making visible?

Analyze: what medium, substrate, and process are present. Whether the surface is honest about how it was constructed. Whether the physical choices support or contradict what the work appears to be doing. What the material asks of the viewer up close versus at a distance.

NOISE — MATERIAL:
Where are the material or formal choices fighting the work's own logic?

---

REGISTER 3: CULTURAL

Where does this work sit in the larger field of what gets valued, desired, and validated — by institutions, markets, critics, communities?

Draw on the full breadth of art history and cultural knowledge. No framework limits.

Analyze: what cultural conversation this work is entering. What it signals about where it belongs — and whether those signals are legible to the audience it needs to reach. What institutions or communities would recognize it and why. Whether it's building on, departing from, or ignoring the cultural conditions around it.

Illegibility here is not automatically failure. It may be deliberate transgression. Name which and say why.

NOISE — CULTURAL:
What is preventing this work from being read clearly within the cultural field it's aimed at?

---

REGISTER 4: CONCEPTUAL

What argument or system of ideas is this work in dialogue with?

Draw on the full breadth of art theory, philosophy, and art history. No framework limits.

Analyze: what intellectual or artistic tradition this work is responding to. What position it appears to be taking — and whether the visual and material choices support that position. Where thinness in the perceptual register might be the conceptual point. What historical precedents matter for reading this accurately.

NOISE — CONCEPTUAL:
Where does the work undercut its own argument?

---

SYNTHESIS

Which register is this work most alive in? Where is the noise intentional — serving a purpose in another register — versus accidental across all four?

If an audience context was provided, address directly what's actionable for that person.

One closing sentence. Not a quality verdict. A direction.

---

Write directly. Specific. No hedging. Short sentences where a short sentence is enough.`;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const apiKey = locals.runtime?.env?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set.');

    const anthropic = new Anthropic({ apiKey });
    const body = await request.json();
    const { image, audience } = body;

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const imageData = image.split(',')[1];
    const mediaType = image.split(';')[0].split(':')[1] as
      'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    // PASS 1 — pure formal observation
    const pass1Msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: 'You are a visual observer. Report only what is directly present. No interpretation, no art history, no quality judgments.',
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
          { type: 'text', text: PASS1_PROMPT },
        ],
      }],
    });

    const pass1Text = pass1Msg.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n\n');

    // PASS 2 — four domain readings
    const audienceNote = audience
      ? `\n\nAUDIENCE CONTEXT: ${audience}\n`
      : '';

    const pass2Msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: 'You are a rigorous art analyst working across perceptual, material, cultural, and conceptual registers simultaneously.',
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
          { type: 'text', text: audienceNote + PASS2_PROMPT(pass1Text) },
        ],
      }],
    });

    const pass2Text = pass2Msg.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n\n');

    return new Response(
      JSON.stringify({ success: true, pass1: pass1Text, analysis: pass2Text }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Analysis failed', details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
