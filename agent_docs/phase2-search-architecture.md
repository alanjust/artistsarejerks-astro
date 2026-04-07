# Phase 2 — Search & Retrieval Architecture
<!-- Written: April 2026 -->
<!-- Based on: "Anthropic Replaced Their RAG Pipeline with Agentic Search" (Eubanks, Apr 6 2026) -->
<!-- Status: Forward planning. No code changes. Informs Phase 2 build decisions. -->

---

## Why This Document Exists

Phase 2 of the roadmap adds per-user analysis storage and (eventually) the ability to compare analyses over time. Before building that infrastructure, it's worth being deliberate about the retrieval architecture. The wrong choice here is a RAG pipeline — this document explains why, and what to build instead.

---

## Current Architecture Is Not Affected

Art Lab's current analysis flow is a single API call: basePrompt + mode prompt + image → Sonnet → output. No retrieval, no indexing. This document applies only to Phase 2 and beyond.

---

## Two Types of Queries Against Stored Analyses

**1. Simple retrieval**
"Show me all analyses where Atmosphere was dominant." "All analyses from the past six months."

This is a D1 database query. No AI involved. Fast, cheap, deterministic. Build this with SQL, not an AI pipeline.

**2. Cross-analysis synthesis**
"How has my handling of color changed over time?" "What patterns appear across my last 20 analyses?" "Which of my works show the strongest Signal Strength activity?"

This is a document corpus search problem. The retrieval architecture decision matters here.

---

## The Architectural Decision: Agentic Search Over RAG

For synthesis queries, give Claude access to stored analyses as searchable records and let it search iteratively. Do not build a RAG pipeline.

### Why not RAG

RAG (Retrieval Augmented Generation) pre-processes documents into vector embeddings and retrieves the top-N most similar chunks at query time. It has a structural weakness: **source clustering**. Top-N retrieval by similarity gravitates toward whichever documents have the most concentrated content on the topic. For Art Lab analyses — which are all the same document type with similar vocabulary — this means RAG will cluster arbitrarily rather than finding meaningful patterns across the corpus.

A 42-test study (Eubanks, 2026) confirmed this: RAG scored 3.2/5 on cross-document synthesis tasks. The "compare multiple sources" failure was consistent across both models tested.

RAG also carries operational overhead: vector database, embedding model, chunking strategy, index maintenance. For a one-person team, this is not a good trade.

### Why agentic search

Agentic search gives the model filesystem/database access and lets it search iteratively. When the first search doesn't surface the right content, the model adapts and tries a different approach. The same study scored cloud-assisted agentic search at 4.7/5 on cross-document synthesis.

**The critical variable:** agentic search performance depends on the model driving the search. With a frontier model, it's excellent. With a weaker local model, it's only as good as RAG. Art Lab already uses Claude Sonnet — the frontier model that produced the 4.7 score. No capability gap to close.

### The practical architecture

- Store analyses in D1 with structured fields (mode, dominant roots, date, user ID, full output text)
- For synthesis queries, give Claude a tool that can query D1 and read analysis records
- Let Claude search iteratively: find candidates by metadata, read the full text of relevant ones, synthesize across them
- No embeddings, no vector database, no chunking

---

## Token Cost Consideration

Single Art Lab analyses currently run ~4,096 tokens max. The study documented agentic search consuming up to 155,000 tokens on complex cross-document tasks. Multi-analysis synthesis queries could cost **10–30x more per query** than a single analysis.

**Action required before Phase 2 ships:** Factor this into credit pack pricing. Synthesis queries should either be priced separately, rate-limited, or reserved for a Premium tier. Don't set credit pack amounts based on single-analysis token costs and then expose synthesis queries at the same price point.

---

## Obsidian Vault Integration

When Art Lab analyses need to reference material from the Obsidian Vault (session notes, artist research, conceptual threads), don't try to do live search through raw Obsidian markdown. The better pattern:

**Pre-compile the vault into a structured reference file.**

This is exactly what `hg-principles.json`, `hg-roots.json`, and `HIDDEN_GRAMMAR_COMPLETE.md` already do for the framework — they are pre-compiled, structured versions of the knowledge, ready for AI consumption. Apply the same pattern to vault content: periodically run a process that summarizes and indexes vault material into a structured reference file, which then becomes an optional context injection for relevant analyses.

Raw Obsidian search (agentic or RAG) introduces noise, staleness, and irrelevant context. Pre-compilation solves all three.

This is not blocking for Phase 2. It becomes relevant when vault integration is explicitly scoped.

---

## Decision Summary

| Question | Decision |
|----------|----------|
| Simple retrieval (filter by metadata) | D1 SQL queries — no AI |
| Cross-analysis synthesis | Agentic search with Claude + D1 access |
| RAG pipeline | Do not build |
| Obsidian Vault access | Pre-compile to structured file; inject as context |
| Synthesis query pricing | Separate from single-analysis pricing — token cost is 10–30x higher |

---

## Source

"Anthropic Replaced Their RAG Pipeline with Agentic Search" — Robert H. Eubanks, April 6, 2026.
42 structured tests. Four public documentation corpora. Three search approaches (RAG, cloud-assisted agentic, fully local agentic). Models tested: Mistral-Small-24B, Nemotron-3-Nano-30B, Gemma 4, Claude Sonnet. Hardware: Mac Mini M4 Pro, 64GB unified memory.
