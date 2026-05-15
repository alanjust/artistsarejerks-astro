import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import principlesData from '../../data/hg-principles.json';

export const prerender = false;

const PRINCIPLE_NAMES: string[] = (principlesData.principles as any[])
  .map((p: any) => p.name as string)
  .sort((a, b) => b.length - a.length);

const PASS1_PROMPT = `Describe only what you can directly observe in this image. Cover: what's present and where, spatial relationships, how edges behave, how light and dark are distributed, color relationships, surface quality, what draws the eye and what doesn't, how near and far space is handled. Be specific and granular. Report in the order the eye encounters things. No interpretation. No art historical references. No quality judgments.`;

const PASS2_PROMPT = (pass1: string, principleNames: string[]) => `You are analyzing a work of art across four independent domains. A formal observation pass has already been completed — use it as your evidence base, but look at the image directly too, especially for the material and cultural domains.

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

FRAMEWORK TERMINOLOGY: When your analysis references a perceptual or compositional mechanism that corresponds to one of the following named Principles, use the exact name as written. Use these names naturally in prose — don't force them, but don't paraphrase them either:

${principleNames.join(', ')}

---

CLAIMS AND CERTAINTY:
The perceptual and material domains are grounded in what is directly visible. State observations in those domains plainly.

The cultural and conceptual domains draw on knowledge beyond the image — cultural history, institutional context, conceptual lineage. In these domains, frame claims as possible readings, not settled conclusions. "One reading of where this work sits institutionally is X" is allowed. "This work is canonized as X" is not. The test: if the claim requires knowledge of how critics, institutions, or markets have actually received this specific work — frame it as a possible position.

In all four domains: state intent and agency as readings, not facts. "This reads as deliberate" is allowed. "This was deliberate" is not.

---

PROCESS ORDER vs. OUTPUT ORDER:
Complete your full analysis of all four domains before writing any output. Then present results in this order:
1. OVERVIEW — write this first
2. PERCEPTUAL
3. MATERIAL AND FORMAL
4. CULTURAL
5. CONCEPTUAL
6. NOISE — CONSOLIDATED — write this last

Run all four domains. Do not collapse them into each other. A finding in one domain is not evidence in another.

OUTPUT FORMAT FOR EACH DOMAIN:
Write full detailed prose only. No bullet summaries. No inline noise sub-sections — all noise findings go to the NOISE — CONSOLIDATED section at the end.

---

OVERVIEW

Report what happens between the four domains. Not a verdict on the work — a map of how the domains behave in relation to each other.

Where do the perceptual, material, cultural, and conceptual findings pull in the same direction? Where do they conflict? Name the specific tensions. If the attentional logic and the conceptual argument are working against each other, say so. If the material handling stabilizes or destabilizes what the eye is doing, say that. Don't resolve contradictions the work hasn't resolved.

Write in short declarative sentences. No hedging, but no omniscient authority either. State what the domain work shows — not what the critic concludes.

One closing sentence. Name the most significant unresolved tension. Not a quality verdict. Not a direction for the artist. The live question the work is sitting inside.

---

PERCEPTUAL

What does the eye do with this work in the first seconds of looking — before interpretation, before meaning?

Analyze: where attention goes first and why. What holds the eye and what lets it go. How visual weight is distributed. Where contrast, edges, and spatial relationships create movement or stop it. What the work is asking a viewer to do visually — and whether those requests conflict.

Plain language. Name specific visual features. Say what the eye does, not what vision theoretically entails.

---

MATERIAL AND FORMAL

What is this work physically made of, and how is the making visible?

Analyze: what medium, substrate, and process are present. Whether the surface is honest about how it was constructed. Whether the physical choices support or contradict what the work appears to be doing. What the material asks of the viewer up close versus at a distance.

Say what the hand did. Not what materiality implies.

---

CULTURAL

Where does this work sit in the larger field of what gets valued, desired, and validated — by institutions, markets, critics, communities?

Draw on the full breadth of art history and cultural knowledge. No framework limits.

Analyze: what cultural conversation this work is entering. What it signals about where it belongs — and whether those signals are legible to the audience it needs to reach. What institutions or communities would recognize it and why. Whether it's building on, departing from, or ignoring the cultural conditions around it.

Illegibility here is not automatically failure. It may be deliberate transgression. Name which and say why.

Say where the work lands in the room, not how positioning functions theoretically.

---

CONCEPTUAL

What argument or system of ideas is this work in dialogue with?

Draw on the full breadth of art theory, philosophy, and art history. No framework limits.

Analyze: what intellectual or artistic tradition this work is responding to. What position it appears to be taking — and whether the visual and material choices support that position. Where perceptual thinness might be the conceptual point. What historical precedents matter for reading this accurately.

Say what argument the work is making. Not what it instantiates or problematizes.

---

NOISE — CONSOLIDATED

Four named sub-sections. Each names the specific conflict or interference. If nothing is interfering in a domain, say so in one sentence.

PERCEPTUAL: What is interfering with a clean read? Name the specific visual conflict.

MATERIAL: Where are the material or formal choices fighting the work's own logic?

CULTURAL: What is preventing this work from being read clearly within the cultural field it's aimed at?

CONCEPTUAL: Where does the work undercut its own argument?

End with one sentence: which of these noise findings are intentional — serving a purpose in another domain — versus accidental across all four.

---

Write directly. Specific. In the perceptual and material sections, state what you observe — no hedging needed. In the cultural and conceptual sections, claim what a reading of the image can support; frame interpretations as positions, not verdicts. Short sentences where a short sentence is enough.`;

const DOCENT_PROMPT = (pass1: string, principleNames: string[]) => `You are preparing a docent guide for museum visitors. Your job is to give the docent three things: a surprise, a story, and an argument to start. Not a survey of the work — an experience of it. Write for a docent who wants to hold a room, not brief it.

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

CLAIMS AND CERTAINTY:
State intent and agency as readings, not facts. "This reads as deliberate" is allowed. "This was deliberate" is not.

For cultural and historical claims: include documented reception history, exhibition controversy, or critical scandal when you have specific confident knowledge of it — these are the most useful details a docent has. When you don't have confident specific knowledge, describe the cultural conversation generally. Do not invent specific incidents, dates, quotes, or venues. If a historical claim is plausible but not certain, flag it with "(verify before using)" immediately after the claim.

---

FRAMEWORK TERMINOLOGY: Use the following named Principles to inform your analysis, but translate into plain language in the guide — visitors don't need the names:
${principleNames.join(', ')}

---

OUTPUT FORMAT — THREE BEATS. Total: 400–500 words. Present tense. Short sentences. Write as prose a docent can speak from — each beat a natural pause in a conversation. No academic citations or theory labels.

Use these three headers exactly:

## THE HOOK
## THE STORY
## THE LIVE QUESTION

---

## THE HOOK

One thing about this work that a visitor wouldn't notice on their own — but once pointed out, can't be unseen. Perceptual and specific. An aha, not a summary.

Open with a direct question the docent can put to the group before saying anything else. Then name what's actually happening and why it's surprising. 3–4 sentences.

---

## THE STORY

The cultural life of this work: who made it, what moment it arrived in, who it was talking to, what argument it was making or entering. Narrative, not institutional positioning. No register names, no theory labels.

If there are documented anecdotes — a rejection, a critical controversy, a specific exhibition scandal — include them. Visitors remember these. Flag anything uncertain with "(verify before using)."

Close with one sentence on where the work sits now — how the conversation around it has or hasn't settled. 4–6 sentences total.

---

## THE LIVE QUESTION

The tension the work hasn't resolved — something visitors tend to land on differently. Frame it as something the docent can put to the group directly. "Some people read this as X. Some read it as Y. What do you see?"

2–3 sentences. Leave it open. No verdict.`;

const CRITIC_PROMPT = (pass1: string, principleNames: string[]) => `You are writing a short piece of art criticism for an intelligent general reader who has not seen this work. Not a survey. Not a report. A case.

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

FRAMEWORK TERMINOLOGY: Use the following named Principles to inform your thinking, but translate into plain language — readers don't need the names:
${principleNames.join(', ')}

---

CLAIMS AND CERTAINTY:
What is directly visible — what the eye does, how the work is made, how the surface behaves — state plainly.
Cultural position, historical significance, conceptual argument — frame as positions, not verdicts. You can be assertive. But claims about how critics, institutions, or markets have actually received this specific work require the same epistemic frame: "one reading" not "this is."
State intent as a reading: "this reads as deliberate" not "this was deliberate."

---

Write 350–450 words of continuous prose. No headers. No sections. No framework labels.

Open with the thing that arrests you — what stops you in front of this work before you've named what it is. Not a description. Not a summary. The thing.

Make the case. What is this work doing? Why does it matter — or where does it fall short? Move through specific observations. Don't summarize — accumulate.

Situate it. Where does this work land in the larger conversation? What is it answering, ignoring, or departing from?

Name one honest tension or limitation. Not a verdict. A live question the work leaves open.

Close with a position. One or two sentences. Something you'd put your name on.

Write in short declarative sentences. Active present tense. No passive constructions, no institutional hedging, no academic abstractions. If it sounds like a wall label or a conference paper, rewrite it. If it sounds like someone who has stood in front of a lot of work and has something to say about this one specifically, it's right.`;

const TOUR_PROMPT = (pass1: string, principleNames: string[]) => `You are preparing a complete tour stop guide for a museum docent leading a group. Your output has two parts: entry prompts that open the stop with directed looking, followed by a tour narrative the docent speaks from after the group has looked.

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

CLAIMS AND CERTAINTY:
State intent and agency as readings, not facts. "This reads as deliberate" is allowed. "This was deliberate" is not.

For cultural and historical claims: include documented reception history, exhibition controversy, or critical scandal when you have specific confident knowledge of it — these are the most useful details a docent has. When you don't have confident specific knowledge, describe the cultural conversation generally. Do not invent specific incidents, dates, quotes, or venues. If a historical claim is plausible but not certain, flag it with "(verify before using)" immediately after the claim.

---

FRAMEWORK TERMINOLOGY: Use the following named Principles to inform your analysis, but translate into plain language — visitors don't need the names:
${principleNames.join(', ')}

---

OUTPUT FORMAT — TWO PARTS. Present tense. Short sentences. Write as prose a docent can speak from. No academic citations or theory labels.

Use these four headers exactly:

## LOOKING PROMPTS
## THE HOOK
## THE STORY
## THE LIVE QUESTION

---

## LOOKING PROMPTS

2–3 questions the docent reads to the group before saying anything about the work. Each question must be locatable — the group should be able to point to exactly where in the painting they're being sent. Ask only for sensory or formal observations: color, texture, edges, how the eye moves, what changes, what feels different. No interpretation. No art historical framing. No mention of artist, title, meaning, or intent.

Phrasing is an invitation, not a test. A visitor with no art training should be able to answer every prompt. Write each prompt as a sentence the docent can read aloud directly to the group.

Close with a single line labeled exactly "Start here:" — name the one formal relationship or element that, once noticed, changes how a viewer reads everything else in the work. Phrase it as a looking instruction, not a conclusion.

---

## THE HOOK

One thing about this work a visitor wouldn't notice on their own — but once pointed out, can't be unseen. Perceptual and specific. An aha, not a summary.

Open with a direct question the docent can put to the group. Then name what's actually happening and why it's surprising. 3–4 sentences.

---

## THE STORY

The cultural life of this work: who made it, what moment it arrived in, who it was talking to, what argument it was making or entering. Narrative, not institutional positioning. No framework labels.

If there are documented anecdotes — a rejection, a critical controversy, a specific exhibition scandal — include them. Visitors remember these. Flag anything uncertain with "(verify before using)."

Close with one sentence on where the work sits now — how the conversation around it has or hasn't settled. 4–6 sentences total.

---

## THE LIVE QUESTION

The tension the work hasn't resolved — something visitors tend to land on differently. Frame it as something the docent can put to the group directly. "Some people read this as X. Some read it as Y. What do you see?"

2–3 sentences. Leave it open. No verdict.`;

function getAudienceFraming(audience: string): string {
  const a = audience?.toLowerCase() || '';

  if (a.includes('progress') || a.includes('wip') || a.includes('making')) {
    return `AUDIENCE FRAMING — ARTIST, WORK IN PROGRESS:
The material/formal and perceptual domains are most live for this person. Frame noise findings as decisions still available — not verdicts on what's broken. The work is open. What can still change? What's worth reconsidering before going further? Keep the conceptual and cultural domains thorough but frame them as context, not urgency.`;
  }

  if (a.includes('history') || a.includes('instructor') || a.includes('canon') || a.includes('historical')) {
    return `AUDIENCE FRAMING — ART HISTORY INSTRUCTOR / EDUCATOR:
The conceptual and historical domain is primary. The cultural domain explains the work's reception and canon position. Noise findings have a specific job here: show where historical significance lives despite what might look like failure in another domain. Mondrian is the model — perceptual thinness is the conceptual argument. Frame findings to help someone explain why a work matters in the canon even when a student might initially find it visually unrewarding. Also identify what this work demonstrates as a teaching example — what principle or problem it makes visible that applies beyond this specific work.`;
  }

  return '';
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
        const audienceForStatus = (audience || '').toLowerCase();
        const statusMsg = audienceForStatus.includes('docent')
          ? 'Pass 2 — docent guide…'
          : audienceForStatus.includes('critic')
          ? 'Pass 2 — criticism…'
          : audienceForStatus.includes('tour')
          ? 'Pass 2 — tour guide…'
          : 'Pass 2 — four domain readings…';
        send({ type: 'status', message: statusMsg });

        const artworkContext = buildArtworkContext(fields);
        const isDocent = (audience || '').toLowerCase().includes('docent');
        const isCritic = (audience || '').toLowerCase().includes('critic');
        const isTour  = (audience || '').toLowerCase().includes('tour');
        const audienceFraming = getAudienceFraming(audience || '');
        const contextBlock = [artworkContext, audienceFraming].filter(Boolean).join('\n');
        const pass2UserText = isDocent
          ? (artworkContext ? artworkContext + '\n---\n\n' : '') + DOCENT_PROMPT(pass1Text, PRINCIPLE_NAMES)
          : isCritic
          ? (artworkContext ? artworkContext + '\n---\n\n' : '') + CRITIC_PROMPT(pass1Text, PRINCIPLE_NAMES)
          : isTour
          ? (artworkContext ? artworkContext + '\n---\n\n' : '') + TOUR_PROMPT(pass1Text, PRINCIPLE_NAMES)
          : (contextBlock ? contextBlock + '\n---\n\n' : '') + PASS2_PROMPT(pass1Text, PRINCIPLE_NAMES);

        const pass2Stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: isDocent ? 1500 : isCritic ? 1000 : isTour ? 2000 : 8000,
          system: isDocent
            ? 'You are a museum educator preparing practical docent materials for general visitors.'
            : isCritic
            ? 'You are a working art critic writing a short review for an intelligent general reader. You have a point of view. You use it.'
            : isTour
            ? 'You are a museum educator preparing a complete tour stop guide — entry prompts for group looking, followed by a docent narrative a guide can speak from.'
            : 'You are a rigorous art analyst working across perceptual, material, cultural, and conceptual domains simultaneously. Write in short declarative sentences. Active present tense. No passive constructions, no institutional hedging, no academic abstractions. Trust the reader to follow without hand-holding. Tone test: if a sentence sounds like someone presenting at a conference, rewrite it. If it sounds like someone leaning across a table and saying exactly what they see, it\'s right.',
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
