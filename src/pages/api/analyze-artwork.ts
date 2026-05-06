import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { marked } from 'marked';

// Parse IMAGE PROPERTIES and VIEWER EFFECTS sections from raw markdown output
async function parseSections(raw: string): Promise<{ imagePropertiesHTML: string; viewerEffectsHTML: string }> {
  const ipMatch = raw.match(/##\s*IMAGE PROPERTIES\s*([\s\S]*?)(?=##\s*VIEWER EFFECTS|$)/i);
  const veMatch = raw.match(/##\s*VIEWER EFFECTS\s*([\s\S]*)$/i);
  const ipRaw = ipMatch?.[1]?.trim() || '';
  const veRaw = veMatch?.[1]?.trim() || '';
  return {
    imagePropertiesHTML: ipRaw ? await marked(ipRaw, { async: true }) : '',
    viewerEffectsHTML: veRaw ? await marked(veRaw, { async: true }) : '',
  };
}

export const prerender = false;

import { basePrompt, interrogationBase } from '../../data/analysisModes.js';

import principlesData from '../../data/hg-principles.json';
import rootsData from '../../data/hg-roots.json';

// Helper: return an SSE streaming Response
function sseResponse(fn: (send: (obj: object) => void) => Promise<void>): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        await fn(send);
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
}

export const POST: APIRoute = async ({ request, locals }) => {
  const apiKey = locals.runtime?.env?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set. Locally: add it to .dev.vars. In production: add it as a Cloudflare Pages secret.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const {
    image,
    fields,
    promptText,
    interrogationMode,
    explorationMode,
    chatMode,
    lensMode,
    priorAnalysis,
    userQuestion,
    conversationHistory,
    model: requestedModel,
    poetryForm,
  } = body;

  const ALLOWED_MODELS = ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-opus-4-6'];
  const model = ALLOWED_MODELS.includes(requestedModel) ? requestedModel : 'claude-sonnet-4-6';

  // ── EXPLORATION MODE ─────────────────────────────────────────────────────
  if (explorationMode === true) {
    if (!priorAnalysis) {
      return new Response(
        JSON.stringify({ error: 'Exploration mode requires priorAnalysis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const explorationPrompt = `You are responding to a maker who has just received a Hidden Grammar analysis of their work in progress and wants to know where it could go from here.

Your task is to surface 2–3 distinct angles for experimentation — grounded entirely in the visual evidence already observed in the analysis above.

RULES:
- Each angle must be rooted in a specific observation from the prior analysis. Name it explicitly.
- Frame each angle as a possibility the current visual state makes available — not as a correction, fix, or improvement.
- Do not evaluate the current work. Do not use the words better, improve, fix, stronger, weaker, or successful.
- If you cannot identify 3 genuinely distinct angles from the evidence, give 2. Do not pad to reach 3.
- Each angle: 3–5 sentences. Name what's available, describe what it would require materially or visually, and name the perceptual mechanism it would activate.

VOICE: Direct and plain. No encouragement. No hedging. Write as if you are handing someone a set of keys and telling them what each one opens.

FORMAT: Number each angle (1, 2, 3). Plain prose per angle. No bullet sub-points. No section headers.`;

    return sseResponse(async (send) => {
      const stream = anthropic.messages.stream({
        model,
        max_tokens: 1200,
        system: explorationPrompt,
        messages: [{ role: 'user', content: `PRIOR ANALYSIS:\n${priorAnalysis}\n\n---\n\nWhat angles for experimentation does this work make available from here?` }],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          send({ type: 'delta', text: event.delta.text });
        }
      }

      const msg = await stream.finalMessage();
      const text = msg.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => ('text' in b ? b.text : ''))
        .join('\n\n');

      const html = await marked(text, { async: true });
      send({ type: 'complete', success: true, analysis: html });
    });
  }

  // ── INTERROGATION MODE ──────────────────────────────────────────────────
  if (interrogationMode === true) {
    if (!priorAnalysis || !userQuestion) {
      return new Response(
        JSON.stringify({ error: 'Interrogation requires priorAnalysis and userQuestion' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = String(interrogationBase);
    const userMessage = `PRIOR ANALYSIS:\n${priorAnalysis}\n\n---\n\nFOLLOW-UP QUESTION:\n${userQuestion}`;

    return sseResponse(async (send) => {
      const stream = anthropic.messages.stream({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          send({ type: 'delta', text: event.delta.text });
        }
      }

      const msg = await stream.finalMessage();
      const responseText = msg.content
        .filter(block => block.type === 'text')
        .map(block => ('text' in block ? block.text : ''))
        .join('\n\n');

      const responseHTML = await marked(responseText, { async: true });
      send({ type: 'complete', success: true, analysis: responseHTML, raw: responseText });
    });
  }

  // ── LENS MODE ───────────────────────────────────────────────────────────
  if (lensMode === true) {
    if (!image || !promptText || !priorAnalysis) {
      return new Response(
        JSON.stringify({ error: 'Lens mode requires image, promptText, and priorAnalysis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const lensSystemPrompt = `You are applying a specific analytical lens to a visual work. A full Hidden Grammar analysis has already been completed. Your task is to produce only the lens output — not a summary of the prior analysis, not a repetition of Image Properties or Viewer Effects.

Use the prior analysis as grounding context: reference specific observations where they are relevant to the lens, but do not reproduce them. Look directly at the image. The lens defines your output structure and scope entirely.

Write in plain prose. No evaluative language. No hedging. Stay inside the lens.`;

    const lensImageData = image.split(',')[1];
    const lensMediaType = image.split(';')[0].split(':')[1];

    return sseResponse(async (send) => {
      const stream = anthropic.messages.stream({
        model,
        max_tokens: 2500,
        system: lensSystemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: lensMediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                  data: lensImageData,
                },
              },
              {
                type: 'text',
                text: `PRIOR ANALYSIS:\n${priorAnalysis}\n\n---\n\n${promptText}`,
              },
            ],
          },
        ],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          send({ type: 'delta', text: event.delta.text });
        }
      }

      const msg = await stream.finalMessage();
      const lensText = msg.content
        .filter(block => block.type === 'text')
        .map(block => ('text' in block ? block.text : ''))
        .join('\n\n');

      const lensHTML = await marked(lensText, { async: true });
      send({ type: 'complete', success: true, analysis: lensHTML, raw: lensText });
    });
  }

  // ── POETRY MODE ───────────────────────────────────────────────────────────
  if (poetryForm) {
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Poetry mode requires an image' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const poetryPrompts: Record<string, string> = {
      slam: `You are reading a visual work as a slam poet.

Before writing, look carefully at what is unambiguously present — figures, objects, forms, colors, relationships. Do not infer human figures or recognizable objects unless they are clearly visible. Get what's actually there before you perform it.

Look at this image. Read it the way a body reads a room — what's charged, what's cold, where the tension pools, what it wants and won't say out loud.

Write one slam piece. Not a description. Not an analysis. A performance.

Rules:
- No hedging. No "perhaps," "might," "seems to," "one could argue."
- Address shifts freely — the work, the viewer, the maker, whoever the heat pulls you toward. Let it vary.
- Build. Accumulate. Land. The last line earns its weight.
- Concrete and visceral. Name what you actually see.
- Rhythm is structural. Lines break where breath breaks.
- Between 14 and 28 lines.
- No title. No section headers. No labels. Plain text only. No markdown.

Read what's actually in this image. Not what art is supposed to do. What this specific thing does.`,

      haiku: `You are reading a visual work as a haiku poet.

Before writing, look carefully at what is unambiguously present — figures, objects, forms, colors, relationships. Do not infer human figures or recognizable objects unless they are clearly visible. Get what's actually there before you cut it.

Look at this image. A haiku does not describe — it cuts. One observation. One shift. The space between them is the poem.

Write one haiku. Three lines. 5 syllables / 7 syllables / 5 syllables. Count every syllable. This is not approximate.

Rules:
- Root the first two lines in something specifically visible — a color, a texture, an edge, a spatial relationship.
- The third line turns. Not a conclusion. A shift in scale, time, or implication that opens rather than closes.
- No rhyme. No forced elevation. Plain words, exact weight.
- No title. No label. No syllable counts in parentheses. Plain text only. No markdown.

Three lines. Count them.`,

      sonnet: `You are reading a visual work as a sonnet poet.

Before writing, look carefully at what is unambiguously present — figures, objects, forms, colors, relationships. Do not infer human figures or recognizable objects unless they are clearly visible. Get what's actually there before you argue it.

Look at this image. A sonnet makes an argument. It develops a position across 14 lines and turns on itself. The volta is not a decoration — it is what the poem discovers.

Write one sonnet in the English (Shakespearean) form: three quatrains and a closing couplet. Rhyme scheme: ABAB CDCD EFEF GG.

Rules:
- The first quatrain establishes what the work presents: what is visible, what structural tension is in motion.
- The second quatrain develops a complication — something that resists or contradicts the first reading.
- The third quatrain deepens or reframes the complication, moving toward the turn.
- The couplet lands the discovery — not a summary, but what the poem could not see until it arrived.
- Approximate iambic pentameter. Let it breathe; do not force the meter at the expense of truth.
- Grounded in what is actually visible in this image. Not generic art language.
- No title. No labels. No markdown. Plain text only.

Fourteen lines. One argument. The volta earns its turn.`,
    };

    const systemPrompt = poetryPrompts[poetryForm];
    if (!systemPrompt) {
      return new Response(
        JSON.stringify({ error: `Unknown poetry form: ${poetryForm}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const poetryImageData = image.split(',')[1];
    const poetryMediaType = image.split(';')[0].split(':')[1];

    let poetryUserText = promptText || 'Read this work.';
    if (fields && typeof fields === 'object') {
      const parts = Object.entries(fields as Record<string, string>)
        .filter(([, v]) => v && String(v).trim())
        .map(([k, v]) => `${k}: ${v}`);
      if (parts.length > 0) poetryUserText = `${parts.join(' / ')}\n\n${poetryUserText}`;
    }

    return sseResponse(async (send) => {
      const stream = anthropic.messages.stream({
        model,
        max_tokens: poetryForm === 'haiku' ? 256 : 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: poetryMediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                  data: poetryImageData,
                },
              },
              { type: 'text', text: poetryUserText },
            ],
          },
        ],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          send({ type: 'delta', text: event.delta.text });
        }
      }

      const msg = await stream.finalMessage();
      const poetryText = msg.content
        .filter(block => block.type === 'text')
        .map(block => ('text' in block ? block.text : ''))
        .join('\n');

      send({ type: 'complete', success: true, poetryMode: true, raw: poetryText });
    });
  }

  // ── CHAT MODE ───────────────────────────────────────────────────────────
  if (chatMode === true) {
    if (!userQuestion) {
      return new Response(
        JSON.stringify({ error: 'Chat mode requires userQuestion' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const frameworkCtx = `\n## The 11 Roots\n${(rootsData as any).roots.map((r: any) => `**${r.name}** — ${r.subtitle}`).join('\n')}\n\n## The 54 Principles\n${(principlesData as any).principles.map((p: any) => `**${p.name}** — ${p.subtitle}`).join('\n')}`;

    const chatSystemPrompt = `You are a studio consultant using the Hidden Grammar framework — a neuroaesthetic system built on 11 Roots and 54 Principles grounded in visual perception research.\n\nYou are available before, during, and after any formal analysis. Your role here is exploratory and conversational:\n- Help the maker think through constraints, materials, intent, and stuck places\n- Answer questions about what the Hidden Grammar framework means and how to use it\n- Discuss visual problems in plain terms, grounded in perceptual mechanisms\n- When asked what a tool does or means, explain it clearly\n\nTONE: Direct and practical. No encouragement for its own sake. No quality judgments.\nLANGUAGE: Plain English. Define any framework terms the first time you use them.\n\nWhen a maker describes constraints (substrate, medium, dimensions, stage, intent), identify:\n- What those constraints make available (not just what they limit)\n- Which principles are accessible given those constraints\n- What changes if intent is held vs. modified vs. released\n- What the current material state suggests on its own terms\n\nNever tell a maker their work is good or bad. Describe mechanisms, not verdicts.\n${frameworkCtx}`;

    const history: Array<{ role: 'user' | 'assistant'; content: string }> = Array.isArray(conversationHistory)
      ? conversationHistory
      : [];

    let questionWithContext = userQuestion;
    if (fields && typeof fields === 'object' && Object.keys(fields).length > 0 && history.length === 0) {
      const labelMap: Record<string, string> = {
        dimensions: 'Dimensions', substrate: 'Substrate', medium: 'Medium',
        stage: 'Stage', intent: 'Intent', 'hard-constraints': 'Hard Constraints',
        'current-state': 'Current State',
      };
      const parts = Object.entries(fields)
        .filter(([, v]) => v && String(v).trim())
        .map(([k, v]) => `${labelMap[k] || k}: ${v}`);
      if (parts.length > 0) {
        questionWithContext = `WORK CONTEXT:\n${parts.join('\n')}\n\n${userQuestion}`;
      }
    }

    const chatMessages = [...history, { role: 'user' as const, content: questionWithContext }];

    return sseResponse(async (send) => {
      const stream = anthropic.messages.stream({
        model,
        max_tokens: 1024,
        system: chatSystemPrompt,
        messages: chatMessages,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          send({ type: 'delta', text: event.delta.text });
        }
      }

      const msg = await stream.finalMessage();
      const responseText = msg.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => ('text' in b ? b.text : ''))
        .join('\n\n');

      const responseHTML = await marked(responseText, { async: true });
      send({ type: 'complete', success: true, analysis: responseHTML, raw: responseText });
    });
  }

  // ── TEXT-ONLY PATH ──────────────────────────────────────────────────────
  if (!image && promptText) {
    const txtFwCtx = `\n## The 11 Roots\n${(rootsData as any).roots.map((r: any) => `**${r.name}** — ${r.subtitle}\nGoverns: ${r.governs}`).join('\n\n')}\n\n## The 54 Principles\n${(principlesData as any).principles.map((p: any) => `**${p.name}** — ${p.subtitle}`).join('\n')}\n\n---\n\n# UNIVERSAL OUTPUT CONSTRAINTS\n- NEVER use Hebrew consonant abbreviations — use English names only\n- NEVER reference principles by number — use descriptive names\n- Evidence-based reasoning: observations → mechanisms → effects → conclusions`;

    const txtSystemPrompt = String(basePrompt) + txtFwCtx;

    let txtFieldCtx = '';
    if (fields && typeof fields === 'object' && Object.keys(fields).length > 0) {
      const lm: Record<string, string> = {
        dimensions: 'Dimensions', substrate: 'Substrate', medium: 'Medium',
        stage: 'Stage', intent: 'Intent', 'hard-constraints': 'Hard Constraints',
        'current-state': 'Current State', notes: 'Notes',
      };
      const parts = Object.entries(fields)
        .filter(([, v]) => v && String(v).trim())
        .map(([k, v]) => `${lm[k] || k}: ${v}`);
      if (parts.length > 0) txtFieldCtx = `WORK CONTEXT:\n${parts.join('\n')}\n\n`;
    }

    return sseResponse(async (send) => {
      const stream = anthropic.messages.stream({
        model,
        max_tokens: 3000,
        system: txtSystemPrompt,
        messages: [{ role: 'user', content: txtFieldCtx + promptText }],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          send({ type: 'delta', text: event.delta.text });
        }
      }

      const msg = await stream.finalMessage();
      const txtText = msg.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => ('text' in b ? b.text : ''))
        .join('\n\n');

      const txtHTML = await marked(txtText, { async: true });
      send({ type: 'complete', success: true, analysis: txtHTML, raw: txtText });
    });
  }

  if (!image) {
    return new Response(
      JSON.stringify({ error: 'No image provided' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ── MAIN IMAGE ANALYSIS ─────────────────────────────────────────────────
  const imageData = image.split(',')[1];
  const mediaType = image.split(';')[0].split(':')[1];

  const frameworkContext = `
# HIDDEN GRAMMAR FRAMEWORK REFERENCE

## The 11 Roots
${rootsData.roots.map(root => `**${root.name}** — ${root.subtitle}\nGoverns: ${root.governs}`).join('\n\n')}

## The 54 Principles
${principlesData.principles.map(p => `**${p.name}** — ${p.subtitle}`).join('\n')}

---

# UNIVERSAL OUTPUT CONSTRAINTS

- NEVER use Hebrew consonant abbreviations in output — use English names only
- NEVER reference principles by number — use descriptive names
- Evidence-based reasoning: observations → mechanisms → effects → conclusions
- Claims are testable hypotheses tied to visible evidence, not verdicts
`;

  const systemPrompt = String(basePrompt) + frameworkContext;

  let fieldContext = '';
  if (fields && typeof fields === 'object' && Object.keys(fields).length > 0) {
    const labelMap: Record<string, string> = {
      artist: 'Artist',
      title: 'Title',
      period: 'Period / Year',
      medium: 'Medium',
      dimensions: 'Dimensions',
      context: 'Collection / Exhibition Context',
      notes: 'Notes',
      brand: 'Brand',
      'product-category': 'Product Category',
      demographic: 'Target Demographic',
      'shelf-context': 'Shelf / Retail Context',
      'competitive-set': 'Competitive Set',
      publisher: 'Publisher',
      era: 'Era / Year',
      genre: 'Genre',
      'art-style': 'Art Style',
      format: 'Format',
      'client-industry': 'Client / Industry',
      'intended-use': 'Intended Use',
      audience: 'Audience',
      reproduction: 'Reproduction Context',
      year: 'Year',
    };

    const parts = Object.entries(fields)
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${labelMap[k] || k}: ${v}`);

    if (parts.length > 0) {
      fieldContext = `ARTWORK CONTEXT:\n${parts.join(' / ')}\n\n`;
    }
  }

  const userMessageText = fieldContext + (promptText || 'Conduct a Hidden Grammar analysis of this artwork.');

  return sseResponse(async (send) => {
    const stream = anthropic.messages.stream({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageData,
              },
            },
            {
              type: 'text',
              text: userMessageText,
            },
          ],
        },
      ],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        send({ type: 'delta', text: event.delta.text });
      }
    }

    const msg = await stream.finalMessage();
    const analysisText = msg.content
      .filter(block => block.type === 'text')
      .map(block => ('text' in block ? block.text : ''))
      .join('\n\n');

    const analysisHTML = await marked(analysisText, { async: true });
    const { imagePropertiesHTML, viewerEffectsHTML } = await parseSections(analysisText);

    send({
      type: 'complete',
      success: true,
      analysis: analysisHTML,
      raw: analysisText,
      imageProperties: imagePropertiesHTML,
      viewerEffects: viewerEffectsHTML,
    });
  });
};
