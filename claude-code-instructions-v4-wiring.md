# Claude Code Instructions — Wire archaeological-v4.md into artifact.ts

**File to edit:** `src/pages/api/artifact.ts`
**Source file to read:** `corpus/displacement-library/archaeological-v4.md`

Two changes. Do them in order.

---

## Change 1 — Update tool_version

**Location:** Line 182

**Find this exact string:**
```
      'v3.1',
```

**Replace with:**
```
      'v4',
```

---

## Change 2 — Replace ARTIFACT_PROMPT content

This is the large change. The `ARTIFACT_PROMPT` function runs from line 276 to line 566. The function signature and its framing logic (lines 276–286) stay unchanged. The template literal content (lines 287–565) gets replaced.

**Step A — Read the v4 source block**

Open `corpus/displacement-library/archaeological-v4.md`. Extract everything from the line `### Step 0 — Ethical gate (before any analysis)` through the end of `### Step 6 — Vocabulary calibration` (the last line of the step is the sentence beginning "Do not use: painterly..."). Do not include anything above Step 0 (the header, version notes, "How to use this block" section) or below Step 6 (the refinement log, related corpus files section).

**Step B — Find the replacement target**

In `artifact.ts`, locate the ARTIFACT_PROMPT function. The template literal begins at the `return \`` on line 287 and closes with the backtick at the end of line 565. The content to replace is everything between those two backticks.

**Step C — Write the new template literal content**

The new content between the opening `return \`` and the closing backtick must be structured exactly as follows:

```
${audienceFrame}
${viewLine}
---

[INSERT v4 content here — Steps 0 through 6, extracted in Step A above]

---

RAP PROTOCOL — active for all interpretive claims:

No interpretation without observable evidence. State what you observe before stating what it means.

An interpretive claim requires at least two independent visual observations to support it. Before making any interpretive claim, name the specific observations that anchor it.

If an interpretive claim has fewer than two independent observable anchors, label it explicitly as a hypothesis: "Hypothesis (insufficient visual evidence): …" Do not present it as a reading or a probable interpretation. This applies to iconographic content, functional claims, and cultural attribution.

This protocol is strictest for: iconographic meaning claims, ritual function claims, cultural tradition attribution, and — in connections analysis — claims about relationships between this object's tradition and other cultures.

---

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

PERCEPTUAL PRINCIPLES REFERENCE: Where your analysis references a perceptual mechanism, use the exact name from either list and follow it immediately with a plain-English phrase explaining what it means in this specific context.

Universal perceptual principles: ${principleNames.join(', ')}

Artifact observation principles: ${artifactPrincipleNames.join(', ')}
```

**What this replaces:** Everything from the current `DISPLACEMENT — read before analyzing:` block (line 291) through the closing `REFERENCE CLASS` section (line 565), plus the current `STEP 0 — TRADITION IDENTIFICATION GATE` and `STEP 1 — IDENTIFY OBJECT CLASS` sections, and the current `SECTION A` through `SECTION G` content.

**What stays in place:** The function signature and audienceFrame/viewLine logic (lines 276–286). The RAP PROTOCOL and FORMAL OBSERVATIONS and PERCEPTUAL PRINCIPLES REFERENCE sections are preserved verbatim — they are not part of the v4 displacement block and must be kept.

---

## Verification

After making both changes:

1. Run `npm run build` — confirm no TypeScript errors
2. Confirm `tool_version` reads `'v4'` at line 182
3. Confirm the ARTIFACT_PROMPT now contains `### Step 2 — Object class and tradition identification` (the new consolidated routing step — this heading does not exist in v3.x and confirms the parallel tradition structure landed correctly)
4. Confirm `A-Mimbres` appears as a section heading in ARTIFACT_PROMPT (confirms parallel tradition subsection structure)
5. Confirm `A-AP` appears as a section heading (confirms non-Mimbres subsections present)
6. Confirm `STEP 0 — TRADITION IDENTIFICATION GATE` does NOT appear anywhere in ARTIFACT_PROMPT (the old bolted-on gate is gone)

---

## What this does NOT change

- Pass 1 prompts
- COMPETENCY_PROMPT
- CONNECTIONS_PROMPT
- EXTRACTION_PROMPT (tradition_routing_basis field already present — no change needed)
- buildArtifactContext function
- saveToD1 structure
- max_tokens values (Pass 2 is already at 5000)
- Pass 2 system prompt text (lines 860–861)
