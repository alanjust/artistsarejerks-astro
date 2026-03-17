// ─────────────────────────────────────────────────────────────────────────────
// Hidden Grammar — Analysis Modes
// src/data/analysisModes.js
//
// STRUCTURE:
//   analysisModes        → Level 1: Home page category cards
//   Each mode.prompts    → Level 2: Mode-specific prompt cards
//   Upload page          → Level 3: Analysis output + interrogation window
//
// TO ADD A NEW MODE:     Add an entry to analysisModes
// TO ADD A NEW PROMPT:   Add an entry to the mode's prompts array
// TO ADD A SUB-MODE:     Add an entry to the mode's subModes array
//
// The basePrompt and interrogationBase are non-negotiable.
// Every analysis and every interrogation runs through them.
// They cannot be overridden by mode or prompt config.
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// BASE PROMPT
// Prepended to every analysis regardless of mode, sub-mode, or prompt.
// This is the Hidden Grammar guarantee — always runs, never overridden.
// ─────────────────────────────────────────────────────────────────────────────

export const basePrompt = `
You are conducting a visual analysis using the Hidden Grammar framework.

ALWAYS:
- Observe concrete visual evidence only. Start with what is physically present.
- Map observations to perceptual and neural mechanisms from the 54 Principles and 11 Roots.
- Treat interpretation as hypothesis, never verdict.
- Apply the RAP Protocol: no interpretation without observable evidence. State what you see before stating what it means. An interpretive claim requires at least two independent visual observations to support it.

NEVER:
- Use the words good, bad, successful, unsuccessful, effective, or ineffective.
- Assign quality judgments of any kind.
- Imply intent on the part of the maker.
- Make claims about what the work "tries" to do or "fails" to do.
- Offer unsolicited advice or improvement suggestions.

LANGUAGE CONVENTIONS — three registers, never collapsed:
- What is physically present in the image: anchor with "The image shows...", "Visible here...", "Present in the work..."
- Perceptual or neural effects triggered by what is present: anchor with "This activates...", "The mechanism here is...", "The perceptual effect is..."
- Interpretation or associative readings: anchor with "One reading is...", "This may suggest...", "A possible response..."
Never collapse these three registers into a single unqualified claim.

All mode-specific instructions below operate strictly within these constraints.
`;


// ─────────────────────────────────────────────────────────────────────────────
// INTERROGATION BASE PROMPT
// Appended to every follow-up question in the interrogation window.
// Keeps the conversation anchored to the original analysis.
// ─────────────────────────────────────────────────────────────────────────────

export const interrogationBase = `
You are responding to a follow-up question about the Hidden Grammar analysis above.

ALWAYS:
- Stay anchored to the visual evidence already identified in the analysis.
- Reference specific observations from the prior output when relevant.
- Treat your response as a continuation of the same analytical conversation.
- When asked directional questions ("how do I push this toward X"),
  describe the visual and perceptual mechanisms involved — not subjective preferences.

NEVER:
- Introduce new interpretations not grounded in the visual evidence already observed.
- Use evaluative language (good, bad, better, worse).
- Abandon the Hidden Grammar framework in favor of general art advice.
- Treat the follow-up as a fresh prompt disconnected from the prior analysis.
`;


// ─────────────────────────────────────────────────────────────────────────────
// UI CONFIG
// Controls behavior of the upload and output page.
// ─────────────────────────────────────────────────────────────────────────────

export const uiConfig = {
  // Copy button appears at the end of every analysis output.
  // No download button. User copies and pastes into their document of choice.
  showCopyButton: true,
  showDownloadButton: false,

  // Interrogation window appears below the output after analysis completes.
  showInterrogationWindow: true,
  interrogationPlaceholder: 'Ask a follow-up question about this analysis...',
  interrogationSubmitLabel: 'Ask',
};


// ─────────────────────────────────────────────────────────────────────────────
// ANALYSIS MODES
// Level 1: Home page category cards
// Each mode contains Level 2 prompt cards in its prompts array
// ─────────────────────────────────────────────────────────────────────────────

export const analysisModes = [

  // ───────────────────────────────────────────
  // FIRST LOOK
  // Entry-point mode. No sub-modes. No setup.
  // Reached directly from the Art Lab landing page Try Me button.
  // ───────────────────────────────────────────
  {
    id: 'first-look',
    label: 'First Look',
    description: 'A rapid first read of any work. No setup required — upload anything and see what the image is doing before you start breaking it down.',
    subModes: [],
    fields: [
      { id: 'notes', label: 'Notes (optional)' },
    ],

    prompts: [
      {
        id: 'first-look-read',
        label: 'First Read',
        description: 'What does this work do in the first three seconds? A rapid initial read before full analysis.',
        prompt: `A visitor just uploaded this image. They are likely a practicing or amateur artist. They have no prior knowledge of Hidden Grammar. They don't yet know what this tool does.

Show them one thing this tool can do that they couldn't do themselves.

VOICE: Ira Glass register. Do not open with a description of the painting or a claim about what it is. Open with what happens in the viewer's perceptual system in the first moment of looking—a specific, observable event, not a summary. Build forward using honest turn signals: 'so,' 'here's the thing,' 'and here's where it gets interesting.' Let the insight arrive at the end; do not announce it in advance. Longer sentences build the thought. Short ones land it.

FORMAT: Prose only. No section headers. No bullets. No numbered lists. No labels.

CONTENT:
- Run your full perceptual analysis internally. Do not surface the phases or show your work.
- Identify the 2 most dominant mechanisms at work in this image.
- For each mechanism: describe what it does to the viewer's attention before naming the principle.
- Name at most 1 Root. Before using the framework term, describe in plain language what it means for this specific painting.
- Do not open with 'This painting' or 'The image shows.' That's a report. This is a discovery.
- Refer to the tool as 'Art Lab'—not 'Hidden Grammar'—in all output. Do not mention the tool by name in the first half of the response. Earn it.
- Target: 280–320 words.

CLOSE: End with one sentence—not a pitch—that honestly states what a deeper analysis of this image would reveal. The reader should feel there is more to see, not that they are being sold something.`,
      },
    ],
  },


  // ───────────────────────────────────────────
  // FINE ART
  // ───────────────────────────────────────────
  {
    id: 'fine-art',
    label: 'Fine Art',
    description: 'Analyze painting, sculpture, works on paper, photography, printmaking, and installation through the Hidden Grammar framework.',
    subModes: [
      { id: 'fine-art-painting',        label: 'Painting' },
      { id: 'fine-art-sculpture',       label: 'Sculpture' },
      { id: 'fine-art-works-on-paper',  label: 'Works on Paper' },
      { id: 'fine-art-photography',     label: 'Photography' },
      { id: 'fine-art-installation',    label: 'Installation' },
      { id: 'fine-art-printmaking',     label: 'Printmaking' },
      { id: 'fine-art-other',           label: 'Other / Specify',
        description: 'Describe what you are analyzing in the notes field.' },
    ],
    fields: [
      { id: 'artist',     label: 'Artist' },
      { id: 'title',      label: 'Title' },
      { id: 'period',     label: 'Period / Year' },
      { id: 'medium',     label: 'Medium' },
      { id: 'dimensions', label: 'Dimensions' },
      { id: 'context',    label: 'Collection / Exhibition Context' },
      { id: 'notes',      label: 'Notes' },
    ],

    // Level 2: Prompt cards shown after selecting Fine Art
    prompts: [
      {
        id: 'fine-art-comprehensive',
        label: 'Comprehensive Analysis',
        description: 'Full Hidden Grammar audit across all 11 Roots and relevant Principles.',
        prompt: `Conduct a full Hidden Grammar analysis of this work.
Work through all 11 Roots systematically: Design Logic, Tactile Execution, Structural Integrity,
Atmosphere, Visual Hierarchy, Narrative Sequence, Signal Strength, Gravitas, Entropy,
Materiality, and Format. For each Root, identify which of the 54 Principles are active.
Map observations to perceptual and neural mechanisms. Do not interpret until the Evidence Gate
is passed. Present findings as structured observations, not conclusions.`,
      },
      {
        id: 'fine-art-wip',
        label: 'Work in Progress',
        description: 'Assess the current state of an unfinished work using observable evidence only.',
        prompt: `This is a work in progress. Analyze only what is physically present and observable.
Do not speculate about what the work intends to become. Identify which Roots and Principles
are currently active, which appear unresolved, and where visual tension exists between
elements. Report observations as the current state of the work, not as problems to fix.`,
      },
      {
        id: 'fine-art-surface',
        label: 'Materiality & Surface',
        description: 'Focus on tactile execution, medium, and surface evidence.',
        prompt: `Focus this analysis on the Materiality and Tactile Execution roots.
Examine surface evidence: mark-making, texture, layering, medium behavior,
and the relationship between physical material and visual result.
Identify which of the 54 Principles are activated specifically through material choices.
Map to relevant neural mechanisms including mirror neuron activation and haptic response.`,
      },
      {
        id: 'fine-art-space',
        label: 'Spatial Structure',
        description: 'Analyze how space is constructed, implied, and navigated.',
        prompt: `Focus this analysis on how space is constructed in this work.
Examine Structural Integrity, Design Logic, and Visual Hierarchy as primary roots.
Identify depth cues, planar relationships, figure-ground dynamics, and navigational
pathways. Map to spatial perception mechanisms: atmospheric perspective, occlusion,
size relationships, and edge behavior. Report how the eye is moved through the space.`,
      },
      {
        id: 'fine-art-canon',
        label: 'Historical Positioning',
        description: 'Locate the work within art historical context using observable visual evidence.',
        prompt: `Analyze the visual evidence in this work for markers that locate it within
art historical movements, traditions, or lineages. Identify stylistic mechanisms that
connect to or depart from known visual languages. Do not assign value to historical
alignment or departure. Report what the visual evidence suggests about context and lineage,
treating historical positioning as observable fact, not judgment.`,
      },
    ],
  },


  // ───────────────────────────────────────────
  // CPG — CONSUMER PACKAGED GOODS
  // ───────────────────────────────────────────
  {
    id: 'cpg',
    label: 'Consumer Packaged Goods',
    description: 'Analyze packaging and product design across packaged goods, hard goods, personal care, and luxury categories.',
    subModes: [
      { id: 'cpg-packaged-goods', label: 'Packaged Goods',
        description: 'Food, beverage, household consumables' },
      { id: 'cpg-hard-goods',     label: 'Hard Goods',
        description: 'Tools, appliances, durable products' },
      { id: 'cpg-personal-care',  label: 'Personal Care / Beauty',
        description: 'Cosmetics, skincare, pharma' },
      { id: 'cpg-luxury',         label: 'Luxury Goods',
        description: 'Premium packaging, gift context' },
      { id: 'cpg-other',          label: 'Other / Specify',
        description: 'Describe what you are analyzing in the notes field.' },
    ],
    fields: [
      { id: 'brand',            label: 'Brand' },
      { id: 'product-category', label: 'Product Category' },
      { id: 'demographic',      label: 'Target Demographic' },
      { id: 'shelf-context',    label: 'Shelf / Retail Context' },
      { id: 'competitive-set',  label: 'Competitive Set' },
      { id: 'notes',            label: 'Notes' },
    ],

    // Level 2: Prompt cards shown after selecting CPG
    prompts: [
      {
        id: 'cpg-shelf',
        label: 'Shelf Performance',
        description: 'Analyze visual performance in a competitive retail environment.',
        prompt: `Analyze this packaging design for shelf performance using the Hidden Grammar framework.
Artist identity is not relevant. Focus on Signal Strength, Visual Hierarchy, and Atmosphere
as primary roots. Identify perceptual mechanisms that drive or interrupt attention at point
of purchase. Examine figure-ground relationships, color signal, typographic hierarchy,
and structural differentiation from category conventions. Report what the visual evidence
shows about attention capture, not whether it will sell.`,
      },
      {
        id: 'cpg-brand',
        label: 'Brand Differentiation',
        description: 'Examine how visual identity distinguishes this product from its competitive set.',
        prompt: `Analyze the visual evidence for brand differentiation in this packaging design.
Examine how Design Logic and Signal Strength operate to establish visual distinctiveness.
Identify which Principles create separation from category visual language.
Report what is visually singular about this design versus what follows category conventions.
Do not assess whether differentiation is desirable — report what exists.`,
      },
      {
        id: 'cpg-demographic',
        label: 'Demographic Alignment',
        description: 'Identify visual cues that signal audience and demographic intent.',
        prompt: `Analyze the visual evidence in this packaging for cues that signal
intended audience and demographic. Examine color psychology, typographic register,
imagery conventions, and structural formality as observable data.
Map findings to perceptual and cultural mechanisms where identifiable.
Do not assess whether the demographic alignment is achieved — report what the
visual evidence communicates and to whom it is likely to signal.`,
      },
      {
        id: 'cpg-wip',
        label: 'Design in Progress',
        description: 'Assess the current state of a packaging design under development.',
        prompt: `This packaging design is a work in progress. Analyze only what is
physically present and observable. Identify which visual systems are currently resolved
and which remain in tension. Report the current state of Signal Strength, hierarchy,
and structural relationships without speculating about intended outcomes.
Present observations as the current state of the design, not as problems to fix.`,
      },
    ],
  },


  // ───────────────────────────────────────────
  // COMIC BOOK / SEQUENTIAL ART
  // ───────────────────────────────────────────
  {
    id: 'comic-book',
    label: 'Comic Book & Sequential Art',
    description: "Analyze American superhero, manga, independent, children's comics, and webcomics through visual storytelling and sequential grammar.",
    subModes: [
      { id: 'comic-superhero',   label: 'American Superhero' },
      { id: 'comic-manga',       label: 'Manga' },
      { id: 'comic-independent', label: 'Independent / Alternative' },
      { id: 'comic-childrens',   label: "Children's Comics" },
      { id: 'comic-webcomic',    label: 'Webcomic' },
      { id: 'comic-other',       label: 'Other / Specify',
        description: 'Describe what you are analyzing in the notes field.' },
    ],
    fields: [
      { id: 'publisher', label: 'Publisher' },
      { id: 'era',       label: 'Era / Year' },
      { id: 'genre',     label: 'Genre' },
      { id: 'art-style', label: 'Art Style' },
      { id: 'format',    label: 'Format (single issue, graphic novel, webcomic)' },
      { id: 'notes',     label: 'Notes' },
    ],

    // Level 2: Prompt cards shown after selecting Comic Book
    prompts: [
      {
        id: 'comic-comprehensive',
        label: 'Comprehensive Sequential Analysis',
        description: 'Full Hidden Grammar analysis adapted for sequential art and panel structure.',
        prompt: `Conduct a Hidden Grammar analysis of this sequential art using all relevant Roots.
Give particular attention to Narrative Sequence as a primary root alongside Design Logic
and Visual Hierarchy. Analyze panel composition, page flow, gutter relationships,
and how visual grammar serves sequential storytelling.
Map observations to perceptual mechanisms: eye movement, temporal implication,
closure across gutters, and figure-ground in panel design.
Do not assess story quality — analyze visual mechanisms only.`,
      },
      {
        id: 'comic-wip',
        label: 'Work in Progress',
        description: 'Assess pencils, inks, or layouts at any stage of development.',
        prompt: `This sequential art is a work in progress. It may be at pencil, ink,
layout, or color rough stage. Analyze only what is physically present and observable
at this stage. Identify which visual systems — panel structure, figure weight,
spatial relationships, narrative flow — are resolved and which remain open.
Report the current state of the work without speculating about intended completion.`,
      },
      {
        id: 'comic-audience',
        label: 'Audience Assessment',
        description: 'Identify visual cues that signal intended age range, genre, and readership.',
        prompt: `Analyze the visual evidence in this sequential art for cues that signal
intended audience. Examine line weight, figure proportion, facial expression range,
panel density, color palette, typographic register, and visual complexity
as observable audience signals. Map these to the perceptual and developmental
mechanisms that make certain visual languages accessible to specific age ranges.
Report what the visual evidence communicates about intended readership,
not whether it reaches that readership.`,
      },
      {
        id: 'comic-style-classification',
        label: 'Style Classification',
        description: 'Locate the visual style within sequential art traditions and lineages.',
        prompt: `Analyze the visual evidence in this sequential art for markers that locate it
within comics visual traditions. Examine line quality, figure construction,
spatial conventions, panel grammar, and visual rhythm for stylistic signatures.
Identify which traditions — American superhero, manga, European ligne claire,
underground comix, or others — are present in the observable visual language.
Report visual lineage as observable fact. Do not assess whether the style is
derivative or original.`,
      },
      {
        id: 'comic-market-fit',
        label: 'Market Context',
        description: 'Examine how the visual language positions this work within its market category.',
        prompt: `Analyze the visual evidence in this sequential art for signals that position it
within its market category. Examine how Design Logic, Signal Strength, and visual register
operate in relation to category conventions. Identify where the visual language aligns with
or departs from the conventions of its stated genre and format.
Report what the observable visual evidence suggests about market positioning —
not whether that positioning is strategic or intentional.`,
      },
    ],
  },


  // ───────────────────────────────────────────
  // COMMERCIAL ILLUSTRATION
  // ───────────────────────────────────────────
  {
    id: 'commercial-illustration',
    label: 'Commercial Illustration',
    description: "Analyze editorial, advertising, book cover, children's book, character design, and technical illustration in its intended commercial context.",
    subModes: [
      { id: 'illus-editorial',   label: 'Editorial' },
      { id: 'illus-book-cover',  label: 'Book Cover' },
      { id: 'illus-advertising', label: 'Advertising Campaign' },
      { id: 'illus-childrens',   label: "Children's Book" },
      { id: 'illus-character',   label: 'Character Design' },
      { id: 'illus-technical',   label: 'Technical / Scientific' },
      { id: 'illus-other',       label: 'Other / Specify',
        description: 'Describe what you are analyzing in the notes field.' },
    ],
    fields: [
      { id: 'client-industry', label: 'Client / Industry' },
      { id: 'intended-use',    label: 'Intended Use' },
      { id: 'format',          label: 'Format' },
      { id: 'audience',        label: 'Audience' },
      { id: 'reproduction',    label: 'Reproduction Context (print, digital, large format)' },
      { id: 'notes',           label: 'Notes' },
    ],

    // Level 2: Prompt cards shown after selecting Commercial Illustration
    prompts: [
      {
        id: 'illus-comprehensive',
        label: 'Comprehensive Analysis',
        description: 'Full Hidden Grammar analysis in the context of the commercial brief.',
        prompt: `Conduct a Hidden Grammar analysis of this commercial illustration.
Evaluate Signal Strength, Visual Hierarchy, and Atmosphere as primary roots,
given that commercial illustration must communicate within its reproduction context.
Identify which of the 54 Principles are active and map them to perceptual mechanisms.
Assess the illustration within its stated commercial context — editorial, advertising,
book cover, or other. Do not assess artistic merit independently of function.`,
      },
      {
        id: 'illus-wip',
        label: 'Work in Progress',
        description: 'Assess a sketch, rough, or comp at any stage of development.',
        prompt: `This illustration is a work in progress — it may be at sketch, rough comp,
or color study stage. Analyze only what is physically observable at this stage.
Identify which visual systems are resolved and which remain open: compositional structure,
figure-ground relationships, tonal organization, and signal hierarchy.
Report the current state of the work without speculating about the finished piece.`,
      },
      {
        id: 'illus-communication',
        label: 'Communication Clarity',
        description: 'Analyze how clearly the visual message reads within its reproduction context.',
        prompt: `Analyze the visual evidence in this illustration for communication clarity
within its stated reproduction context. Examine Signal Strength, Design Logic,
and Visual Hierarchy as primary roots. Identify what the image communicates at
first glance versus on closer inspection. Map findings to perceptual mechanisms:
pre-attentive processing, focal point hierarchy, and figure-ground relationships.
Report what the visual evidence shows about message clarity — not whether the
message is the right message.`,
      },
      {
        id: 'illus-audience-signal',
        label: 'Audience Signals',
        description: 'Identify visual cues that communicate intended audience and register.',
        prompt: `Analyze the visual evidence in this illustration for cues that signal
intended audience and tonal register. Examine line quality, color temperature,
figure style, typographic relationship (if present), and compositional formality
as observable signals. Map these to perceptual mechanisms that establish register —
formal, playful, authoritative, intimate, and so on. Report what the visual
evidence communicates about intended audience, not whether it reaches that audience.`,
      },
      {
        id: 'illus-character',
        label: 'Character Design Analysis',
        description: 'Analyze a character design for visual coherence, readability, and distinctiveness.',
        prompt: `Analyze this character design using the Hidden Grammar framework.
Examine how Design Logic, Signal Strength, and Structural Integrity operate
in the construction of the character. Identify silhouette readability,
visual weight distribution, facial expression range implied by the design,
and color organization. Map findings to perceptual mechanisms: peak shift,
contour bias, figure-ground relationships, and visual weight.
Report what the visual evidence shows about the character as a visual system —
not whether it is appealing or original.`,
      },
    ],
  },


  // ───────────────────────────────────────────
  // CONSTRAINTS & OPPORTUNITIES
  // ───────────────────────────────────────────
  {
    id: 'constraints-opportunities',
    label: 'Constraints & Opportunities',
    description: 'Map what your material situation makes available. For stuck work, works in progress, or any time intent and material are fighting each other.',
    subModes: [
      { id: 'co-painting',     label: 'Painting' },
      { id: 'co-mixed-media',  label: 'Mixed Media' },
      { id: 'co-works-paper',  label: 'Works on Paper' },
      { id: 'co-digital',      label: 'Digital' },
      { id: 'co-3d',           label: '3D / Sculptural' },
      { id: 'co-other',        label: 'Other / Specify',
        description: 'Describe the medium in the Current State field.' },
    ],
    fields: [
      { id: 'dimensions',        label: 'Dimensions' },
      { id: 'substrate',         label: 'Substrate (canvas, panel, paper, etc.)' },
      { id: 'medium',            label: 'Medium (oil, acrylic, watercolor, etc.)' },
      { id: 'stage',             label: 'Stage (early / mid / late / abandoned)' },
      { id: 'intent',            label: 'Stated Intent — or write "stuck" or "none"' },
      { id: 'hard-constraints',  label: 'Hard Constraints (what cannot change)' },
      { id: 'current-state',     label: 'Current State Description' },
    ],

    prompts: [
      {
        id: 'co-constraint-map',
        label: 'Constraint Map',
        description: 'Catalog what your materials and situation make available — without judgment or advice.',
        prompt: `You are analyzing the constraint set of a work in progress using the Hidden Grammar framework.

Based on the materials, substrate, dimensions, medium interactions, and stated constraints provided,
systematically map what the 54 Principles make available, partially accessible, or blocked.

ORGANIZE your output by the 11 Roots. For each Root, identify:
- Which Principles are fully accessible given these constraints
- Which are partially constrained (accessible with workarounds or substitutions)
- Which are hard-blocked by the stated constraints (e.g., oil-over-water incompatibility, fixed dimensions)

NOTE any absolute material constraints as fixed facts — do not suggest overcoming them.
DO NOT offer improvement suggestions. Do not evaluate the choices. Just map the territory.

If an image of the work is provided, use the visual evidence to refine the constraint map —
identifying which Principles are currently active, which are dormant but available, and
where the material state is creating unresolved tension.`,
      },
      {
        id: 'co-opportunity-analysis',
        label: 'Opportunity Analysis',
        description: 'What opens up given your constraints? Three paths: hold intent, modify intent, release intent.',
        prompt: `You are analyzing the opportunities available within a stated constraint set, using the Hidden Grammar framework.

Based on the materials, stage, and stated intent provided, identify what is available to the maker
under three different stances toward intent:

1. INTENT HELD: Given the constraints and the stated intent, which unexplored Principles
   are currently available but not yet activated? What do they require materially?

2. INTENT MODIFIED: If the stated intent shifted slightly (without full abandon), what new
   territory opens up? Name the specific Principles that become accessible.

3. INTENT RELEASED: What does the current material state suggest entirely on its own terms,
   independent of the original goal? Which Roots are already active and where might they lead
   without a predetermined destination?

For each opportunity, name the specific Principle, describe what it would require materially,
and identify which constraint it works within (not around).

If an image is provided, ground all opportunities in the visual evidence already present.
Do not suggest improvements — describe what the material situation makes possible.`,
      },
      {
        id: 'co-stuck-reading',
        label: 'Stuck Reading',
        description: "Something isn't working. Read the current state for what it actually is — not what it was meant to be.",
        prompt: `You are conducting a stuck-work reading using the Hidden Grammar framework.

The maker has indicated this work is not coming together. Your task is to read the current
material state as it actually exists, not as it was intended to exist.

PROCEEDURE:
1. DESCRIBE only what is physically observable (or described in the context fields).
   Use the language register: "The image shows...", "Visible here...", "Present in the work..."

2. IDENTIFY which Root is currently dominant based on the visual evidence.

3. IDENTIFY which Root or Principle is creating resistance — what is fighting the dominant Root.

4. LOCATE the tension: where in the work (spatially, materially) is the conflict occurring?

5. NAME what the work is actually doing, separate from what was intended.
   This is descriptive, not prescriptive.

DO NOT suggest fixes. DO NOT evaluate whether the work is successful.
DO NOT reference what was intended unless asked to compare intended vs. actual.
The maker will use this reading to decide their next move — your job is to make the current
state as legible as possible, not to solve it.`,
      },
      {
        id: 'co-material-logic',
        label: 'Material Logic',
        description: 'What is the medium doing on its own? Where has the material made decisions the maker did not control?',
        prompt: `Analyze this work for material agency using the Hidden Grammar framework.

Focus on the Materiality and Tactile Execution roots. Examine the work for evidence of
where the medium has behaved independently of intention — where paint, substrate, or
process has made a decision the maker did not fully control.

IDENTIFY:
- Moments of material agency: where the medium directed the outcome
- Evidence of process: what the making sequence reveals about material behavior
- Uncontrolled vs. controlled marks: which Principles are activated by accident vs. intention
- The medium's contribution independent of the maker's hand

This is especially useful for oil paint behavior, watercolor blooms, acrylic skin,
transfer accidents, or any process-based medium.

If an image is provided, use visual evidence of surface, edge quality, and mark character
to locate material decisions. If text description only, reason from the medium's known behaviors.

Do not evaluate whether material agency is desirable. Describe what it produces.`,
      },
    ],
  },

];

