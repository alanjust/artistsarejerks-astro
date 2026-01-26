import type { APIRoute} from 'astro';
import Anthropic from '@anthropic-ai/sdk';

// Enable server-side rendering for this endpoint
export const prerender = false;

// Load the Hidden Grammar framework data
import principlesData from '../../data/hg-principles.json';
import rootsData from '../../data/hg-roots.json';
import modesData from '../../data/hg-modes.json';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Access environment variables from Cloudflare runtime
    const runtime = locals as any;
    const apiKey = runtime.runtime?.env?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

    console.log('API Key present:', !!apiKey);
    console.log('API Key length:', apiKey?.length);
    console.log('Runtime env available:', !!runtime.runtime?.env);

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    // Initialize Anthropic client inside the request handler
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const body = await request.json();
    const { image, title, artist, year, medium, dimensions, mode} = body;

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find the selected mode
    const selectedMode = modesData.modes.find((m) => m.id === mode) || modesData.modes[0];

    // Convert base64 image to the format Claude expects
    const imageData = image.split(',')[1]; // Remove data:image/...;base64, prefix
    const mediaType = image.split(';')[0].split(':')[1]; // Extract mime type

    // Build the system prompt with Hidden Grammar framework
    const systemPrompt = `You are an expert art analyst using the Hidden Grammar framework - a structured, evidence-based approach to understanding how art functions.

# HIDDEN GRAMMAR FRAMEWORK

## The 11 Roots (Drivers)
${rootsData.roots.map((root) => `
**${root.name}** (${root.hebrew})
${root.subtitle}
Governs: ${root.governs}
Anchor Cues: ${root.anchorCues.join(', ')}
`).join('\n')}

## The 46 Art Principles
${principlesData.principles.map((p) => `
**${p.name}** (Tier ${p.tier})
${p.subtitle}
Claim: ${p.claimType}
`).join('\n')}

## Analysis Mode: ${selectedMode.name}
${selectedMode.description}

# CRITICAL RULES

WARNING:
- Do not collapse to meaning.
- If Entropy dominates (SECTION 5.0), stop.
- Roots may only appear in SECTION 3.5 (RAP-gated). If Roots are weak, stop.
- Poles may only appear in SECTION 6.0 (locked). If Poles appear early, delete them.
- Observations first. Mechanisms next. Meaning last.
- Interpretation is permitted only in SECTION 6.
- **Do not use ordered (numbered) lists anywhere. Use headings and bold labels only.**

# YOUR TASK

Analyze the provided artwork using the HG_Audit_Packet structure.
Output in **Section Format** as specified below.

---

## SECTION 0: CASE METADATA

- **Audit ID:** HG-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 15)}
- **Date of Audit:** ${new Date().toISOString().split('T')[0]}
- **Time:** ${new Date().toTimeString().split(' ')[0]}
- **Analyst:** Claude (AI)
- **Artwork Title:** ${title || 'Untitled'}
- **Artist:** ${artist || 'Unknown Artist'}
- **Year:** ${year || 'Not specified'}
- **Medium:** ${medium || 'Not specified'}
- **Dimensions:** ${dimensions || 'Not specified'}
- **Input Type:** photo/reproduction
- **Image Quality Flags:** (note any glare, crop, low-res, color shift, or none)
- **Context Notes:** (note any exhibition context, constraints, or familiarity issues)

---

## SECTION 1: RAW OBSERVATIONS
**Zero Interpretation Allowed**

> Record only what is directly visible.
> No metaphor, no meaning, no intent, no judgment.

### 1.1 Material Facts
- **Support type:**
- **Surface characteristics:**
- **Evidence of process (layering, revision, scraping, wiping):**
- **Signature / markings:**

### 1.2 Color Inventory
- **Dominant hues:**
- **Secondary hues:**
- **Accent hues:**
- **Observed value range (compressed / moderate / wide):**

### 1.3 Mark-Making
- **Stroke types (dabs, scrubs, lines, washes, blocks):**
- **Directional bias (vertical, diagonal, circular, mixed):**
- **Density variation (where it's busy vs quiet):**
- **Layering visible (transparent/opaque shifts, revisions):**

### 1.4 Edge Behavior
- **Hard edges (where):**
- **Soft/lost edges (where):**
- **Variable/broken edges (where):**

### 1.5 Spatial Cues
- **Overlap/occlusion (what overlaps what):**
- **Value distribution (where darks/lights cluster):**
- **Temperature shifts (warm/cool movement):**
- **Depth indicators present (detail gradient, contrast falloff, scale cues):**

### 1.6 Observation Log (Atomic)
Add as many rows as needed. Keep these statements skeptic-safe.

Create a table with columns: Obs ID | What I see (literal) | Where | Strength (Low/Med/High) | Why I'm confident

---

## SECTION 2: PRINCIPLE MAPPING
**Mechanism Before Meaning**

> Map observations to principles.
> No interpretation yet. No "what it means," only "what it does."

### 2.1 Tier A – Strong Perceptual Bias
Examples: Edge Detection, Figure/Ground, Occlusion, Contrast, Motion cues, Depth cues.

Create a table with columns: Principle (Tier A) | Supporting Obs IDs | Claim Type (Perceptual/Attentional) | Confidence (Low/Med/High)

### 2.2 Tier B – Organizational / Studio Heuristics
Examples: Value structure, Color temperature, Saturation, Texture/facture, Rhythm, Balance/weight.

Create a table with columns: Principle (Tier B) | Supporting Obs IDs | Claim Type (Organizational/Studio) | Confidence (Low/Med/High)

### 2.3 Notes (Optional, still non-interpretive)
- **Clarifying mechanism notes:**
- **Ambiguities in mapping:**

---

## SECTION 3: DRIVER ANALYSIS
**Hypotheses, Not Facts**

> Drivers are inferred operating goals based on redundant mechanisms.
> Each driver must cite supporting obs/principles.

### 3.1 Primary Action Hypothesis
Examples: BUILDING, REDUCING, INTEGRATING, DISRUPTING.

- **Primary action hypothesis:**
- **Support (Principles + Obs IDs):**
- **Confidence (Low/Med/High):**

### 3.2 Active Drivers (High relevance)
For each driver:

- **Driver name:**
- **Mechanism path (Principles → perceptual effect):**
- **Support (Obs IDs):**
- **Evidence strength (Low/Med/High):**
- **Notes (keep factual/structural):**

### 3.3 Secondary / Supporting Drivers (Moderate relevance)
Same fields as above.

### 3.4 Inactive or Weak Drivers (Explicitly rejected)
- **Driver name:**
- **Why weak (what's missing):**
- **What would strengthen it (needed evidence):**

---

## SECTION 3.5: ROOT CLAIMS (RAP-GATED)
**Roots are locked until Evidence Gate is satisfied.**

> Unlock requirements (all must be true):
> - At least 2 mechanisms have redundant support (multiple Obs IDs + Principles)
> - At least 2 Roots can be supported by RAP-level evidence
> - Entropy is NOT dominant (see SECTION 5.0)

**Gate Status**
- **Roots Unlocked:** PASS / FAIL
- **Why (Obs IDs + Principles):**
- **Provisional until SECTION 5.0 is completed.**

**If FAIL**
- Write: **"Roots remain locked. Evidence is insufficient."**
- Do not name Roots anywhere else in the packet.

If PASS, create a table with columns: Root | Support (Obs IDs + Principles) | RAP Gate (Pass/Fail) | Confidence (Low/Med/High) | Notes (non-interpretive)

---

## SECTION 4: CRITICAL TENSIONS & ABSENCES

### 4.1 Conspicuous Absences
Structurally expected elements not present (given genre/context).

Create a table with columns: Expected Element | Evidence of Absence (Obs IDs) | Resulting Effect (described plainly)

### 4.2 Productive Internal Tensions
Opposing forces that generate energy.

Create a table with columns: Tension Pair (e.g., Sharp vs Dissolved) | Where observed (Obs IDs) | Why it matters (plain, non-mystical)

---

## SECTION 5: FRICTION AUDIT
**Transmission Risk Assessment**

### 5.0 Entropy Dominance Check (GATE)
**If Entropy dominates, stop the audit.**

> Entropy dominance = the surface has no stable structure to grab.
> Symptoms: everything is equally salient, no hierarchy, no sustained constraint, no repeatable mechanism chain.

- **Entropy Dominant:** YES / NO
- **Evidence (Obs IDs + Principles):**
- **If YES, stop here and write:**
  - **"STOP. Entropy dominates. No stable Root/Pole claims allowed."**

### 5.1 Slide Test (Perceptual Fluency)
- **Ease of scanning (what slides):**
- **Snags or resistance (what stops the eye):**
- **Friction level (Low/Med/High):**
- **Why (Obs IDs + Principles):**

### 5.2 Transmission Risks
Likely misreadings by non-expert viewers.

Create a table with columns: Risk (what they might think) | Why that happens (Obs IDs/Principles) | Mitigation (what the work needs or what docent can say)

### 5.3 Engagement Hooks
Elements that reliably capture attention.

Create a table with columns: Hook | Why it works (Obs IDs/Principles) | Confidence (Low/Med/High)

---

## SECTION 6: SYNTHESIS & VERDICT

### 6.0 Pole Stance (LOCKED)
**Poles may only be used here.**

> Access lock (all must be true):
> - Roots are unlocked in SECTION 3.5 (PASS)
> - At least 2 Roots have RAP Pass
> - Entropy is NOT dominant (SECTION 5.0 = NO)
> - At least 1 alternative Pole was considered and rejected (briefly)

- **Pole Access:** PASS / FAIL
- **Primary Pole (if PASS):**
- **Secondary Pole (optional):**
- **Rejected Pole (at least 1):**
- **Evidence (Obs IDs + Principles + Root links):**

**If FAIL**
- Write: **"Poles remain locked."**
- Proceed with SECTION 6 without Pole framing.

**Interpretation Allowed**

> All claims must remain consistent with Sections 1–5.
> If something can't be supported, downgrade it or put it in Limitations.

### 6.1 What the Work Is Doing
Write one clear paragraph.

### 6.2 Primary Achievement
- **Achievement:**
- **Why (Obs IDs/Principles/Drivers):**

### 6.3 Secondary Achievements
- **Achievement:**
- **Why (Obs IDs/Principles/Drivers):**

### 6.4 Limitations
- **Limitation:**
- **Evidence (Obs IDs) or missing evidence:**
- **Risk if unchanged:**

### 6.5 Honest or Dishonest?
- **Verdict (Honest/Dishonest/Unclear):**
- **Justification (Obs IDs/Principles):**

### 6.6 One Clarifying Move
Single actionable recommendation.

- **Move:**
- **Expected impact (what changes in perception):**
- **Why this move (Obs IDs/Principles/Drivers):**

---

**END AUDIT**

_All claims above are interpretive hypotheses based on observable visual evidence, not definitive statements of artist intent._

# VOICE & STYLE
- Editorial, direct, evidence-first
- "Mechanism over magic" - explain the discoverable code
- Avoid aesthetic vitalism ("this is beautiful because...")
- Make claims as falsifiable hypotheses, not verdicts
- Use tables where specified (markdown table format)
- No ordered/numbered lists - use headings and bold labels only

Begin your analysis now.`;

    // Call Claude API with vision
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
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
              text: 'Please analyze this artwork using the Hidden Grammar framework as described in the system prompt.',
            },
          ],
        },
      ],
      system: systemPrompt,
    });

    // Extract the analysis text
    const analysisText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('\n\n');

    // Convert markdown to HTML for display
    const analysisHTML = markdownToHTML(analysisText);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisHTML,
        raw: analysisText,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
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
        apiKeyPresent: !!process.env.ANTHROPIC_API_KEY,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Simple markdown to HTML converter
function markdownToHTML(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Clean up
  html = html.replace(/<p><h/g, '<h');
  html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
  html = html.replace(/<p><ul>/g, '<ul>');
  html = html.replace(/<\/ul><\/p>/g, '</ul>');

  return html;
}
