import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import principlesData from '../../data/hg-principles.json';
import artifactPrinciplesData from '../../data/artifact-principles.json';

export const prerender = false;

// All Tier A — used in Pass 2 reference list
const PRINCIPLE_NAMES: string[] = (principlesData.principles as any[])
  .filter((p: any) => p.tier === 'A')
  .map((p: any) => p.name as string)
  .sort((a, b) => b.length - a.length);

// Tier A principles applicable to artifact observation (excludes fine-art-specific:
// Linear Perspective, Atmospheric Perspective, Light Source Logic, Common Fate,
// Elevation in Picture Plane, Binocular vs. Monocular Depth Cues)
const APPLICABLE_TIER_A_IDS = new Set([1, 2, 4, 5, 13, 15, 20, 28, 47, 48, 49, 51]);
const APPLICABLE_TIER_A_NAMES: string[] = (principlesData.principles as any[])
  .filter((p: any) => APPLICABLE_TIER_A_IDS.has(p.id))
  .map((p: any) => p.name as string)
  .sort((a, b) => b.length - a.length);

// Artifact-domain perceptual principles
const ARTIFACT_PRINCIPLE_NAMES: string[] = (artifactPrinciplesData.principles as any[])
  .map((p: any) => p.name as string)
  .sort((a, b) => b.length - a.length);

// Principle reference strings for the extraction prompt
const ARTIFACT_PRINCIPLE_REF = (artifactPrinciplesData.principles as any[])
  .map((p: any) => `${p.name} (id:${p.id})`)
  .join(', ');

const TIER_A_PRINCIPLE_REF = (principlesData.principles as any[])
  .filter((p: any) => APPLICABLE_TIER_A_IDS.has(p.id))
  .map((p: any) => `${p.name} (id:${p.id})`)
  .join(', ');

const EXTRACTION_PROMPT = (
  pass1: string,
  pass2: string,
  fields: Record<string, string>,
  mode: string
): string => {
  const meta = Object.entries(fields)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n') || 'None provided';

  const sectionsSchema = mode === 'artifact'
    ? `  "sections": [
    { "code": "A|B|C|D|E|F|G", "label": "<section label>", "summary": "<1-2 sentence summary>", "trade_materials": true, "kill_hole": null }
  ]`
    : `  "sections": []`;

  return `Extract structured data from this artifact analysis. Output ONLY valid JSON — no markdown fences, no extra text.

ARTIFACT METADATA:
${meta}

PASS 1 OBSERVATION:
${pass1}

PASS 2 ANALYSIS:
${pass2}

PRINCIPLE REFERENCE — use exact names and ids when populating principles_fired:
Artifact principles (type "artifact"): ${ARTIFACT_PRINCIPLE_REF}
Universal visual principles (type "universal_tier_a"): ${TIER_A_PRINCIPLE_REF}

For each principle in principles_fired, set weight as an integer: 1 = peripheral presence (noticed but not central), 2 = clearly operative (shapes the reading), 3 = dominant (central to what makes this object what it is). Default to 2 if uncertain.

Output this exact structure. Use only the enum values shown. Use null where genuinely unknown.

{
  "object_class_identified": "ceramic_vessel|carved_organic|composite|lithic|shell|fiber|other",
  "tradition_identified": "mimbres|hohokam|ancestral_puebloan|casas_grandes|salado|unknown",
  "tradition_confidence": "reading|hypothesis|indeterminate",
  "function_category": "domestic_utilitarian|serving_display|ritual_ceremonial|mortuary|indeterminate",
  "function_confidence": "reading|hypothesis|indeterminate",
  "production_level": "household|part_time_specialist|full_time_specialist|indeterminate",
  "temporal_note": "<string or null>",
  "principles_fired": [
    { "name": "<exact name from reference>", "id": 0, "type": "artifact|universal_tier_a", "pass": "pass1|pass2|both", "weight": 1, "observation": "<the specific observation phrase>" }
  ],
  "rap_flags": [
    { "claim_type": "tradition_attribution|iconographic_meaning|functional_claim|inter_tradition_relationship", "confidence": "reading|hypothesis", "claim": "<specific claim text>", "anchor_count": 0 }
  ],
${sectionsSchema}
}`;
};

function dataUrlToBuffer(dataUrl: string): { buffer: Uint8Array; contentType: string; ext: string } {
  const commaIdx = dataUrl.indexOf(',');
  const header   = dataUrl.slice(0, commaIdx);
  const base64   = dataUrl.slice(commaIdx + 1);
  const contentType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
  const extMap: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
  const ext    = extMap[contentType] || 'jpg';
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  return { buffer, contentType, ext };
}

async function saveToD1(
  db: any,
  fields: Record<string, string>,
  record: any,
  pass1: string,
  pass2: string,
  pass3: string,
  mode: string,
  audience: string,
  images?: Array<{ data: string; label: string }>,
  r2?: any
): Promise<number | null> {
  try {
    const objResult = await db.prepare(
      `INSERT INTO objects (object_name, accession_number, culture, period_label, material, dimensions, site, collection, source_institution, source_url, condition, research_context, field_notes, notes, object_class)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      fields.objectType        || 'Untitled',
      fields.accession         || null,
      fields.culture           || null,
      fields.period            || null,
      fields.material          || null,
      fields.dimensions        || null,
      fields.site              || null,
      fields.collection        || null,
      fields.sourceInstitution || null,
      fields.sourceUrl         || null,
      fields.condition         || null,
      fields.context           || null,
      fields.fieldNotes        || null,
      fields.notes             || null,
      record.object_class_identified || null
    ).run();

    const objectId = objResult.meta.last_row_id;

    // Upload images to R2 and record in images table
    if (r2 && Array.isArray(images) && images.length > 0) {
      const imageInserts: Array<{ key: string; label: string; isPrimary: boolean }> = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        try {
          const { buffer, contentType, ext } = dataUrlToBuffer(img.data);
          const safeLabel = (img.label || 'other').toLowerCase().replace(/[^a-z0-9]/g, '-');
          const key = `objects/${objectId}/${i}-${safeLabel}.${ext}`;
          await r2.put(key, buffer, { httpMetadata: { contentType } });
          imageInserts.push({ key, label: img.label || 'Other', isPrimary: i === 0 });
        } catch (imgErr) {
          console.error('[R2 upload]', imgErr);
        }
      }
      if (imageInserts.length > 0) {
        await db.batch(imageInserts.map((img) =>
          db.prepare(`INSERT INTO images (object_id, storage_url, view_label, is_primary) VALUES (?, ?, ?, ?)`)
            .bind(objectId, img.key, img.label, img.isPrimary ? 1 : 0)
        ));
      }
    }

    const analysisResult = await db.prepare(
      `INSERT INTO analyses (object_id, analysis_mode, audience, model_used, object_class_identified, tradition_identified, tradition_confidence, function_category, function_confidence, production_level, temporal_note, pass1_text, pass2_text, pass3_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      objectId,
      mode,
      audience || 'researcher',
      'claude-sonnet-4-6',
      record.object_class_identified || null,
      record.tradition_identified    || null,
      record.tradition_confidence    || 'indeterminate',
      record.function_category       || 'indeterminate',
      record.function_confidence     || 'indeterminate',
      record.production_level        || 'indeterminate',
      record.temporal_note           || null,
      pass1, pass2, pass3
    ).run();

    const analysisId = analysisResult.meta.last_row_id;

    if (Array.isArray(record.principles_fired) && record.principles_fired.length > 0) {
      await db.batch(record.principles_fired.map((pf: any) =>
        db.prepare(
          `INSERT INTO principle_firings (analysis_id, principle_name, principle_id, principle_type, fired_in_pass, weight, observation_text)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(analysisId, pf.name, pf.id || 0, pf.type || 'artifact', pf.pass || 'pass1', pf.weight || 2, pf.observation || null)
      ));
    }

    if (Array.isArray(record.rap_flags) && record.rap_flags.length > 0) {
      await db.batch(record.rap_flags.map((rf: any) =>
        db.prepare(
          `INSERT INTO rap_flags (analysis_id, claim_type, confidence, claim_text, anchor_count)
           VALUES (?, ?, ?, ?, ?)`
        ).bind(analysisId, rf.claim_type, rf.confidence, rf.claim || null, rf.anchor_count || 0)
      ));
    }

    if (mode === 'artifact' && Array.isArray(record.sections) && record.sections.length > 0) {
      await db.batch(record.sections.map((s: any) =>
        db.prepare(
          `INSERT INTO section_readings (analysis_id, section_code, section_label, summary_text, trade_materials_flagged, kill_hole_present)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          analysisId,
          s.code, s.label, s.summary || null,
          s.trade_materials ? 1 : 0,
          s.kill_hole === null || s.kill_hole === undefined ? null : (s.kill_hole ? 1 : 0)
        )
      ));
    }

    if (mode === 'connections') {
      await db.prepare(`INSERT INTO connections_records (analysis_id) VALUES (?)`).bind(analysisId).run();
    }

    return analysisId as number;
  } catch (err) {
    console.error('[D1] Save failed:', err);
    return null;
  }
}

const PASS1_PROMPT_SINGLE = (artifactPrincipleNames: string[], applicableTierANames: string[]) =>
  `Describe only what you can directly observe in this artifact image. Pure observation — no interpretation, no cultural attribution, no quality judgments.

Cover systematically:
- Overall form: what the object is, its general shape, orientation, and scale
- Surface features: every mark, line, texture, and irregularity — read these as production evidence, not just surface description
- Material boundaries: where one material or surface treatment ends and another begins
- Color zones: what colors are present and how they are distributed across the object
- Wear and condition: where surfaces appear more abraded, worn, polished, or eroded than others, and where they do not
- Evidence of attachment or joining: holes, channels, residue, binding marks, inset cavities, grooves
- Proportions: thickness, depth, wall relationships, scale relative to other features
- Anything incomplete, interrupted, or where a gap in the surface suggests something is absent

Be specific and granular. Work systematically across the object from one end to the other.

ARTIFACT PERCEPTUAL PRINCIPLES: When your observation corresponds to one of the following, use the exact name and follow it immediately with what you specifically observe:

${artifactPrincipleNames.join(', ')}

UNIVERSAL VISUAL PRINCIPLES: These apply to all artifact observation regardless of object type or domain. When your observation engages any of the following, use the exact name and follow it immediately with what you specifically observe:

${applicableTierANames.join(', ')}`;

const PASS1_PROMPT_MULTI = (count: number, artifactPrincipleNames: string[], applicableTierANames: string[]) =>
  `You are looking at ${count} images of the same artifact. Each image is labeled with its view. Work through each view in sequence, using the label as a header.

For each view, describe only what you can directly observe — pure observation, no interpretation, no cultural attribution, no quality judgments.

For each view cover: surface features visible from this angle (marks, lines, textures, irregularities read as production evidence), material boundaries, color zones and their distribution, wear and condition differential, evidence of attachment or joining, proportions and scale cues specific to this view.

After covering all views, note any features that are only visible — or that read differently — from specific views.

ARTIFACT PERCEPTUAL PRINCIPLES: When your observation corresponds to one of the following, use the exact name and follow it immediately with what you specifically observe:

${artifactPrincipleNames.join(', ')}

UNIVERSAL VISUAL PRINCIPLES: These apply to all artifact observation regardless of object type or domain. When your observation engages any of the following, use the exact name and follow it immediately with what you specifically observe:

${applicableTierANames.join(', ')}`;

const ARTIFACT_PROMPT = (pass1: string, principleNames: string[], artifactPrincipleNames: string[], audience: string, views: string[] = []) => {
  const audienceFrame = audience.includes('curator')
    ? `You are analyzing this artifact for a museum curator. Address: typological placement and what it establishes, condition and what it affects interpretively, cultural significance and what tradition this object represents, and what comparable documented examples exist. Use field vocabulary precisely.`
    : audience.includes('educator')
    ? `You are analyzing this artifact for an educator. Prioritize: what this object makes directly visible about production technique, cultural practice, or social organization — things a student can learn to see in other objects by looking carefully at this one.`
    : `You are analyzing this artifact for a researcher. Be precise, systematic, and evidence-grounded. Maintain explicit uncertainty where the image cannot resolve a question.`;

  const viewLine = views.length > 1
    ? `\nAVAILABLE VIEWS: ${views.join(', ')} — draw on all views in your analysis where relevant.\n`
    : '';

  return `${audienceFrame}
${viewLine}
---

DISPLACEMENT — read before analyzing:

Do not apply fine art critical frameworks. Do not assess this object for aesthetic merit, compositional tension, artistic achievement, or formal innovation. Do not use language from museum wall text, gallery criticism, or art market vocabulary. Do not use: painterly, aesthetic, artistic, composition as an evaluative term, or any language that treats this object as made for contemplation or display.

This object was made by people living within a specific cultural tradition, for purposes embedded in that tradition. Evaluate it against what it was made to do and what it tells us about the people who made it.

Do not apply Western individualist frameworks to production. The maker was working within strong cultural conventions. Variability within those conventions is social and cultural signal — not personal artistic expression.

Frame all interpretive claims as readings supported by specific visual evidence. Where meaning cannot be determined from the image, say so plainly. The people who made this object are gone; meaning cannot be fully recovered.

Seven evaluative frameworks will attach to Southwest archaeological material by default. All seven produce category errors. Suppress them before analysis begins.

**Framework 1 — Fine art critical vocabulary**

Do not use: tension, productive friction, sustained perceptual reward, painterly, compositional innovation, expressive line, or any vocabulary from Abstract Expressionism, Western formalism, or museum wall text.

*One exception with a strict technical meaning:* Brody uses "positive-negative ambiguity" as a specific technical term for the capacity of a Mimbres geometric composition to be read simultaneously as dark-on-light or light-on-dark — a property deliberately built into the system. This is not fine art ambiguity as a general virtue. Use it only with this technical meaning, only for Mimbres geometric design.

**Framework 2 — Innovation as a primary criterion**

Do not reward departure from convention, individual stylistic development, or formal invention. For Mimbres material specifically: "conscious striving for radical innovations or highly individualistic personal styles would have been unthinkable" (Brody). The evaluative achievement is mastery within a constraining system, not departure from it. A correct, well-executed traditional composition is a success by the tradition's own standards. A novel composition that breaks conventions is not automatically better.

**Framework 3 — Individual artistic genius / lone creator frame**

Do not attribute work to individual artists or read variation as personal expression. Quality in Mimbres production "was always related to group standards or social ideals" (Brody). The production unit was the community and its tradition — not the individual artist. Assess against community standards and tradition-level criteria. Variation within conventions is social signal, not personal statement.

**Framework 4 — The "decoration" frame**

Do not categorize painted designs as surface decoration or ornament added to an underlying functional form. They are iconographic programs — visual language with organizational logic and, in many cases, recoverable content. The decoration frame produces description of surface pattern. The visual language frame produces analysis of what is present, how it is organized, and what readings the evidence supports.

**Framework 5 — Western developmental narrative**

Do not apply a primitive-to-sophisticated developmental scale to the style sequence or across traditions. The Mimbres style sequence (I → II → III) reflects an internal logic — technical elaboration, introduction of new subjects within an existing formal framework — not progress toward a Western fine art endpoint. Early geometric work is not "primitive." Figurative work is not "developed." These are different phases of a tradition with its own coherence at each phase.

**Framework 6 — Studio craft / contemporary ceramics frame**

Do not apply studio pottery criticism values: individual voice, deliberate departure from tradition, material experimentation, visible process as virtue. Applied to Southwest archaeological ceramics, this frame reads use-wear as damage, tradition-conformance as lack of ambition, and the formal system's constraints as limitations to overcome. The correct frame: mastery within a constraining tradition is the aesthetic achievement.

**Framework 7 — Ethnographic curiosity frame**

Do not analyze primarily through cultural difference or treat the object as a window onto exotic practice. Evaluate against the tradition's own criteria first. Cultural context is secondary framing, not the primary analytical lens. The object was made by people who cared about making it well, within a tradition that had clear standards for what well meant.

For non-ceramic objects: do not default to ceramic analytical vocabulary. A carved wood effigy is not assessed for slip quality or paint type — it has its own evaluative criteria. Identify the object class first, then apply the matching criteria below.

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

---

EVALUATIVE FRAMEWORK:

## STEP 1 — IDENTIFY OBJECT CLASS

Before applying any criteria, state what kind of object this is:
- Ceramic vessel (bowl, olla, ladle, canteen, effigy vessel)
- Carved organic (wood, bone, or antler effigy, tool, ornament, ritual object)
- Composite object (multiple materials assembled: wood + fiber + stone + pigment)
- Lithic (knapped stone: point, scraper, biface; or ground stone: mano, metate, palette)
- Shell artifact (ornament, trumpet, inlay, pendant)
- Fiber / textile / basketry
- Other

Also identify: cultural tradition (Mimbres, Hohokam, Ancestral Puebloan, Casas Grandes, Salado, other/unknown) and provenience status (fully documented / partially documented / undocumented).

Then apply the criteria set for the identified object class below, followed by the cross-cutting criteria in Section G.

---

## SECTION A — CERAMIC VESSELS

*Apply when object class is: Ceramic vessel*

**Form and construction:** Describe rim diameter (estimate from proportions if not documented), depth, wall curvature, base form. Wall thickness consistency — even walls indicate skilled coil construction; variation signals production-stage issues. Coil-and-scrape evidence: oblique striations, coil junctures at breaks or thin spots. Paddle-and-anvil finishing (Hohokam primary method). What does construction evidence say about skill and tradition?

**Surface treatment and slip:** Slip quality and coverage (even, well-adhered vs. mottled, thin, peeling). Burnishing degree. Slip color: brilliant white (high kaolin, Mimbres) vs. buff/cream (Hohokam) vs. red (various).

**Paint:** Mineral paint (matte, permanent, iron-based) vs. carbon/organic paint (potentially shiny, may flake). Read line quality directly — single-stroke control, weight consistency, hesitation or correction marks. Brush discipline is readable from the line work.

**Design execution:** Symmetry precision, framing line integrity, compositional logic, hatching regularity. Does the design fill the field without crowding or misjudged scale?

**Iconographic program:** Describe before interpreting. Figure type, field organization (quartered, halved, continuous border, central medallion), figurative vs. geometric, narrative vs. emblematic. Composite figures. Corpus parallels. What the evidence supports vs. what remains uncertain.

**Kill hole (Mimbres burial ceramics only):** Present or absent. Location: centered vs. off-center. Method: punched vs. drilled. Placement relative to the image. Confirms burial context.

**Firing and condition:** Oxidizing (tan/orange exterior) vs. reducing (gray/black) atmosphere. Fire clouds: minor (normal) vs. severe. Post-depositional damage vs. use wear vs. ancient repair vs. modern restoration.

**Ceramic tradition placement:** Based on paste, temper, slip, paint, and design conventions — place in regional typology: Mimbres, Hohokam, Ancestral Puebloan, Casas Grandes, Salado, or trade ware. Trade wares indicate exchange events.

---

## SECTION B — CARVED ORGANIC OBJECTS (Wood, Bone, Antler)

*Apply when object class is: Carved organic*

**Material identification:** Wood (grain visible, light weight, checking/splitting susceptibility), bone (dense, smooth, cancellous interior at breaks), antler (external texture, branching structure). Material choice is a cultural production decision — cottonwood root, pine, and willow carry different working properties and cultural associations.

**Construction method:** Subtractive carving (material removed from a blank) vs. additive construction (separate elements joined). Look for: tool marks, gouge traces, surface irregularities from hand carving. Join evidence — pegs, adhesive residue, binding marks — indicates additive construction.

**Form analysis:** Overall body form and its referent (animal, human, geometric). Anatomical differentiation: how are body parts indicated — carved reduction, painted, inset? Proportions: schematic vs. naturalistic? Single-material or composite construction?

**Surface treatment and pigment:** Pigment as ground coat (full surface) vs. discrete painted elements over a ground. Color zone organization: does the pigment program follow anatomy, orientation, or a conventional scheme? Mineral pigments: ochre/limonite = yellow, hematite = red, malachite = green, charcoal = black, kaolin/gypsum = white. Note surface condition: checking (drying cracks), splitting, erosion of painted surfaces.

**Attached elements:** Fiber attachments (cord, bundles, wrappers) — material type, color(s), knot structure, location. Functional (securing elements, suspension) vs. purposive (fiber bundles, offerings, ritual binding)? Multi-color fiber bundles are composed, not random — dyeing signals intentional composition. Inset materials: turquoise, shell, stone — location, method of attachment. Insets at eye positions are conventional Southwest effigy markers.

**Preservation context:** Organic materials survive primarily in dry cave contexts. Preservation state (intact fiber, retained pigment, structural integrity) is evidence about depositional conditions.

---

## SECTION C — COMPOSITE OBJECTS (Multi-Material)

*Apply when object class is: Composite object*

**Material inventory:** List every material category present — substrate (wood, stone, shell), surface treatment (pigment, slip, incision), attached elements (fiber, feathers, inset stone). The combination of materials is itself an analytical object.

**Production sequence:** What was made first, what was added, what was attached last? Sequential production evidence (base object + later additions) vs. simultaneous assembly? Each addition is a separate production decision and procurement event.

**Material investment assessment:** Add up the procurement and production requirements: raw material acquisition (local vs. trade), processing (carving, pigment preparation, dyeing), assembly skill. Investment level indicates social position — household production vs. specialist production vs. high-investment ritual object.

**Compositional logic:** Is there an organizing principle behind material choices? Turquoise at eye positions is a Southwest convention. Color-coded pigments following anatomy are a deliberate choice. Multi-color fiber bundles are composed, not random. Look for the logic.

**Conventional vs. novel:** Does this material assemblage follow a recognizable convention (known effigy type, bundle type, ritual object category) or appear novel? Novel assemblages require more interpretive caution.

---

## SECTION D — LITHIC ARTIFACTS

*Apply when object class is: Lithic*

**Material type:** Obsidian (source-traceable by INAA or pXRF), chert, basalt, quartzite, sandstone. Non-local or visually distinctive stone may signal selection for cultural properties beyond function.

**Reduction technology:** Knapped — direct percussion, pressure flaking, biface thinning. Stage: primary flake (cortex present), secondary (cortex absent), formal tool (retouched). Hafting evidence: notches, stems, ground lateral edges. Ground stone — grinding facets, pecking surfaces, polish from use, residue staining.

**Formal type:** Place in regional typological sequence. Projectile point types are temporally diagnostic. Ground stone forms also constrain date and region.

**Use wear:** Edge damage patterns, polish from specific materials, residue staining, ground stone wear facets indicating motion direction.

**Ornamental vs. utilitarian:** Stone ornaments (pendants, beads, inlays) criteria: formal shaping beyond function, drilled suspension holes, polished surfaces, non-local material. Turquoise, jet, argillite are primarily ornamental/ritual.

---

## SECTION E — SHELL ARTIFACTS

*Apply when object class is: Shell artifact*

**Species identification:** Gulf of California species (Glycymeris, Conus, Olivella, Laevicardium) — primary Hohokam trade shell, ~300–500 km distance. Pacific coast — longer distance. Gulf of Mexico (Spondylus, Busycon) — very long distance. Identification from photographs is approximate; note visible morphological features.

**Manufacture evidence:** Raw vs. worked vs. finished. Stages: roughing out, shaping, perforation, finishing. Manufacturing debris indicates local production; finished pieces without debris indicate trade in finished objects.

**Ornament type:** Glycymeris bracelet (Hohokam — circular, cut from body whorl, umbo often carved into frog or snake effigy). Shell pendant (cut and drilled). Shell bead (cylindrical or disc-shaped, drilled). Shell inlay (cut thin, mosaic work). Shell trumpet (large gastropod, apex removed — Strombus, Turbinella — ritual use).

**Iconographic content on shell:** Carved figures on shell ornaments (Hohokam umbo effigies: frog, snake, lizard, human). Apply describe-before-interpret protocol.

---

## SECTION F — FIBER, TEXTILE, AND BASKETRY

*Apply when object class is: Fiber / textile / basketry*

**Construction technique:** Basketry — coiled (coil diameter, stitches per coil), plaited (plain, twill), twined. Textiles — plain weave, twill, tapestry, embroidery. Cordage — ply direction (Z or S twist), number of plies. Technique is tradition-diagnostic.

**Material:** Plant fiber (yucca, cotton, apocynum, agave), animal fiber (feathers, fur, human hair). Cotton in the Southwest requires cultivation or trade — its presence indicates agricultural communities or exchange.

**Dye evidence:** Natural color vs. dyed. Blue/green in prehistoric Southwest fiber is rare and significant — likely plant sources (larkspur, indigo) or mineral sources. Dyed fiber indicates intentional investment in color composition.

**Pattern and design:** Geometric patterns in basketry and textiles often parallel ceramic design conventions within a tradition. Does the pattern correspond to known regional conventions?

**Completeness and use wear:** Finished object or fragment? Wear patterns, repair, reweaving. Deliberately unfinished objects deposited as offerings are known from cache contexts.

---

## SECTION G — CROSS-CUTTING CRITERIA (All Object Classes)

**Provenience status:** Fully documented (site, stratum, feature/burial number, associated assemblage) vs. partially documented (site known, context uncertain) vs. undocumented (purchase history only). Undocumented provenience severely limits interpretive scope — state this clearly.

**Condition assessment:** Post-depositional damage vs. use wear vs. ancient repair vs. modern restoration. Ancient repairs indicate in-life value. Conservation treatment must be distinguished from original surface.

**Temporal placement:** Does the object fit a known typological sequence? Where the object is post-Classic (post-1150 CE in the Mimbres area, post-1300 CE more broadly), note it exists in a transformed social landscape following the reorganization events of the 12th–13th centuries.

**Function category:** Domestic/utilitarian | Serving/display | Ritual/ceremonial (non-utilitarian form, high material investment, turquoise/shell/feather elements, cave cache deposition, composite construction) | Mortuary (kill hole, burial association, funerary-specific forms) | Indeterminate (state this rather than forcing an assignment).

**Social position of production:** Household production vs. part-time specialist vs. full-time specialist. Evidence: standardization (specialist production produces measurable regularity), production debris (workshops leave characteristic waste), material investment level. Full-time specialization is the exception in the prehistoric Southwest and requires specific evidence.

---

IMAGE ANALYSIS CEILING — assess before drawing conclusions:

The evaluative framework above supports confident analysis of tradition, production mode, iconographic program, quality, and function category. The following are specific data types that image evidence cannot supply regardless of analytical skill.

**Image analysis can determine:** object class, approximate form and proportions, surface treatment, design program, style period, visible condition, cultural tradition, approximate temporal placement, probable function category, kill hole presence and method.

**Image analysis cannot determine without additional information:** actual dimensions (no scale reference = no reliable size data), wall thickness, temper type, paint chemistry (mineral vs. carbon), hardness.

**Image analysis cannot determine without provenience:** site association (style identifies tradition, not site), burial vs. non-burial context (kill hole confirms burial; its absence does not confirm non-burial), associated assemblage.

**Image analysis cannot determine regardless of image quality:** compositional source of raw materials (requires INAA/pXRF), absolute age (requires radiocarbon or TL dating), residue identity (requires organic residue analysis).

When analysis reaches the ceiling, say: *"Visible evidence suggests X. Confirmation would require [physical examination / laboratory analysis / provenience documentation]."* Do not hedge everything. State what the image shows with confidence where it is warranted. Mark the ceiling where it exists.

---

REFERENCE CLASS: Select the tradition-appropriate baseline.

For Classic Mimbres ceramics: Swarts Ruin collection (Peabody Museum) and NAN Ranch assemblage (Shafer 2003) are the primary comparison baseline. Brody's *Mimbres Painted Pottery* corpus is the comparison baseline for figurative imagery. Do not use unprovenanced market examples as reference points.

For Hohokam ceramics and shell: Snaketown assemblage (Haury 1976, Arizona State Museum). Glycymeris bracelet corpus at Arizona State Museum for shell ornament type identification.

For Ancestral Puebloan: Pueblo Bonito material for Chaco-affiliated contexts; Mesa Verde National Park collections for 13th-century assemblages.

For Casas Grandes / Paquimé: Minnis/Whalen 2015 synthesis and Centro INAH Chihuahua collections.

For carved organic objects: Southwest wood effigy tradition documented through dry cave assemblages across the Mogollon Highlands and Four Corners region; compare with documented cave cache material.

For post-Classic and Salado ceramics: Crown's *Ceramics and Ideology* (1994) for Salado Polychrome interpretation. Cordell's *Archaeology of the Southwest* (1997) for post-Classic regional context.`;
};

const COMPETENCY_PROMPT = (pass1: string, pass2: string, audience: string): string => {
  const audienceLine = audience
    ? `This analysis was prepared for: ${audience}.\n\n`
    : '';

  return `${audienceLine}An analysis of an archaeological artifact has been completed. Your job is to make the analytical moves explicit — to help the person who received this analysis build skills they can apply to other artifacts.

FORMAL OBSERVATIONS (PASS 1):
${pass1}

ANALYSIS (PASS 2):
${pass2}

---

Write two sections. Use these headers exactly:

## WAYS OF LOOKING

Identify 3–4 analytical habits this analysis demonstrated that apply to any artifact — not just this one. For each one, start with a specific moment from this analysis before naming the general habit. Calibrate to the person: if the audience is a researcher, frame around evidence and uncertainty; if a curator, around significance and context; if an educator, around what makes this a useful teaching object.

## WHAT THIS ARTIFACT MAKES VISIBLE

Identify 2–3 things this specific artifact made unusually clear — aspects of material culture, construction technique, or cultural practice that you can now recognize in other objects because you've looked carefully at this one. Open with what was concrete and specific in this artifact before naming the larger pattern.

Write for someone curious and smart who doesn't already speak the vocabulary. Open with something specific from this artifact before naming the principle. Jargon only when immediately followed by plain English. Total: 300–450 words.`;
};

const CONNECTIONS_PROMPT = (pass1: string, principleNames: string[], artifactPrincipleNames: string[], audience: string, views: string[] = []) => {
  const audienceFrame = audience.includes('curator')
    ? `You are analyzing this artifact's cultural connections for a museum curator. Address what tradition and period this object represents, what exchange networks it participated in, what comparable cultures were doing at the same time, and how this object connects to the broader cultural landscape. Use field vocabulary precisely.`
    : audience.includes('educator')
    ? `You are analyzing this artifact's cultural connections for an educator. Prioritize what this object makes visible about cultural interaction, trade, and shared meaning — things a student can use as a framework for thinking about any culture and its neighbors.`
    : `You are analyzing this artifact's cultural connections for a researcher. Be precise about evidence chains, flag where relationships are contested in the scholarly record, and maintain explicit uncertainty about indirect connections.`;

  const viewLine = views.length > 1
    ? `\nAVAILABLE VIEWS: ${views.join(', ')} — use all views to establish tradition, date range, and material indicators.\n`
    : '';

  return `${audienceFrame}
${viewLine}
---

DISPLACEMENT:

Do not apply fine art critical frameworks. This analysis is not about aesthetic achievement or artistic merit. Do not treat this as a culture survey loosely attached to an image. Start from what is specifically observable in this artifact — the tradition it belongs to, the date range it suggests, the materials it contains, the visual vocabulary it uses — and let those specifics anchor every connection you draw. The people who made this object are gone; meaning cannot be fully recovered. Frame all interpretive claims as readings supported by specific evidence, not settled conclusions.

---

RAP PROTOCOL — active for all interpretive claims:

No interpretation without observable evidence. State what you observe before stating what it means.

An interpretive claim requires at least two independent visual observations to support it. Before making any interpretive claim, name the specific observations that anchor it.

If an interpretive claim has fewer than two independent observable anchors, label it explicitly as a hypothesis: "Hypothesis (insufficient visual evidence): …" Do not present it as a reading or a probable interpretation. This applies to iconographic content, functional claims, and cultural attribution.

This protocol is strictest here — connections analysis radiates outward from a single object into broader cultural claims. Every claim about relationships between this object's tradition and other cultures must be anchored in at least two specific observable features of this artifact or documented material parallels. Claims with fewer than two anchors are labeled as hypotheses, not connections.

---

FORMAL OBSERVATIONS FROM PASS 1:
${pass1}

---

PERCEPTUAL PRINCIPLES REFERENCE: Where your analysis references a perceptual mechanism, use the exact name from either list and follow it immediately with a plain-English phrase explaining what it means in this specific context.

Universal perceptual principles: ${principleNames.join(', ')}

Artifact observation principles: ${artifactPrincipleNames.join(', ')}

---

CONNECTIONS ANALYSIS:

Use these five headers exactly. For each section, start from what is observable or identifiable in this specific artifact before expanding to what is known about the broader landscape.

## CULTURAL TRADITION AND MOMENT

Identify the cultural tradition this artifact belongs to and the date range it suggests. This is the anchor for everything that follows. State what observable evidence — construction technique, surface treatment, design vocabulary, material — supports the tradition identification. Where tradition cannot be identified with confidence, work with probabilities and say so.

What was happening in this tradition at this time? What was the social landscape — large aggregated communities or dispersed, stable or in transition, actively exchanging or relatively isolated?

## EXCHANGE AND MATERIAL NETWORKS

What materials in this object came from outside the local area? What do those materials imply about exchange relationships? What direction did goods move, and what moved in return?

For the Southwest: turquoise presence implies exchange participation (specific source requires INAA/pXRF — cannot be determined visually). Shell species indicate trade distance and direction. Copper indicates long-distance contact. Non-local ceramic types in an assemblage mark exchange events.

Who were this tradition's documented trading partners at this period? What goods moved through these networks?

## CONTEMPORANEOUS CULTURES

Who else was active in the Southwest during this period? For each contemporaneous tradition, briefly address: what were they doing at this time, how did they relate to the tradition that produced this object (trading partners, largely separate, connected through shared ideological networks), and what material evidence marks the relationship?

Keep the framing evidence-grounded. Relationships documented in the scholarly record differ from relationships that are plausible but unconfirmed — maintain that distinction.

## AESTHETIC AND ICONOGRAPHIC PARALLELS

What visual vocabulary does this object share with neighboring or contemporaneous traditions? What motifs, design conventions, or formal approaches appear across multiple Southwest traditions? What is distinctive to this tradition rather than shared?

Where relevant, draw on Polly Schaafsma's documentation of pan-Southwest iconographic continuity — the same motifs (horned serpent, mountain lion, rain/cloud imagery, warrior/shield figures) appear across Hohokam, Mimbres, Ancestral Puebloan, and Casas Grandes contexts. Where the iconography on this object connects to that shared vocabulary, identify it. Where it appears tradition-specific, note that distinction.

## TRAJECTORY

What did this tradition grow from? What preceded it and what relationship does this object's style suggest to earlier periods?

What came after? If this tradition underwent a collapse or reorganization, describe the nature of that transition and what is known about what followed. If this object is from a post-Classic or transitional period, address what changed in the social landscape that produced it.

Where active scholarly debate exists — the nature of the Chaco system, the Mimbres collapse, Casas Grandes origins, Kachina cult emergence — name the debate and competing positions rather than asserting a single answer.`;
};

const CONNECTIONS_COMPETENCY_PROMPT = (pass1: string, pass2: string, audience: string): string => {
  const audienceLine = audience
    ? `This analysis was prepared for: ${audience}.\n\n`
    : '';

  return `${audienceLine}A cultural connections analysis of an archaeological artifact has been completed. Your job is to make the interpretive moves explicit — to help the reader understand how to read an artifact as evidence of a cultural world, not just as an isolated object.

FORMAL OBSERVATIONS (PASS 1):
${pass1}

CONNECTIONS ANALYSIS (PASS 2):
${pass2}

---

Write two sections. Use these headers exactly:

## CONNECTIONS MADE HERE

Identify 3–4 interpretive moves this analysis demonstrated that apply to thinking about any artifact in its cultural context. For each, start with a specific moment from this analysis before naming the general approach. How did observable features of the object become entry points into broader cultural knowledge?

## WHERE TO LOOK NEXT

Identify 2–3 specific threads this analysis opened that are worth pursuing further. For each, name what was identified, what's still uncertain or contested, and what kind of evidence — archaeological, comparative, compositional — would resolve it. Be specific about method, not just topic.

Write for someone curious and smart who doesn't already speak the vocabulary. Open with something specific from this artifact before naming the principle. Jargon only when immediately followed by plain English. Total: 300–450 words.`;
};

function buildArtifactContext(fields: Record<string, string>): string {
  const labels: Record<string, string> = {
    culture:    'Culture / People',
    period:     'Period / Date',
    objectType: 'Object Type',
    material:   'Material',
    dimensions: 'Dimensions',
    site:       'Site / Provenance',
    collection: 'Collection / Location',
    condition:  'Condition',
    context:    'Research Context',
    notes:      'Notes',
  };

  const lines = Object.entries(fields)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${labels[k] || k}: ${v}`);

  return lines.length > 0
    ? `ARTIFACT DOCUMENTATION:\n${lines.join('\n')}\n`
    : '';
}

interface ImageInput { data: string; label: string; }

interface ParsedImage {
  imageData: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  label: string;
}

function buildImageBlocks(parsed: ParsedImage[]) {
  return parsed.flatMap(img => [
    { type: 'text' as const, text: `[${img.label}]` },
    { type: 'image' as const, source: { type: 'base64' as const, media_type: img.mediaType, data: img.imageData } },
  ]);
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

  const { images, audience, fields = {}, mode = 'artifact' } = body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return new Response(JSON.stringify({ error: 'No images provided.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  let parsedImages: ParsedImage[];
  try {
    parsedImages = (images as ImageInput[]).map((img) => {
      const mediaType = img.data.split(';')[0].split(':')[1];
      if (!supportedTypes.includes(mediaType)) {
        throw new Error(`Unsupported image format: ${mediaType}. Please convert to JPEG or PNG and try again.`);
      }
      return {
        imageData: img.data.split(',')[1],
        mediaType: mediaType as ParsedImage['mediaType'],
        label: img.label || 'View',
      };
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const imageBlocks = buildImageBlocks(parsedImages);
  const imageCount = parsedImages.length;
  const viewLabels = parsedImages.map(img => img.label);
  const pass1Prompt = imageCount === 1
    ? PASS1_PROMPT_SINGLE(ARTIFACT_PRINCIPLE_NAMES, APPLICABLE_TIER_A_NAMES)
    : PASS1_PROMPT_MULTI(imageCount, ARTIFACT_PRINCIPLE_NAMES, APPLICABLE_TIER_A_NAMES);

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
          system: 'You are a trained artifact observer. Report only what is directly present and physically observable. Read surface features as production evidence. No interpretation, no cultural attribution, no quality judgments.',
          messages: [{
            role: 'user',
            content: [
              ...imageBlocks,
              { type: 'text', text: pass1Prompt },
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

        const isConnections = mode === 'connections';
        const audienceLower = (audience || '').toLowerCase();

        const statusMsg = isConnections
          ? 'Pass 2 — cultural connections…'
          : audienceLower.includes('curator')
          ? 'Pass 2 — curatorial analysis…'
          : audienceLower.includes('educator')
          ? 'Pass 2 — teaching context…'
          : 'Pass 2 — artifact analysis…';
        send({ type: 'status', message: statusMsg });

        const artifactContext = buildArtifactContext(fields);
        const pass2UserText = isConnections
          ? (artifactContext ? artifactContext + '\n---\n\n' : '') +
            CONNECTIONS_PROMPT(pass1Text, PRINCIPLE_NAMES, ARTIFACT_PRINCIPLE_NAMES, audience || '', viewLabels)
          : (artifactContext ? artifactContext + '\n---\n\n' : '') +
            ARTIFACT_PROMPT(pass1Text, PRINCIPLE_NAMES, ARTIFACT_PRINCIPLE_NAMES, audience || '', viewLabels);

        const pass2SystemPrompt = isConnections
          ? 'You are a specialist in Southwest archaeology and cultural interaction, with deep knowledge of exchange networks, contemporaneous traditions, and the broader prehistoric Southwest landscape — Mimbres/Mogollon, Hohokam, Ancestral Puebloan, Casas Grandes, and post-Classic traditions. Approach artifacts as entry points into cultural worlds: what does this object tell us about who made it, who they traded with, what they shared with neighboring peoples, and what world they inhabited. Draw on the scholarship of Linda Cordell (Southwest as mosaic of interacting traditions), Polly Schaafsma (pan-Southwest iconographic continuity), Kate Spielmann (exchange networks and craft production), Phil Weigand and Garman Harbottle (turquoise trade networks), and Patricia Crown (ideological spread through material culture). Start from what is observable in the object and expand only to what the scholarly record supports. Frame contested relationships as contested, not resolved.'
          : 'You are a specialist in Southwest archaeology and anthropological artifact analysis, with knowledge across the full Southwest tradition — Mimbres/Mogollon, Hohokam, Ancestral Puebloan, Casas Grandes, and post-Classic regional traditions. Apply the evaluative frameworks of J.J. Brody (formal and comparative iconographic analysis), Harry Shafer (production sequence and technological style as chaîne opératoire), Michelle Hegmon (material culture variability as social information), and Polly Schaafsma (iconographic continuity across traditions and media). Identify object class before applying criteria — ceramic analytical vocabulary does not apply to carved organic, composite, or shell objects. Do not apply fine art criticism, aesthetic vocabulary, or art market language. Use field vocabulary precisely: provenience not provenance, chaîne opératoire, kill hole, slip, mineral vs. carbon paint, technological style, taphonomy, cache vs. burial vs. midden. Be evidence-grounded and explicit about uncertainty — frame all interpretive claims as readings supported by specific observable evidence, not settled conclusions.';

        const pass2Stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          system: pass2SystemPrompt,
          messages: [{
            role: 'user',
            content: [
              ...imageBlocks,
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

        send({ type: 'status', message: 'Pass 3 — what to take forward…' });

        const pass3PromptText = isConnections
          ? CONNECTIONS_COMPETENCY_PROMPT(pass1Text, pass2Text, audience || '')
          : COMPETENCY_PROMPT(pass1Text, pass2Text, audience || '');

        const pass3Msg = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: 'You are an educator writing for someone curious and smart who wants to understand how to look at artifacts. Write the way Ira Glass tells a story: open with something concrete and recognizable, move toward the insight, land it plainly. If you use a technical term, follow it immediately with plain English. The goal is to leave the reader thinking "I can do that next time."',
          messages: [{
            role: 'user',
            content: [
              ...imageBlocks,
              { type: 'text', text: pass3PromptText },
            ],
          }],
        });

        const pass3Text = pass3Msg.content
          .filter((b: any) => b.type === 'text')
          .map((b: any) => b.text)
          .join('\n\n');

        // Pass 4 — structured extraction + D1 save (internal, not streamed)
        let savedRecordId: number | null = null;
        const db = (locals as any).runtime?.env?.artlab_analyses;
        const r2 = (locals as any).runtime?.env?.artlab_images;

        if (db) {
          send({ type: 'status', message: 'Saving to database…' });
          let extractionRaw = '';
          try {
            const extractionMsg = await anthropic.messages.create({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 8192,
              system: 'You are a data extraction assistant. Extract structured data from artifact analysis text and output ONLY valid JSON. No markdown fences, no commentary, no extra text.',
              messages: [{
                role: 'user',
                content: [{ type: 'text', text: EXTRACTION_PROMPT(pass1Text, pass2Text, fields, isConnections ? 'connections' : 'artifact') }],
              }],
            });

            extractionRaw = extractionMsg.content
              .filter((b: any) => b.type === 'text')
              .map((b: any) => b.text)
              .join('').trim();

            const extractionText = extractionRaw
              .replace(/^```(?:json)?\s*/i, '')
              .replace(/\s*```\s*$/i, '')
              .trim();

            const structuredRecord = JSON.parse(extractionText);

            savedRecordId = await saveToD1(
              db, fields, structuredRecord,
              pass1Text, pass2Text, pass3Text,
              isConnections ? 'connections' : 'artifact',
              audience || '',
              images,
              r2
            );
          } catch (err) {
            console.error('[Pass 4]', err);
          }
        }

        send({ type: 'complete', success: true, pass1: pass1Text, analysis: pass2Text, competency: pass3Text, mode, ...(savedRecordId ? { record_id: savedRecordId } : {}) });

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
