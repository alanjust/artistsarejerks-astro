// ─────────────────────────────────────────────────────────────────────────────
// Art Lab Toolkit — Modes by Use-Case Bucket
// src/data/toolkit-modes.js
//
// Organizes all modes by what a visitor is trying to DO,
// not by the system's internal phase logic.
//
// STATUS:
//   live        = In analysisModes.js, functional in the AI tool right now
//   documented  = Full prompt written, not yet wired into AI tool
//   coming-soon = Planned, stub or gap in source docs
//
// LINK BEHAVIOR:
//   live modes link to /hidden-grammar/ai-analyze (the AI tool)
//   all others link to /hidden-grammar/toolkit/[id] (detail page)
//
// ─────────────────────────────────────────────────────────────────────────────

export const toolkitBuckets = [

  // ──────────────────────────────────────────
  // BUCKET 1: MAKING
  // ──────────────────────────────────────────
  {
    id: 'making',
    label: "I'm making something",
    description: "Mid-process tools. Something's off, you're stuck, or you want to push the work further without polishing it into safety.",
    modes: [
      {
        id: 'intuition-primer',
        label: 'Intuition Primer',
        tagline: "You're chasing a feeling. This keeps the logic from killing it before it's ready.",
        status: 'coming-soon',
        phase: 'Discovery',
        detail: {
          what: "For early-stage work that isn't defined yet. Analyzes what the piece is actually doing without imposing a framework on a fragile idea.",
          when: ["The work feels right but you can't say why", "You don't want critique yet — just a read", "You're in exploration mode, not refinement mode"],
          output: "What it's optimizing for. Three next moves that push further without polishing. Identification of the 'awkwardness' worth protecting.",
          constraints: null,
        }
      },
      {
        id: 'wip',
        label: 'Work in Progress',
        tagline: "Mid-stream check. Does what you're executing match what you set out to do?",
        status: 'coming-soon',
        phase: 'Studio Tools',
        detail: {
          what: "Compares your visual execution (what's on the canvas) against your intent (what you were going for). Finds the gap without telling you what to feel about it.",
          when: ["You're partway through and something feels off", "You've lost the thread of what you were after", "You want a diagnostic, not a verdict"],
          output: "Alignment assessment. Conflicting signals named. Three refinement questions to solve the problem yourself.",
          constraints: null,
        }
      },
      {
        id: 'technician',
        label: 'Technician Mode',
        tagline: "You know what you want the work to do. This finds the specific tool that does it.",
        status: 'coming-soon',
        phase: 'Studio Tools',
        detail: {
          what: "Targeted. You name the effect you're after, the mode finds two specific Art Principles that create it and explains the neural mechanism behind each.",
          when: ["You have a specific goal — more tension, more depth, more stillness", "You want a precise intervention, not a comprehensive critique", "You're solving a single problem"],
          output: "Two specific Art Principles. The neural mechanism that makes each one work. No extra commentary.",
          constraints: "Only mode where Root → Principle mapping is used without RAP.",
        }
      },
      {
        id: 'blueprint',
        label: 'Blueprint Mode',
        tagline: "Can't visualize it yet? This converts intention into a set of hard rules you execute.",
        status: 'coming-soon',
        phase: 'Studio Tools',
        detail: {
          what: "Planning tool for work that doesn't exist yet. Converts your concept into a Flight Path (eye movement sequence), material logic, and three hard rules to follow during execution. The rules replace the mental image.",
          when: ["You're starting something new and need structure before touching the surface", "You think in systems rather than pictures", "You want to make decisions before you're holding the brush"],
          output: "A Flight Path. Material friction and tactility description. Three hard rules to execute against.",
          constraints: null,
        }
      },
      {
        id: 'attention-engineering',
        label: 'Attention Engineering',
        tagline: "Where does the eye lock? Where does it slide? This tells you both — and how to change it.",
        status: 'coming-soon',
        phase: 'Studio Tools',
        note: "Also useful for analyzing someone else's work.",
        detail: {
          what: "Dwell-time focused analysis. Maps where viewer attention locks (snags) and where it glides past (slides). Identifies structural predictability and gives you concrete moves to create perceptual friction.",
          when: ["The work feels too easy — viewers get it in 3 seconds and move on", "You want to understand why something holds attention (or doesn't)", "You're past the encouragement phase and want structural truth"],
          output: "Novelty diagnosis (0–10). Dwell time map with snags and slides identified. Interest gaps named. Three to five friction engineering moves with trade-offs.",
          constraints: null,
        }
      },
      {
        id: 'chaos',
        label: 'Chaos Variable',
        tagline: "Breaks predictability by introducing a principle that shouldn't work — but does.",
        status: 'coming-soon',
        phase: 'Studio Tools',
        detail: {
          what: "Finds the dominant Root in your work and suggests an opposing Principle that creates productive tension without wrecking the piece.",
          when: ["The work is technically solid but feels flat or predictable", "You want to introduce risk without losing structural integrity", "You're too comfortable"],
          output: "Dominant Root identified. Logical Principle named. One opposing Chaos Move suggested with justification for why it breaks predictability without ruining the work.",
          constraints: null,
        }
      },
      {
        id: 'novelty-check',
        label: 'Novelty Check',
        tagline: "The cliché shield. Tells you where you're too close to something that already exists.",
        status: 'coming-soon',
        phase: 'Studio Tools',
        detail: {
          what: "Scans the work for similarity to known artists and common visual tropes. Scores novelty on a 1–10 scale. Suggests one move to break the similarity.",
          when: ["You suspect the work looks too much like someone else", "You want an honest read on how original the visual language actually is", "You're working in a well-worn territory"],
          output: "Master-tier similarity check. Cliché-tier check. Novelty score 1–10. One pivot move.",
          constraints: null,
        }
      },
    ]
  },


  // ──────────────────────────────────────────
  // BUCKET 2: ANALYZING
  // ──────────────────────────────────────────
  {
    id: 'analyzing',
    label: "I'm analyzing a work",
    description: "For finished work — yours or someone else's. Structured reads grounded in what's visually observable, not in what the art world has decided the work means.",
    modes: [
      {
        id: 'fine-art',
        label: 'Fine Art',
        tagline: "Painting, sculpture, photography, installation — full Hidden Grammar analysis.",
        status: 'live',
        phase: 'Core Analysis',
        link: '/hidden-grammar/ai-analyze',
        detail: {
          what: "Comprehensive analysis of fine art across five analytical angles: full audit, work in progress, materiality and surface, spatial structure, and historical positioning.",
          when: ["Finished paintings, sculptures, works on paper, photography, installation", "Master studies", "Art history research"],
          output: "Structured analysis grounded in visual evidence. Observations mapped to perceptual mechanisms. Interpretation held as hypothesis, not verdict.",
          constraints: "RAP enforced. Interpretation locked until Evidence Gate passes.",
        }
      },
      {
        id: 'cpg',
        label: 'Consumer Packaged Goods',
        tagline: "Packaging and product design — shelf performance, brand differentiation, demographic signals.",
        status: 'live',
        phase: 'Core Analysis',
        link: '/hidden-grammar/ai-analyze',
        detail: {
          what: "Analysis of packaging design across four angles: shelf performance, brand differentiation, demographic alignment, and design in progress.",
          when: ["Retail packaging", "Product design", "Brand visual identity"],
          output: "Signal strength analysis. Differentiation from category conventions. Demographic cue identification.",
          constraints: "Artist identity not relevant. Framework adapted for commercial context.",
        }
      },
      {
        id: 'comic-book',
        label: 'Comic Book & Sequential Art',
        tagline: "Panel structure, page flow, visual storytelling grammar — analyzed as a sequential system.",
        status: 'live',
        phase: 'Core Analysis',
        link: '/hidden-grammar/ai-analyze',
        detail: {
          what: "Hidden Grammar analysis adapted for sequential art. Covers comprehensive analysis, WIP, audience assessment, style classification, and market context.",
          when: ["American superhero, manga, independent, children's, webcomic formats", "Sequential storytelling analysis", "Audience and market positioning"],
          output: "Panel composition, page flow, narrative grammar analyzed. Eye movement, closure, and figure-ground mapped.",
          constraints: "Story quality not assessed. Visual mechanisms only.",
        }
      },
      {
        id: 'commercial-illustration',
        label: 'Commercial Illustration',
        tagline: "Editorial, advertising, book covers, character design — analyzed in its commercial context.",
        status: 'live',
        phase: 'Core Analysis',
        link: '/hidden-grammar/ai-analyze',
        detail: {
          what: "Analysis of commercial illustration across five angles: comprehensive, WIP, communication clarity, audience signals, and character design.",
          when: ["Editorial illustration", "Advertising campaigns", "Book covers, children's books", "Character design"],
          output: "Signal strength, visual hierarchy, and communication clarity analyzed within the reproduction context.",
          constraints: "Merit not assessed independently of function.",
        }
      },
      {
        id: 'physics',
        label: 'Physics Mode',
        tagline: "Structural integrity only. No interpretation. Gravity, entropy, material, capacity — pass or fail.",
        status: 'coming-soon',
        phase: 'Core Analysis',
        detail: {
          what: "Tests the structural mechanics of a work while ignoring meaning entirely. Five checks in sequence: gravity (weight distribution), entropy (signal cancellation), material (medium honesty), capacity (idea vs. format fit), verdict.",
          when: ["You want structural truth without interpretation", "Technical validation of a finished work", "Something's off and you can't name it"],
          output: "Five-check diagnostic. Binary verdict: PASS or FAIL. One sentence naming the primary structural reason.",
          constraints: "No meaning claims. No Root or Pole language. Partial RAP enforced.",
        }
      },
      {
        id: 'historian',
        label: 'Historian Mode',
        tagline: "Academic breakdown. Where does this sit in the lineage of art history?",
        status: 'coming-soon',
        phase: 'Core Analysis',
        detail: {
          what: "Full analytical breakdown for finished works. Maps visual mechanics, identifies absences, synthesizes tensions, and locates the work within art historical context.",
          when: ["Master studies", "Art history analysis", "Canon positioning"],
          output: "Action classification. Principle mapping to Roots. Absence analysis. Historical lineage placement.",
          constraints: "Full RAP required.",
        }
      },
      {
        id: 'friction-audit',
        label: 'Friction Audit',
        tagline: "The Twombly vs. Kinkade test. How much does this work demand from the viewer?",
        status: 'coming-soon',
        phase: 'Core Analysis',
        detail: {
          what: "Tests how hard the work makes the viewer work. The Slide Test finds where the eye glides without resistance (Kinkade risk). The Snag Test finds where cognitive dissonance creates a freeze response (Twombly factor). Scores friction density 0–10.",
          when: ["Assessing transmission risk", "Testing perceptual fluency", "Comparing a work to honest vs. dishonest practitioners"],
          output: "Slide test result. Snag test result. Canon proxy comparison. Friction density score 0–10.",
          constraints: null,
        }
      },
      {
        id: 'attention-engineering-analyzing',
        label: 'Attention Engineering',
        tagline: "Dwell time map. Where does attention live and die in this work?",
        status: 'coming-soon',
        phase: 'Studio Tools',
        note: "Also useful mid-process on your own work.",
        detail: {
          what: "Same tool as in the Making section. Works equally well on finished work by others — maps where viewer attention locks and slides, diagnoses structural predictability, and identifies friction engineering opportunities.",
          when: ["Analyzing a work you didn't make", "Understanding why a piece does or doesn't hold attention", "Comparative analysis"],
          output: "Novelty diagnosis. Dwell time map. Interest gaps. Friction engineering moves.",
          constraints: null,
        }
      },
      {
        id: 'full-audit',
        label: 'Full Hidden Grammar Audit',
        tagline: "The comprehensive scan. All six sections, strict gates, maximum rigor.",
        status: 'coming-soon',
        phase: 'System Debug',
        detail: {
          what: "Complete Hidden Grammar audit using the full six-section template. Intake, evidence capture, principle mapping, checks, root claims, competing interpretations, verdict. Entropy gate and RAP gates strictly enforced.",
          when: ["Comprehensive formal documentation", "Maximum analytical rigor needed", "Research or professional contexts"],
          output: "All six sections populated. Raw observations separated from interpretation. Rule paths logged for every major claim.",
          constraints: "Entropy Gate: if dominant, audit stops before Root claims. Full RAP enforced. No numbered lists.",
        }
      },
    ]
  },


  // ──────────────────────────────────────────
  // BUCKET 3: TALKING
  // ──────────────────────────────────────────
  {
    id: 'talking',
    label: "I'm talking about art to other people",
    description: "For educators, docents, museum guides, teachers, and anyone who needs to make art accessible to people who didn't ask to be here.",
    modes: [
      {
        id: 'studio-foundations',
        label: 'Studio Foundations',
        tagline: "Beginner-friendly critique. Builds confidence while teaching how visual systems actually work.",
        status: 'coming-soon',
        phase: 'Studio Tools',
        detail: {
          what: "Educational critique mode for beginning students at any age. Uses a modified Feldman four-step structure with Hidden Grammar's mechanism-based approach. Strengths first. Evidence-based praise. Multiple growth pathways, never one correct answer.",
          when: ["High school or college art students", "Adult beginners at any age", "First-year foundational critique", "Anyone who needs encouragement without softness"],
          output: "Description (what's present). Analysis (how it's organized). Interpretation (framed as hypothesis). Growth path with three options, not one answer.",
          constraints: "No Hebrew terms. Partial RAP enforced. National Core Arts Standards and Feldman four-step integrated.",
        }
      },
      {
        id: 'tour-guide',
        label: 'Tour Guide Mode',
        tagline: "Museum docent script. Gets a general audience from first glance to genuine looking.",
        status: 'coming-soon',
        phase: 'Simulation & Context',
        detail: {
          what: "Generates a structured docent script bridging perceptual mechanics to general audiences. Warm, curiosity-led, structurally grounded. Designed specifically for the Schneider Museum of Art context but adaptable anywhere.",
          when: ["Museum tours", "Gallery talks", "Any public presentation of a single work"],
          output: "The Doorway (visual hook). Painter's Insight (technical decision non-painters would miss). Reflective Pause. Human Connection (Root translated to universal experience, held as hypothesis). Open Question that returns visitors to their own attention.",
          constraints: "Full RAP required. No Hebrew terms. Max two Roots. Meaning held as hypothesis throughout.",
        }
      },
      {
        id: 'docent-script',
        label: 'Docent Script (Anchor)',
        tagline: "4–6 minute spoken monologue for an anchor artwork in a larger exhibition tour.",
        status: 'coming-soon',
        phase: 'Simulation & Context',
        detail: {
          what: "Generates a complete 4–6 minute docent-ready monologue for a single anchor work. Structured in six sections: opening position, capture mechanics, default pattern recognition, meaning alignment, sustained look, editing insight.",
          when: ["Exhibition tours with a key anchor work", "Public speaking preparation", "Written educational scripts"],
          output: "Six-section spoken script. Declarative, observational voice. Artist statement translated into perceptual mechanics, not summarized.",
          constraints: "Full RAP required. Do not summarize the artist statement — translate it.",
        }
      },
      {
        id: 'curator',
        label: 'Curator Mode',
        tagline: "Writes 150-word exhibition wall text using Root logic translated into plain English.",
        status: 'coming-soon',
        phase: 'Simulation & Context',
        detail: {
          what: "Writes exhibition label copy for a general audience. Uses Hidden Grammar Root logic as the structural basis but translates every term into accessible language.",
          when: ["Exhibition labels and wall text", "Artist statements for public contexts", "Gallery documentation"],
          output: "150-word wall text. Root logic embedded, not visible. Absence of a key Root used as the structural focal point.",
          constraints: "No Hebrew terms. No framework jargon. Plain English only.",
        }
      },
      {
        id: 'global',
        label: 'Global Mode',
        tagline: "Breaks Western bias. Applies non-Western analytical frameworks to the same visual evidence.",
        status: 'coming-soon',
        phase: 'Simulation & Context',
        detail: {
          what: "Analyzes the same work through non-Western lenses from the Global Echoes database. Tests Ruach vs. Qi (energy), Wabi-Sabi vs. Yotzer (texture), Ma vs. linear perspective (space), Hózhó vs. signal (goal), institutional vs. ancestral authority.",
          when: ["Cross-cultural analysis", "Decolonial interpretation", "Exposing Western assumptions in a work"],
          output: "Five lens comparisons. Synthesis of how changing the analytical frame changes meaning.",
          constraints: "Full RAP required.",
        }
      },
    ]
  },


  // ──────────────────────────────────────────
  // BUCKET 4: STRESS TESTING
  // ──────────────────────────────────────────
  {
    id: 'stress-testing',
    label: "I want to stress-test an idea",
    description: "Philosophical and critical frameworks applied as overlays. Swap the analytical brain, not the image. Each lens reframes the same visual evidence through a specific theoretical model.",
    modes: [
      {
        id: 'lens-ooo',
        label: 'Object-Oriented Ontology',
        tagline: "Does this work have a secret life, or does it only exist for the viewer?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Ontological & Philosophical',
        detail: {
          what: "Based on Graham Harman and Timothy Morton. Treats the artwork as an autonomous object apart from perception. Tests what 'withdraws' or refuses to be understood. Applies flat ontology — no element is privileged over any other.",
          when: ["Testing object autonomy", "Questioning viewer-centric readings", "Exploring what a work does when no one is looking"],
          output: "What withdraws. What flat ontology reveals. Verdict: secret life or viewer-dependent object.",
          constraints: null,
        }
      },
      {
        id: 'lens-phenomenology',
        label: 'Phenomenological',
        tagline: "Is this an intellectual puzzle or a physical event?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Ontological & Philosophical',
        detail: {
          what: "Based on Merleau-Ponty's Phenomenology of Perception. Ignores the image and focuses on the embodied encounter — how the work acts on the nervous system before cognitive labeling. Describes sensation before categorization.",
          when: ["Testing embodied response", "Aligning with 'senses first' analysis", "Pre-objective encounter with a work"],
          output: "Embodied encounter description. Pre-objective sensation. Verdict: intellectual puzzle or physical event.",
          constraints: null,
        }
      },
      {
        id: 'lens-deconstruction',
        label: 'Deconstructionist',
        tagline: "Does the work hold together, or does it unravel its own authority?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Ontological & Philosophical',
        detail: {
          what: "Based on Derrida. Finds the internal contradiction where the work's logic falls apart. Identifies what's present only by its absence — what the artist erased or avoided.",
          when: ["Testing internal coherence", "Finding the work's blind spot", "Deconstructing authority claims"],
          output: "The aporia. The trace. Verdict: holds together or unravels.",
          constraints: null,
        }
      },
      {
        id: 'lens-new-materialism',
        label: 'New Materialist',
        tagline: "Is the artist a dictator of form, or a collaborator with the material?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Ontological & Philosophical',
        detail: {
          what: "Based on Jane Bennett's Vibrant Matter. Looks at paint, medium, and substrate not as tools but as active participants. Identifies where the material made a decision the artist didn't control.",
          when: ["Analyzing material-heavy work", "Testing maker-material relationships", "Process-based or gestural work"],
          output: "Material agency moments identified. Verdict: dictator or collaborator.",
          constraints: null,
        }
      },
      {
        id: 'lens-semiotics',
        label: 'Semiotic',
        tagline: "Is this a readerly text (passive) or a writerly text (requires you to build the meaning)?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Ontological & Philosophical',
        detail: {
          what: "Based on Roland Barthes. Separates marks (signifiers) from meaning (signified). Identifies where they detach. Applies Death of the Author — ignores intent and reads the cultural code of the image on its own.",
          when: ["Testing meaning-making structure", "Analyzing works with strong cultural coding", "Testing viewer participation in meaning"],
          output: "Signifier/signified map. Where they detach. Verdict: readerly or writerly text.",
          constraints: null,
        }
      },
      {
        id: 'lens-yau',
        label: 'John Yau Lens',
        tagline: "Is this work brave enough to be awkward?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Specific Critics',
        detail: {
          what: "Applies John Yau's critical voice. Rejects canonical and formalist readings. Searches for the weird, the hybrid, the distinct material sensitivity. Looks for the 'slur' or 'glitch' in the paint.",
          when: ["Outsider and hybrid work", "Testing resistance to standard narratives", "Work that exists outside institutional categories"],
          output: "Resistance to canonical narrative. The glitch or slur named. Verdict: brave enough to be awkward.",
          constraints: null,
        }
      },
      {
        id: 'lens-saltz',
        label: 'Jerry Saltz Lens',
        tagline: "Does this painting have heat? Is it alive or dead?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Specific Critics',
        detail: {
          what: "Applies Jerry Saltz's critical voice. Radical subjectivity, vulnerability, energy. Non-academic, high-energy language. Tests whether the work has visceral presence.",
          when: ["Gut-check analysis", "Testing raw energy and presence", "When you want a voice that doesn't hedge"],
          output: "Energy assessment. Honest, messy read. Verdict: alive or dead.",
          constraints: null,
        }
      },
      {
        id: 'lens-greenberg',
        label: 'Clement Greenberg Lens',
        tagline: "Is the painting honest about being a flat surface covered in pigment, or is it lying?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Specific Critics',
        detail: {
          what: "Applies High Modernist Formalism. Tests flatness and medium specificity. Attacks any attempt at illusion, narrative, or theatricality.",
          when: ["Abstract painting analysis", "Testing medium honesty", "Modernist context"],
          output: "Flatness assessment. Illusionism critique. Verdict: honest or lying.",
          constraints: null,
        }
      },
      {
        id: 'lens-institutional',
        label: 'Institutional Critique',
        tagline: "Is this work disrupting the institution or decorating it?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Cultural & Social',
        detail: {
          what: "Tests how the work relies on the white cube gallery to function. Asks who the painting is for and who is excluded by its visual language.",
          when: ["Gallery and museum context analysis", "Testing institutional dependency", "Power and access questions"],
          output: "Context dependency analysis. Inclusion/exclusion map. Verdict: disrupting or decorating.",
          constraints: null,
        }
      },
      {
        id: 'lens-postmodern',
        label: 'Postmodern',
        tagline: "Is this work acknowledging that everything has already been painted?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Cultural & Social',
        detail: {
          what: "Tests pastiche, irony, and sincerity. Identifies historical styles being sampled or remixed. Looks for the collapse of high and low culture.",
          when: ["Work that samples or remixes", "Testing ironic vs. sincere intent", "Postmodern positioning"],
          output: "Style samples identified. High/low collapse noted. Verdict: acknowledging or ignoring the already-painted.",
          constraints: null,
        }
      },
      {
        id: 'lens-ngai',
        label: 'Minor Emotions (Ngai)',
        tagline: "Is this Cute, Zany, or Interesting — and what does that mean for the attention economy?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Cultural & Social',
        detail: {
          what: "Based on Sianne Ngai's aesthetic categories. Instead of Beautiful or Sublime, tests Cute (invites domination), Zany (performance anxiety/labor), or Interesting (just distinct enough to circulate).",
          when: ["Contemporary and commercial work", "Testing late-capitalist aesthetic function", "Social media and circulation context"],
          output: "Category classification. Function in attention economy. Verdict: how it circulates.",
          constraints: null,
        }
      },
      {
        id: 'lens-metamodern',
        label: 'Metamodern',
        tagline: "Does it oscillate between irony and sincerity? Is it hopeful despite the data?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Cultural & Social',
        detail: {
          what: "Based on metamodernist theory. Tests whether the work swings between postmodern irony and modernist sincerity. Looks for 'informed naivety' — knowing it's hopeless but doing it anyway.",
          when: ["Contemporary work that defies simple categorization", "Testing emotional register", "Post-ironic or earnest contemporary work"],
          output: "Oscillation pattern. Sincerity/irony balance. Verdict: hopeful despite the data.",
          constraints: null,
        }
      },
      {
        id: 'lens-uncanny',
        label: 'Uncanny',
        tagline: "Does it trigger the creep reflex? Why?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Outliers & Stress Tests',
        detail: {
          what: "Based on Freud and Mori's Uncanny Valley. Identifies what is Heimlich (familiar) and how it has become Unheimlich (repressed/terrifying). Tests for the specific quality of wrongness.",
          when: ["Figurative work with unsettling quality", "Testing familiar-strange tension", "Work that triggers unease without obvious cause"],
          output: "Heimlich/Unheimlich mapping. Creep mechanism identified. Verdict: triggers the reflex and why.",
          constraints: null,
        }
      },
      {
        id: 'lens-slow-art',
        label: 'Slow Art',
        tagline: "Is this Fast Art (Instagram) or Slow Art — what appears only after three minutes?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Outliers & Stress Tests',
        detail: {
          what: "Based on Arden Reed's deceleration theory. Identifies the mechanism that prevents instant consumption. Tests what the work reveals only after sustained looking.",
          when: ["Testing temporal engagement", "Work that rewards patience", "Comparing immediate vs. deep response"],
          output: "Delay mechanism identified. What appears after three minutes. Verdict: fast or slow art.",
          constraints: null,
        }
      },
      {
        id: 'lens-neuro-archaeology',
        label: 'Neuro-Archaeology',
        tagline: "What was the biological state of the maker? The painting as fossil record.",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Outliers & Stress Tests',
        detail: {
          what: "Treats the painting as a fossil record of the artist's nervous system. Reconstructs the sequence of motor movements required to make the marks. Infers the biological state of the maker from the visual evidence.",
          when: ["Process-based and gestural work", "Connecting making to neuroscience", "Aligning with motor cognition research"],
          output: "Motor sequence reconstruction. Biological state inference. Verdict: what the nervous system was doing.",
          constraints: null,
        }
      },
      {
        id: 'lens-hauntology',
        label: 'Hauntology',
        tagline: "What lost future is this work mourning?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Cultural & Social',
        detail: {
          what: "Based on Mark Fisher's hauntology. Looks for the aesthetic of lost time and failed futures. Identifies the 'crackle' — outdated technology, nostalgia for what never happened.",
          when: ["Work with strong temporal resonance", "Retro or nostalgic visual language", "Work that feels haunted by something absent"],
          output: "Lost future identified. Crackle located. Verdict: nostalgia for a future that never happened.",
          constraints: null,
        }
      },
      {
        id: 'lens-biophilic',
        label: 'Biophilic',
        tagline: "Is it biologically soothing or biologically alerting?",
        status: 'coming-soon',
        phase: 'External Lenses',
        category: 'Outliers & Stress Tests',
        detail: {
          what: "Based on evolutionary aesthetics (Denis Dutton). Tests ancient survival preferences: open spaces, water, refuge, fractal dimension. Identifies whether the work mimics natural fractal patterns.",
          when: ["Landscape and nature-based work", "Testing primal aesthetic response", "Environmental and ecological art"],
          output: "Savannah preference mapping. Fractal dimension assessment. Verdict: soothing or alerting.",
          constraints: null,
        }
      },
    ]
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// FLAT INDEX — for detail page lookups by ID
// ─────────────────────────────────────────────────────────────────────────────

export const allModes = toolkitBuckets.flatMap(bucket =>
  bucket.modes.map(mode => ({
    ...mode,
    bucketId: bucket.id,
    bucketLabel: bucket.label,
  }))
);

export function getModeById(id) {
  return allModes.find(m => m.id === id) || null;
}
