import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { marked } from 'marked';

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
      priorAnalysis,
      userQuestion,
    } = body;

    // ── INTERROGATION MODE ──────────────────────────────────────────────────
    if (interrogationMode === true) {
      if (!priorAnalysis || !userQuestion) {
        return new Response(
          JSON.stringify({ error: 'Interrogation requires priorAnalysis and userQuestion' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // System: interrogationBase (non-negotiable)
      // User: full prior analysis + follow-up question
      const systemPrompt = String(interrogationBase);

      const userMessage = `PRIOR ANALYSIS:\n${priorAnalysis}\n\n---\n\nFOLLOW-UP QUESTION:\n${userQuestion}`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
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

    // ── INITIAL ANALYSIS MODE ───────────────────────────────────────────────
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
      model: 'claude-sonnet-4-20250514',
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

    return new Response(
      JSON.stringify({ success: true, analysis: analysisHTML, raw: analysisText }),
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
