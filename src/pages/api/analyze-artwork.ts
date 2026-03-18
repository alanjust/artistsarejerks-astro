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

// Enable server-side rendering for this endpoint
export const prerender = false;

// Non-negotiable base prompts from analysisModes.js (server-side only — cannot be overridden by frontend)
import { basePrompt, interrogationBase } from '../../data/analysisModes.js';

// Hidden Grammar framework reference data (injected into system prompt for all analyses)
import principlesData from '../../data/hg-principles.json';
import rootsData from '../../data/hg-roots.json';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Access environment variables — Cloudflare runtime (.dev.vars locally, secrets in production)
    // Falls back to process.env for Astro dev server (npm run dev)
    const apiKey = locals.runtime?.env?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY is not set. Locally: add it to .dev.vars. In production: add it as a Cloudflare Pages secret.'
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const body = await request.json();
    const {
      image,
      fields,
      promptText,
      interrogationMode,
      explorationMode,
      chatMode,
      priorAnalysis,
      userQuestion,
      conversationHistory,
    } = body;

    // ── EXPLORATION MODE ─────────────────────────────────────────────────────
    // Post-analysis: surfaces 2–3 experimental angles grounded in prior analysis.
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

      const explorationMsg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: explorationPrompt,
        messages: [{ role: 'user', content: `PRIOR ANALYSIS:\n${priorAnalysis}\n\n---\n\nWhat angles for experimentation does this work make available from here?` }],
      });

      const explorationText = explorationMsg.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => ('text' in b ? b.text : ''))
        .join('\n\n');

      const explorationHTML = await marked(explorationText, { async: true });

      return new Response(
        JSON.stringify({ success: true, analysis: explorationHTML }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── INTERROGATION MODE ──────────────────────────────────────────────────
    // Post-analysis: anchored to a prior analysis output
    if (interrogationMode === true) {
      if (!priorAnalysis || !userQuestion) {
        return new Response(
          JSON.stringify({ error: 'Interrogation requires priorAnalysis and userQuestion' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const systemPrompt = String(interrogationBase);
      const userMessage = `PRIOR ANALYSIS:\n${priorAnalysis}\n\n---\n\nFOLLOW-UP QUESTION:\n${userQuestion}`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      const responseText = message.content
        .filter(block => block.type === 'text')
        .map(block => ('text' in block ? block.text : ''))
        .join('\n\n');

      const responseHTML = await marked(responseText, { async: true });

      return new Response(
        JSON.stringify({ success: true, analysis: responseHTML, raw: responseText }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── CHAT MODE ───────────────────────────────────────────────────────────
    // Pre-analysis or exploratory: no image required.
    // Free-form studio consultation using Hidden Grammar as context.
    // Supports multi-turn conversation history.
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

      const chatMsg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: chatSystemPrompt,
        messages: chatMessages,
      });

      const responseText = chatMsg.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => ('text' in b ? b.text : ''))
        .join('\n\n');

      const responseHTML = await marked(responseText, { async: true });

      return new Response(
        JSON.stringify({ success: true, analysis: responseHTML, raw: responseText }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── INITIAL ANALYSIS MODE ───────────────────────────────────────────────
    // Text-only path: when a C&O or similar mode runs without an image
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

      const txtMsg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: txtSystemPrompt,
        messages: [{ role: 'user', content: txtFieldCtx + promptText }],
      });

      const txtText = txtMsg.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => ('text' in b ? b.text : ''))
        .join('\n\n');

      const txtHTML = await marked(txtText, { async: true });

      return new Response(
        JSON.stringify({ success: true, analysis: txtHTML, raw: txtText }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract base64 image data
    const imageData = image.split(',')[1];
    const mediaType = image.split(';')[0].split(':')[1];

    // ── Build system prompt ─────────────────────────────────────────────────
    // basePrompt from analysisModes.js is prepended first — cannot be overridden.
    // Framework reference data follows.
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

    // ── Build user message ──────────────────────────────────────────────────
    // Field context as labeled plain text (per spec: "Artist: Van Gogh / Title: Starry Night")
    let fieldContext = '';
    if (fields && typeof fields === 'object' && Object.keys(fields).length > 0) {
      const labelMap: Record<string, string> = {
        // Fine Art
        artist: 'Artist',
        title: 'Title',
        period: 'Period / Year',
        medium: 'Medium',
        dimensions: 'Dimensions',
        context: 'Collection / Exhibition Context',
        notes: 'Notes',
        // CPG
        brand: 'Brand',
        'product-category': 'Product Category',
        demographic: 'Target Demographic',
        'shelf-context': 'Shelf / Retail Context',
        'competitive-set': 'Competitive Set',
        // Comic
        publisher: 'Publisher',
        era: 'Era / Year',
        genre: 'Genre',
        'art-style': 'Art Style',
        format: 'Format',
        // Illustration
        'client-industry': 'Client / Industry',
        'intended-use': 'Intended Use',
        audience: 'Audience',
        reproduction: 'Reproduction Context',
        // Fallback generics
        year: 'Year',
      };

      const parts = Object.entries(fields)
        .filter(([, v]) => v && String(v).trim())
        .map(([k, v]) => `${labelMap[k] || k}: ${v}`);

      if (parts.length > 0) {
        fieldContext = `ARTWORK CONTEXT:\n${parts.join(' / ')}\n\n`;
      }
    }

    // promptText comes from the frontend (mode-specific prompt from analysisModes.js)
    // basePrompt is already in the system prompt — cannot be overridden
    const userMessageText = fieldContext + (promptText || 'Conduct a Hidden Grammar analysis of this artwork.');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
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

    const analysisText = message.content
      .filter(block => block.type === 'text')
      .map(block => ('text' in block ? block.text : ''))
      .join('\n\n');

    const analysisHTML = await marked(analysisText, { async: true });
    const { imagePropertiesHTML, viewerEffectsHTML } = await parseSections(analysisText);

    return new Response(
      JSON.stringify({ success: true, analysis: analysisHTML, raw: analysisText, imageProperties: imagePropertiesHTML, viewerEffects: viewerEffectsHTML }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    return new Response(
      JSON.stringify({
        error: 'Failed to analyze artwork',
        details: errorMessage,
        stack: errorStack,
        apiKeyPresent: !!(process.env.ANTHROPIC_API_KEY),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
