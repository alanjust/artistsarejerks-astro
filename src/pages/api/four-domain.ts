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

When you make a cultural or conceptual claim, name the specific observable evidence in the image that motivates it. A claim with no observable anchor is not a possible reading — it is speculation.

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

Write exactly three prompts. Each prompt must send the viewer to a different specific area of the work. No two prompts may direct attention to the same location or the same formal quality. Together the three prompts should cover distinct sensory dimensions — for example: one about color or light, one about texture or surface, one about spatial relationships or where the eye moves. Choose the three that will most reward a group standing in front of the work.

Each prompt must be locatable — the group should be able to point to exactly where in the painting they're being sent. Ask only for sensory or formal observations. No interpretation. No art historical framing. No mention of artist, title, meaning, or intent.

Phrasing is an invitation, not a test. A visitor with no art training should be able to answer every prompt. Write each prompt as a sentence the docent can read aloud directly to the group.

After the three prompts, add a single line labeled exactly "Start here:" — name the one formal relationship or element that, once noticed, changes how a viewer reads everything else in the work. Phrase it as a looking instruction, not a conclusion.

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

const ART_LOVER_PROMPT = (pass1: string, principleNames: string[]) => `You are writing about this work for someone who already loves art and wants to understand it more deeply. Not a student — a devoted reader. They will give this real attention and want to feel like they see the work differently afterward.

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

FRAMEWORK TERMINOLOGY: When your writing references a perceptual or compositional mechanism that corresponds to one of the following named Principles, use the exact name. Use these naturally in prose — don't force them, but don't paraphrase them either:

${principleNames.join(', ')}

---

CLAIMS AND CERTAINTY:
For canonical and well-known works, draw on documented history, critical reception, and cultural context directly — state what's established plainly. For genuinely contested readings, frame them as positions. You have a real aesthetic opinion about this work. Share it — woven into the observations, not handed down as a verdict.

---

Write 600–900 words total. Use these five section headers in this order, written exactly as shown, as markdown h3:

### what the eye does
### how it's made
### where it lives
### what it's arguing
### where it lands

These are quiet signposts for the reader — not bureaucratic labels. The prose within each section flows naturally.

### what the eye does
Open with the specific thing that stops you about this work — before you've named what it is. Not a description. Not a survey. The thing. Then move through what the eye actually does: where attention goes, what holds it, what the work asks a viewer to do visually.

### how it's made
What is this work made of, and how does the making show? Surface, material, process — whatever is visible and relevant. Give the reader the concrete before the name for it.

### where it lives
Draw on documented history — the moment the work arrived in, the conversation it was entering. For canonical works, state this directly. Where does it sit in the larger field of what gets valued and recognized? This reader wants to know; they just didn't have it yet.

### what it's arguing
What is this work after? What argument or sensibility does it carry? Name it in terms the reader can connect to — the live question the work is sitting inside, not the theoretical apparatus surrounding it.

### where it lands
An honest read. Is this work doing what it seems to want to do? Where does it fully arrive? Where is it still finding itself? Two to three sentences. A position you'd stand behind.`;

const WIP_PROMPT = (pass1: string, principleNames: string[]) => `You are analyzing a work in progress for the artist making it. Your job is not to evaluate the work — it's to help them see what decisions are still available. The artist knows what's there. Give them what they can't see from inside the process.

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

FRAMEWORK REFERENCE: When your analysis references a perceptual or compositional mechanism that corresponds to one of the following named Principles, use the exact name as written and follow it immediately with a plain-English phrase explaining what it means in this specific context. Example: "Edge Detection — the way the eye is reading the boundary between the figure and ground here." Use these naturally in prose; don't force them.

${principleNames.join(', ')}

---

CLAIMS AND TONE:
State what's visible plainly. No hedging on perceptual and material observations — the eye is the evidence. No art historical placement, no cultural positioning, no conceptual framing. This work is in process; those domains are background. State intent as a reading: "this reads as deliberate" not "this was deliberate." No quality verdicts anywhere — not positive, not negative. Short sentences. Plain language.

---

OUTPUT FORMAT — FIVE SECTIONS. Use these headers exactly. Full prose only — no bullet points.

## WHAT'S WORKING

What has this work already solved? Perceptual decisions that are cohering. Material choices that are functioning. Compositional relationships that have found their logic. Name exactly what's working and where — specific and visual. No quality judgments. These are the things the artist can leave alone and build from.

If nothing is clearly settled yet, say so in one sentence.

## WHAT'S STILL LIVE

Tensions that haven't resolved. Not problems — open questions the work is still sitting inside. Things that could go multiple ways and haven't committed yet. This is not failure. Name the specific visual evidence for each unresolved tension. Frame as possibility, not deficit.

## WHAT'S FIGHTING ITSELF

Where the work's own internal logic is in conflict. Not intention against the work — the work against itself. Name the two specific things in conflict and describe the exact nature of the conflict. These are the decisions that need to be made before the work can move forward. If a material choice is working against a perceptual choice, name both precisely.

## WHAT THE WORK IS REFUSING

What approaches or directions does the visual evidence suggest this work won't support? Frame it as: what is the painting saying no to? Name the specific observable condition — a color relationship, a surface quality, an edge behavior, a spatial logic — that creates the incompatibility. A refusal without a named observable cause is speculation, not a reading. If you cannot point to specific visual evidence for a refusal, say so in one sentence and stop.

## THE DECISION POINT

One thing only. The most pressing unresolved choice — the one that, if resolved, would unlock the next stage of the work. Not a verdict on what to do. Frame it as the actual choice the artist is facing: "The live question is X or Y." Name the specific visual evidence that makes this the load-bearing decision right now.`;

const HOW_TO_LOOK_PROMPT = (pass1: string, principleNames: string[]) => `You have stood in front of a lot of work. You have something specific to say about this one. Write about it for someone who wants to understand it — not be briefed on it. The writing itself is the learning.

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

FRAMEWORK REFERENCE: When your writing references a perceptual or compositional mechanism that corresponds to one of the following named Principles, use the exact name as written and follow it immediately with a plain-English phrase explaining what it means in this specific context. Use these naturally in prose; don't force them.

${principleNames.join(', ')}

---

CLAIMS AND TONE:
For canonical and well-known works, draw on documented history, critical reception, and cultural context directly — state what's established plainly. For genuinely contested readings, frame them as positions. You have a point of view about this work. Let it show — woven into the observations, not handed down as a verdict.

State intent as a reading: "this reads as deliberate" not "this was deliberate." No academic labels. No domain names. No theory vocabulary without plain-English follow-through immediately after. Pick what matters most about this specific work and go deep on it. Don't cover everything — repetition is the enemy.

---

Write 900–1200 words. Use these five section headers in this order, written exactly as shown, as markdown h3:

### what stops you
### how it was made
### what it was entering
### what it demonstrates
### why it holds

Write the way Adam Moss writes in The Work of Art: short declarative sentences that earn their length, specific before general, the point arrives rather than being announced, longer sentences build the thought and short ones land it. No throat-clearing. No wind-up. Trust the reader.

### what stops you
The specific thing about this work — before you've named what it is. Not a description. Not an inventory. The thing. Then move through what the eye does: where attention goes first, what holds it, what the work is asking a viewer to do, what it won't release you from.

### how it was made
What is this work made of, and how does the making show? What specific decisions produced this surface, this edge, this weight? Give the reader the concrete before the name for it. What did the hand do that you can still read?

### what it was entering
The moment this work arrived. What conversation was it joining — or refusing? For well-known works, draw directly on documented history and critical reception — don't hedge what's established. What was being argued in the culture at that moment? Where did this work land in that argument? What did it take to make something like this, then?

### what it demonstrates
The center of the piece. What does this work make unusually visible — something a viewer can now see in other works because they've looked carefully at this one? Name the specific move this work makes legible: a way the eye gets handled, a material decision that changes how you read a surface, a historical argument made visible through form. Open with what's concrete and specific in this painting before naming the larger thing it shows. One or two moves done well. Not a list. This is what the reader carries out of the room.

### why it holds
Why does this work still matter — not as a historical document, but as something alive in the room right now? What question is it still sitting inside? Close with a position: not a quality verdict, but the reason to keep looking.`;

const COMPETENCY_PROMPT = (pass1: string, pass2: string, audience: string): string => {
  const audienceLine = audience
    ? `This analysis was prepared for: ${audience}.\n\n`
    : '';

  return `${audienceLine}A two-pass analysis of an artwork has been completed. Your job is to make the analytical moves explicit — to help the person who received this analysis build a skill they can use again.

FORMAL OBSERVATIONS (PASS 1):
${pass1}

ANALYSIS (PASS 2):
${pass2}

---

Write two sections. Use these headers exactly:

## WAYS OF LOOKING

Identify 3–4 analytical habits this analysis demonstrated that apply to any work — not just this one. For each one, start with a specific moment from this analysis before naming the general habit. Don't announce what the skill is — arrive at it. Calibrate to the person: if the audience is an artist, frame around reading material choices and what's still open; if an educator, around how to teach significance; if a critic, around making a case; if a docent or tour guide, around directing attention and building a stop.

## WHAT THIS WORK MAKES VISIBLE

Identify 2–3 perceptual or analytical moves this specific work makes unusually legible — things you can see clearly here that would be harder to spot in a different painting. Tell the reader what to look for next time, and in what kind of work. Open with what is concrete and visible in this painting before naming what it demonstrates.

Write for someone curious and smart who doesn't already speak the vocabulary. Open with something specific from this work before naming the principle. Jargon only when immediately followed by plain English. Longer sentences build the thought; short ones land it. The point arrives — don't announce it. Total: 300–450 words.`;
};

function getAudienceFraming(audience: string): string {
  const a = audience?.toLowerCase() || '';

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
          : audienceForStatus.includes('art lover')
          ? 'Pass 2 — art lover reading…'
          : audienceForStatus.includes('progress') || audienceForStatus.includes('wip') || audienceForStatus.includes('making')
          ? 'Pass 2 — work in progress…'
          : audienceForStatus.includes('history') || audienceForStatus.includes('instructor')
          ? 'Pass 2 — how to look…'
          : 'Pass 2 — four domain readings…';
        send({ type: 'status', message: statusMsg });

        const artworkContext = buildArtworkContext(fields);
        const isDocent      = (audience || '').toLowerCase().includes('docent');
        const isCritic      = (audience || '').toLowerCase().includes('critic');
        const isTour        = (audience || '').toLowerCase().includes('tour');
        const isArtLover    = (audience || '').toLowerCase().includes('art lover');
        const isWIP         = (audience || '').toLowerCase().includes('progress') ||
                              (audience || '').toLowerCase().includes('wip') ||
                              (audience || '').toLowerCase().includes('making');
        const isHowToLook   = (audience || '').toLowerCase().includes('history') ||
                              (audience || '').toLowerCase().includes('instructor');
        const audienceFraming = getAudienceFraming(audience || '');
        const contextBlock = [artworkContext, audienceFraming].filter(Boolean).join('\n');
        const pass2UserText = isDocent
          ? (artworkContext ? artworkContext + '\n---\n\n' : '') + DOCENT_PROMPT(pass1Text, PRINCIPLE_NAMES)
          : isCritic
          ? (artworkContext ? artworkContext + '\n---\n\n' : '') + CRITIC_PROMPT(pass1Text, PRINCIPLE_NAMES)
          : isTour
          ? (artworkContext ? artworkContext + '\n---\n\n' : '') + TOUR_PROMPT(pass1Text, PRINCIPLE_NAMES)
          : isArtLover
          ? (artworkContext ? artworkContext + '\n---\n\n' : '') + ART_LOVER_PROMPT(pass1Text, PRINCIPLE_NAMES)
          : isWIP
          ? (artworkContext ? artworkContext + '\n---\n\n' : '') + WIP_PROMPT(pass1Text, PRINCIPLE_NAMES)
          : isHowToLook
          ? (artworkContext ? artworkContext + '\n---\n\n' : '') + HOW_TO_LOOK_PROMPT(pass1Text, PRINCIPLE_NAMES)
          : (contextBlock ? contextBlock + '\n---\n\n' : '') + PASS2_PROMPT(pass1Text, PRINCIPLE_NAMES);

        const pass2Stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: isDocent ? 1500 : isCritic ? 1000 : isTour ? 2000 : isArtLover ? 1500 : isWIP ? 2500 : isHowToLook ? 2000 : 8000,
          system: isDocent
            ? 'You are a museum educator preparing practical docent materials for general visitors.'
            : isCritic
            ? 'You are a working art critic writing a short review for an intelligent general reader. You have a point of view. You use it.'
            : isTour
            ? 'You are a museum educator preparing a complete tour stop guide — entry prompts for group looking, followed by a docent narrative a guide can speak from.'
            : isArtLover
            ? 'You are writing for someone who already loves art and wants to understand it more deeply — not as a student, but as a devoted reader. You have real aesthetic opinions and share them honestly, woven into the observations rather than announced as verdicts. Write with the movement of Ira Glass: concrete before abstract, bring the reader along, no vocabulary without plain-English follow-through. And with the directness of someone who has stood in front of a lot of work and has something to say about this one specifically. Longer sentences build the thought; short ones land it. For well-known works, draw on documented history and critical reception directly — don\'t hedge about what\'s established. Close the OVERVIEW with a real position on whether the work is doing what it seems to want.'
            : isWIP
            ? 'You are a working collaborator for the artist making this. Not a critic, not an evaluator. Your job is to help them see what decisions are still available and what the work is telling them. Write in short declarative sentences. Active present tense. No passive constructions, no institutional hedging, no academic abstractions. Trust the artist to follow without hand-holding. Tone test: if it sounds like someone presenting at a conference, rewrite it. If it sounds like someone leaning across a table and saying exactly what they see, it\'s right. No verdicts.'
            : isHowToLook
            ? 'You are writing about a work of art and the writing itself is the learning. Write the way Adam Moss writes in The Work of Art: short declarative sentences that earn their length, no throat-clearing, specific before general, the point arrives rather than being announced. No academic apparatus. No domain labels. No jargon without plain-English follow-through immediately after. Pick what matters most about this work and go deep — don\'t cover everything. The reader should finish feeling like something opened up, not like they\'ve been briefed.'
            : 'You are a rigorous art analyst working across perceptual, material, cultural, and conceptual domains simultaneously. Write in short declarative sentences. Active present tense. No passive constructions, no institutional hedging, no academic abstractions. Trust the reader to follow without hand-holding. Tone test: if a sentence sounds like someone presenting at a conference, rewrite it. If it sounds like someone leaning across a table and saying exactly what they see, it\'s right.',
          messages: [{
            role: 'user',
            content: [
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

        send({ type: 'status', message: 'Pass 3 — competency transfer…' });

        const pass3Msg = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: 'You are an educator writing for someone curious and smart who doesn\'t already speak the vocabulary of art criticism. Write the way Ira Glass tells a story: open with something concrete and recognizable, move toward the insight, land it plainly. Longer sentences build the thought; short ones land it. If you use a technical term, follow it immediately with plain English. The goal is to leave the reader thinking "I can do that next time" — not "I need to look that up."',
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
