# Hidden Grammar Art Analysis Tool - Web Implementation Assessment

**Date:** 2026-01-23
**Project:** Artists Are Jerks Astro Site
**Goal:** Transform Claude Project "Hidden Grammar Art Reviewer" into a web-based art analysis tool

---

## 1. SYSTEM OVERVIEW

### What the Hidden Grammar Tool Does

The Hidden Grammar system is a **structured art analysis framework** that:

- Analyzes artwork through **observable visual evidence** (not interpretation-first)
- Uses **11 Hebrew Roots** (Drivers) as analytical categories for how art functions
- Maps **54 Art Principles** (neural/perceptual mechanisms) to visible features
- Follows a **strict evidence-gating protocol** (RAP - Root Access Protocol) to prevent premature meaning collapse
- Generates **structured audit reports** documenting the analysis process
- Operates in multiple **modes** (Discovery, Historian, WIP, Technician, etc.) for different use cases

### Core Philosophy

**"Mechanism" over "Magic"** - Art is a discoverable code, not aesthetic vitalism. The system:
1. Observes concrete visual facts
2. Maps to perceptual/neural mechanisms
3. Only then infers meaning (as hypothesis, not verdict)

---

## 2. KEY COMPONENTS ANALYSIS

### A. Data Structures (JSON Candidates)

| Source File | Content Type | Web Conversion |
|-------------|--------------|----------------|
| `001_hidden_grammar_11_roots_v4_hardened.md` | 11 Drivers/Roots definitions | `src/data/hg-roots.json` |
| `002_hidden_grammar_4_poles_v1.md` | 4 Poles (Abstraction/Realism/Witness/Repair) | `src/data/hg-poles.json` |
| `046_art_principles.md` | 46 Art Principles with neural mechanisms | `src/data/hg-principles.json` |
| `006_global_lexicon.md` | Cross-cultural art concept translations | `src/data/hg-global-lexicon.json` |

### B. System Instructions (UI Logic)

| Source File | Content Type | Web Implementation |
|-------------|--------------|-------------------|
| `000_master_system_prompt_v2_4.md` | Core operating rules, voice guidelines | Component logic + help text |
| `000_prompt_console_v3_3.md` | 20+ analysis modes/commands | Interactive mode selector |
| `master_project_bible.md` | Framework overview, case studies | About/Documentation page |

### C. Templates (Interactive Forms)

| Source File | Content Type | Web Implementation |
|-------------|--------------|-------------------|
| `tpl_hg_audit_packet_art_v1.md` | Full structured audit template | Multi-step form with sections |
| `tpl_hg_new_audit_art.md` | Quick audit starter | Simple form variant |
| `interrogation_lenses.md` | Philosophical lenses/filters | Analysis filters/options |

### D. Reference Materials (Documentation)

| Source File | Content Type | Web Implementation |
|-------------|--------------|-------------------|
| `ref_feldman_4_step_critique.md` | Traditional art education framework | Reference docs |
| `ref_national_core_arts_glossary_visual_arts.md` | Standard art vocabulary | Glossary/lookup |
| `ref_visual_arts_standards.md` | Educational standards | Reference docs |

---

## 3. WEB APPLICATION ARCHITECTURE

### Recommended Page Structure

```
/hidden-grammar (Landing page)
├── /analyze (Main analysis interface)
│   ├── Mode selection
│   ├── Image upload
│   ├── Analysis form (dynamic based on mode)
│   └── Results display
├── /framework (Documentation)
│   ├── The 11 Roots
│   ├── The 4 Poles
│   ├── The 46 Principles
│   └── Global Lexicon
├── /examples (Case studies)
│   └── Pre-analyzed artworks
└── /about (Philosophy & methodology)
```

### Key Features Needed

#### 1. **Analysis Mode Selector**
- Dropdown/cards to choose analysis type:
  - Strategic (standard critique)
  - WIP (work in progress)
  - Historian (finished work)
  - Physics (structural check)
  - Friction Audit (Twombly vs Kinkade)
  - 15+ other modes from prompt console

#### 2. **Image Input**
- Upload artwork image
- Or paste URL
- Metadata capture (title, artist, medium, etc.)

#### 3. **Guided Analysis Form**
Based on selected mode, dynamic form sections:
- **Section 0:** Metadata
- **Section 1:** Raw Observations (no interpretation)
- **Section 2:** Principle Mapping (mechanisms)
- **Section 3:** Driver Analysis
- **Section 3.5:** Root Claims (RAP-gated)
- **Section 4:** Tensions & Absences
- **Section 5:** Friction Audit / Entropy Check
- **Section 6:** Synthesis & Verdict

#### 4. **Smart Assistance**
- Tooltips explaining each Root/Principle
- Examples of observations
- Validation warnings (e.g., "Have you completed the Evidence Gate?")
- Progressive disclosure (lock later sections until earlier ones complete)

#### 5. **Results Export**
- Formatted analysis report
- Markdown download
- PDF export option
- Shareable link

---

## 4. REQUIRED CONVERSIONS

### JSON Data Files to Create

#### `src/data/hg-roots.json`
```json
{
  "roots": [
    {
      "id": "ch-sh-v",
      "name": "Design Logic",
      "hebrew": "Ch-Sh-V",
      "subtitle": "THE MIND",
      "governs": "How a work constructs, organizes, and assigns value...",
      "function": "Design Logic accounts for the way visual elements...",
      "anchorCues": ["Clear hierarchy of forms", "Repetition with variation", ...],
      "notThis": ["Not intelligence", "Not depth", ...],
      "overreachRisk": "Often invoked whenever a work feels coherent...",
      "disproofTest": "Is there visible structural logic organizing the work?",
      "adjacentRoots": [
        {
          "root": "r-a-h",
          "overlap": "Both deal with perception",
          "difference": "The Eye governs where attention goes..."
        }
      ],
      "globalEcho": "In Ixtli In Yollotl (Face & Heart)",
      "activators": ["Principle #5 (Grouping)", "Principle #3 (Pattern Completion)"]
    },
    // ... 10 more roots
  ]
}
```

#### `src/data/hg-principles.json`
```json
{
  "principles": [
    {
      "id": 1,
      "name": "Edge Detection",
      "subtitle": "attention control",
      "tier": "A",
      "claimType": "Perceptual/attentional mechanism",
      "neuralFact": "Your V1 visual cortex fires hardest at high-contrast edges...",
      "studioTool": "Control attention by...",
      "examples": ["Sharp value shifts create focal points", ...],
      "relatedRoots": ["y-tz-r", "r-a-h"]
    },
    // ... 45 more principles
  ]
}
```

#### `src/data/hg-modes.json`
```json
{
  "modes": [
    {
      "id": "strategic",
      "name": "Strategic Mode",
      "phase": "Core Analysis",
      "description": "The Standard Critique. Connects the Image to the Master Project Bible.",
      "useCases": ["Finished work", "Master studies", "General analysis"],
      "prompt": "Analyze this image against the framework...",
      "sections": ["action", "stressTest", "mechanics", "verdict", "fix"],
      "requiredInputs": ["image", "title", "artist"],
      "outputFormat": "editorial-voice"
    },
    // ... 20+ more modes
  ]
}
```

#### `src/data/hg-audit-template.json`
```json
{
  "sections": [
    {
      "id": "0",
      "name": "Case Metadata",
      "fields": [
        {
          "name": "auditId",
          "type": "auto-generated",
          "format": "HG-YYYYMMDD-HHmmss"
        },
        {
          "name": "artworkTitle",
          "type": "text",
          "required": true
        },
        // ... more fields
      ]
    },
    // ... more sections
  ]
}
```

### Page Content Files

#### About/Framework Documentation
- Convert Markdown philosophy sections to Astro pages
- Keep original prose but make web-friendly
- Add navigation between concepts

---

## 5. TECHNICAL IMPLEMENTATION PLAN

### Phase 1: Data Layer (Week 1)
1. Create JSON conversion scripts
2. Parse all .md files into structured data
3. Validate data integrity
4. Create TypeScript types for all data structures

### Phase 2: Core Pages (Week 2)
1. `/hidden-grammar` landing page
2. `/hidden-grammar/framework` documentation hub
3. Individual pages for Roots, Poles, Principles
4. Global Lexicon reference

### Phase 3: Analysis Interface (Week 3-4)
1. Mode selector component
2. Image upload component
3. Dynamic form builder (renders based on mode)
4. Section-by-section form with validation
5. Evidence Gate logic (locks sections until prerequisites met)

### Phase 4: Results & Export (Week 5)
1. Analysis results display component
2. Markdown export
3. Print/PDF styling
4. Shareable link generation

### Phase 5: Polish & Testing (Week 6)
1. Help tooltips throughout
2. Example analyses
3. Mobile optimization
4. Accessibility audit

---

## 6. MINIMAL VIABLE PRODUCT (MVP)

### What to Build First

**Goal:** Get a working analysis tool with ONE mode operational

#### MVP Scope
1. **Single Mode:** Strategic Mode (the standard critique)
2. **Data:** 11 Roots + 46 Principles loaded
3. **Flow:**
   - Upload image
   - Fill out 6-section audit form
   - Get formatted results
   - Export as Markdown

#### MVP Files Needed
```
src/
├── data/
│   ├── hg-roots.json (converted from 001_hidden_grammar_11_roots)
│   ├── hg-principles.json (converted from 046_art_principles)
│   └── hg-modes.json (just Strategic mode)
├── pages/
│   └── hidden-grammar/
│       ├── index.astro (landing)
│       └── analyze.astro (analysis interface)
├── components/
│   ├── HGModeSelector.astro
│   ├── HGImageUpload.astro
│   ├── HGAuditForm.astro
│   └── HGResults.astro
└── styles/
    └── hidden-grammar.css
```

---

## 7. CONVERSION TASKS CHECKLIST

### Data Conversion
- [ ] Convert 11 Roots .md → JSON
- [ ] Convert 46 Principles .md → JSON
- [ ] Convert 4 Poles .md → JSON
- [ ] Convert Global Lexicon .md → JSON
- [ ] Convert 20+ Modes from Prompt Console → JSON
- [ ] Convert Audit Template .md → JSON schema

### Page Creation
- [ ] Landing page explaining Hidden Grammar
- [ ] Framework documentation hub
- [ ] Individual Root reference pages
- [ ] Principle catalog with search/filter
- [ ] About/Philosophy page

### Interactive Components
- [ ] Mode selector UI
- [ ] Image upload with preview
- [ ] Multi-section form builder
- [ ] Evidence Gate validation logic
- [ ] Root/Principle tooltip system
- [ ] Results formatter
- [ ] Export functionality

### Content Writing
- [ ] Adapt "Master Project Bible" for web intro
- [ ] Create user guide for analysis modes
- [ ] Write example analyses
- [ ] FAQ section

---

## 8. UNIQUE CHALLENGES

### 1. **Gated Logic System**
The RAP (Root Access Protocol) requires:
- Tracking Evidence Gate status
- Locking sections until prerequisites met
- Validating user hasn't jumped ahead
- Clear visual indicators of gates

**Solution:** State management + progressive disclosure UI

### 2. **Complex Terminology**
Hebrew roots, neuroaesthetics terms, philosophical concepts

**Solution:**
- Extensive tooltip system
- Glossary/lexicon lookup
- "Translate to English" toggle option
- Progressive complexity (hide advanced features initially)

### 3. **Multiple Analysis Modes**
20+ different modes with different workflows

**Solution:**
- Start with 1-2 modes for MVP
- Modular form system that adapts
- Clear mode selection with preview

### 4. **Structured vs. Freeform**
Some modes are strict audits, others are exploratory

**Solution:**
- Template-based for strict modes
- Guided prompts for exploratory modes
- Hybrid approach

---

## 9. QUESTIONS FOR YOU

1. **Which analysis mode do you use most?** (To prioritize for MVP)
2. **Do users need to save/revisit analyses?** (Requires database vs. export-only)
3. **Should analyses be public/shareable?** (Gallery of analyses?)
4. **Image source?** Upload only, or also URL/search integration?
5. **Target audience?**
   - Art students?
   - Artists (self-critique)?
   - Educators?
   - General public?
6. **Authentication needed?** Or fully open tool?

---

## 10. NEXT STEPS

### Immediate
1. **You:** Answer questions above
2. **Me:** Create first JSON conversion (11 Roots)
3. **Us:** Review converted data structure
4. **Me:** Build MVP landing page + one mode

### After MVP Working
1. Add remaining modes
2. Build documentation pages
3. Add example analyses
4. Polish UI/UX
5. Mobile optimization

---

## CONCLUSION

**The Hidden Grammar system is highly structured and well-documented** - perfect for web conversion. The main work is:

1. **Data transformation:** Markdown → JSON (mechanical, clear rules)
2. **UI design:** Multi-step forms with smart validation
3. **Documentation:** Adapt existing prose for web reading

**Estimated Complexity:** Medium
- Data conversion: Straightforward but extensive
- Form logic: Moderate complexity (gating system)
- UI: Challenging (many modes, tooltips, progressive disclosure)

**Recommended Approach:** Build incrementally
- Week 1: Data + simple documentation pages
- Week 2-3: MVP with Strategic mode
- Week 4+: Add modes, polish, examples

**Total Estimated Time:** 6-8 weeks for full-featured tool, 2-3 weeks for working MVP

---

Ready to proceed? Let me know which mode you want to start with and I'll begin converting the data files.
