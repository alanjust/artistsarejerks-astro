# Hidden Grammar Corpus

The raw material that feeds the displacement library. Each domain folder contains
four files: the critics and frameworks, the canonical works (reference class), the
evaluative criteria, and direct source extracts—the actual language the tradition
uses to describe quality and failure.

The displacement library lives separately. It contains tested prompt blocks built
from this material, versioned, with notes on what each version still got wrong.

## Folder structure

```
corpus/
  [domain]/
    critics-and-frameworks.md   — who the key voices are, what they argued
    canonical-works.md          — the reference class for this domain
    evaluative-criteria.md      — observable success/failure criteria
    source-extracts.md          — direct quotes and vocabulary from primary sources
  displacement-library/
    [domain]-v[n].md            — tested prompt blocks, versioned
```

## Domains

- `cpg/` — Consumer packaged goods: packaging that drives commercial performance
- `decorative-arts/` — Ornament, pattern, applied decoration (coming)
- `craft/` — Studio craft, maker traditions, functional objects (coming)
- `archaeological/` — Artifacts analyzed within their cultural and functional context (coming)
- `pattern-design/` — Surface, textile, repeat pattern, wallcovering (coming)

## How to use this with Claude

Point Claude at the relevant domain folder before building or refining a
displacement block. The corpus files are the source. The displacement library
is what's been proven to work in practice.

When a displacement block still drifts after testing, note what drifted and
where, update the displacement library file with a new version, and—if the
drift reveals a gap in the corpus—add to the source-extracts or
evaluative-criteria file in the relevant domain folder.

---

*Started: May 2026. CPG domain first.*
