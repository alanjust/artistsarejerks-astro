# The Art Lab Database — A Plain-Language Guide

## What is this thing?

A database is a structured place to store information so you can ask questions of it later.

A spreadsheet is a database you navigate by eye. You scroll, you filter, you scan. It works when you have hundreds of rows. It breaks down when you have tens of thousands, or when you want to ask a question that spans multiple sheets at once.

What we built is a proper relational database — meaning the information lives in multiple connected tables, and you can query across all of them simultaneously. "Show me every analysis where Figure-Ground fired at weight 3, the tradition is Mimbres, and the audience was curator" is a single query that returns results in milliseconds, no matter how many analyses are stored.

The specific technology is **D1**, which is Cloudflare's hosted database. It runs SQLite under the hood — the same database engine used in every iPhone and Android device on earth. It's small, fast, and requires zero maintenance on your end. It lives in Cloudflare's infrastructure alongside the website.

---

## What happens when you run an analysis

When you submit an image and click Run Analysis, the system does four things in sequence:

**Pass 1** — The model observes the object: what it sees perceptually, which principles are active, what the physical evidence says.

**Pass 2** — The model analyzes: tradition attribution, function, iconographic content, cultural context. This is where the domain knowledge fires.

**Pass 3** — The model writes the audience-appropriate output you read on screen.

**Pass 4** — Invisible to you. A second, smaller model (Haiku) reads the Pass 1 and Pass 2 text and extracts structured data from it — controlled vocabulary terms, principle names, weights, confidence levels. That structured data is what goes into the database.

The streaming output you watch appear on screen is Passes 1–3. The database record is assembled quietly in the background after Pass 3 finishes.

---

## The tables — what each one stores

Think of each table as a sheet in a very organized spreadsheet. Every sheet has columns (the categories of information) and rows (individual records).

### `objects`
One row per physical object analyzed. Stores the metadata you entered in the form: object type, culture, period, material, dimensions, site, collection, condition. Also stores what the model identified the object class to be.

Every other table connects back to this one. The object is the anchor.

### `analyses`
One row per analysis run. An object can be analyzed multiple times — each run gets its own row here. Stores:
- Which object was analyzed (pointer to `objects`)
- What mode was used (artifact or connections)
- What audience was selected
- The model's top-level findings: tradition identified, tradition confidence, function category, function confidence, production level, temporal note
- The full prose text of all three passes

This is the core record. Everything else hangs off it.

### `principle_firings`
One row per principle that fired in a given analysis. This is where the analytical vocabulary becomes queryable data.

Each row stores:
- Which analysis it belongs to
- The principle name (exact, controlled vocabulary)
- The principle ID (number)
- The principle type: `artifact` (one of the 15 domain principles) or `universal_tier_a` (one of the 12 applicable universal perceptual principles)
- Which pass it fired in: `pass1`, `pass2`, or `both`
- **Weight**: 1 (peripheral), 2 (clearly operative), 3 (dominant — central to what makes this object what it is)
- The specific observation phrase from the analysis text

This table is why the database is useful. "Show me every analysis where Production Trace Reading fired at weight 3" is a two-second query. In a folder of PDFs, that's an afternoon.

### `rap_flags`
One row per interpretive claim the RAP Protocol evaluated. Every time the analysis makes a claim — tradition attribution, iconographic meaning, functional assignment, inter-tradition relationship — that claim gets a row here with:
- Claim type (what kind of claim it is)
- Confidence: `reading` (two or more visual anchors) or `hypothesis` (fewer than two)
- The claim text itself
- Anchor count (how many independent visual observations supported it)

This lets you query the epistemics of the corpus. "Show me every hypothesis-confidence tradition attribution across all analyses" surfaces exactly where the model was working beyond the evidence.

### `section_readings`
One row per evaluative section (A through G) per analysis. Sections A–G are the structured criteria framework — Form and Construction, Function and Use, Cultural Context, etc. Each section row stores a summary and flags like whether trade materials were identified or a kill hole is present.

### `connections_records`
Only populated when you run Explore Connections mode. Stores the five cultural connections sections as text: Cultural Tradition, Exchange Networks, Contemporaneous Cultures, Iconographic Parallels, Trajectory.

### `images`
Stores references to the images uploaded for each object. The actual image files live in Cloudflare R2 (object storage); this table holds the URL and the view label (Interior, Exterior, Profile, etc.).

### `institutions`
The multi-tenant table. Every other table carries an `institution_id` so that when this system is licensed to a second client, their data stays completely separate from yours. Right now there's one institution: Default (id = 1). You never interact with this table directly.

---

## How the tables connect

```
institutions
    └── objects
            └── images
            └── analyses
                    └── principle_firings
                    └── rap_flags
                    └── section_readings
                    └── connections_records
```

Every analysis belongs to an object. Every principle firing belongs to an analysis. To ask "what principles fired on this object across all its analyses," you follow that chain upward.

The technical term for these connections is **foreign keys** — each table stores the ID of the row it belongs to in the parent table. `principle_firings` stores `analysis_id`. `analyses` stores `object_id`. The database enforces these connections automatically: if you delete an analysis, all its principle firings, RAP flags, and section readings are automatically deleted with it.

---

## What you can ask it

These are plain-English versions of real queries. Each one is a few lines of SQL that returns results in under a second.

**"What are the most common weight-3 principles across all Mimbres ceramic analyses?"**
Tells you what is structurally dominant across the tradition — the visual signatures that define Mimbres ceramic identity in this corpus.

**"Show me every analysis where a tradition attribution was flagged as hypothesis, not reading."**
Surfaces every case where the model was working beyond the evidence. Useful for identifying objects that need more documentation before a firm attribution.

**"Which principles fire together most often at weight 2 or 3?"**
Co-occurrence analysis. Principles that consistently appear together may describe a visual cluster — a production signature, a decorative tradition, a functional type.

**"Show me all analyses where Figure-Ground fired in `both` passes and Anatomical Correspondence fired at weight 3."**
Targeted search for a specific visual profile. Once you have enough analyses, this is how you find comparanda for an object you're trying to place.

**"What's the breakdown of production_level across all analyses?"**
How much of the corpus was household production vs. part-time specialist vs. full-time specialist — a quick picture of the corpus's economic range.

---

## What you don't see

The database is entirely behind the scenes. There's no interface for it yet — you query it directly via the terminal commands you've been running. Building a query interface (a page on the site where you can filter and browse stored analyses) is the next step.

The analysis tool you use today — the upload form, the streaming output, the principles links — is the data entry layer. Every time you run an analysis, a record goes into the database automatically. You're building the corpus whether or not you're thinking about the database.

---

## The current state

- **Database:** `artlab-analyses`, hosted on Cloudflare D1
- **Schema version:** 0002 (weight column added to principle_firings)
- **Records in database:** 2 analyses, 2 objects, 33 principle firings
- **Principles assessed per run:** 27 (15 artifact domain + 12 universal Tier A)
- **Weighting:** 1–3 integer per firing, assigned by model during extraction
- **What's not built yet:** Query interface, fine art schema, connections mode full extraction
