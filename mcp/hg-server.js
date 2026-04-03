/**
 * Hidden Grammar MCP Server
 *
 * Exposes the HG principles, roots, and candidates data as Claude tools.
 * Read-only: get_principle, list_by_root, search_principles, get_tier, read_candidates
 * Write:     write_candidate, flag_candidate
 *
 * Run: node mcp/hg-server.js
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "../src/data");

// ── Data loaders ─────────────────────────────────────────────────────────────

function loadPrinciples() {
  return JSON.parse(readFileSync(join(DATA, "hg-principles.json"), "utf-8"));
}

function loadRoots() {
  return JSON.parse(readFileSync(join(DATA, "hg-roots.json"), "utf-8"));
}

function loadCandidates() {
  return JSON.parse(readFileSync(join(DATA, "hg-candidates.json"), "utf-8"));
}

function saveCandidates(candidates) {
  writeFileSync(
    join(DATA, "hg-candidates.json"),
    JSON.stringify(candidates, null, 2) + "\n"
  );
}

// ── Server ────────────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "hg-server",
  version: "1.0.0",
});

// ── get_principle(id) ─────────────────────────────────────────────────────────

server.tool(
  "get_principle",
  "Get a single Hidden Grammar principle by its numeric ID (1–54).",
  { id: z.number().int().min(1).max(54).describe("Principle numeric ID") },
  async ({ id }) => {
    const { principles } = loadPrinciples();
    const principle = principles.find((p) => p.id === id);
    if (!principle) {
      return {
        content: [{ type: "text", text: `No principle found with id ${id}.` }],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(principle, null, 2) }],
    };
  }
);

// ── list_by_root(root_name) ───────────────────────────────────────────────────
// Roots carry an `activators` array like ["Principle #5 (Grouping)", ...].
// We parse the principle number from each entry and return the full objects.

server.tool(
  "list_by_root",
  "List all Hidden Grammar principles associated with a root. Accept root name (e.g. 'Design Logic') or id (e.g. 'ch-sh-v').",
  { root_name: z.string().describe("Root name or id") },
  async ({ root_name }) => {
    const { roots } = loadRoots();
    const { principles } = loadPrinciples();

    const root = roots.find(
      (r) =>
        r.name.toLowerCase() === root_name.toLowerCase() ||
        r.id.toLowerCase() === root_name.toLowerCase()
    );

    if (!root) {
      const available = roots.map((r) => `${r.name} (${r.id})`).join(", ");
      return {
        content: [
          {
            type: "text",
            text: `Root "${root_name}" not found.\nAvailable roots: ${available}`,
          },
        ],
      };
    }

    const activatorIds = (root.activators || [])
      .map((a) => {
        const m = a.match(/Principle #(\d+)/i);
        return m ? parseInt(m[1], 10) : null;
      })
      .filter(Boolean);

    const matched = principles.filter((p) => activatorIds.includes(p.id));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              root: { id: root.id, name: root.name, subtitle: root.subtitle },
              principle_count: matched.length,
              principles: matched,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── search_principles(query) ──────────────────────────────────────────────────

server.tool(
  "search_principles",
  "Full-text search across principle name, subtitle, neuralFact, studioTool, howToUse, and combineWith.",
  { query: z.string().min(1).describe("Search term(s)") },
  async ({ query }) => {
    const { principles } = loadPrinciples();
    const q = query.toLowerCase();

    const results = principles.filter((p) => {
      const searchable = [
        p.name,
        p.subtitle,
        p.neuralFact,
        p.studioTool,
        p.howToUse,
        p.studioUse,
        ...(p.combineWith || []),
      ];
      return searchable.some((f) => f && f.toLowerCase().includes(q));
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { query, count: results.length, principles: results },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── get_tier(tier) ────────────────────────────────────────────────────────────

server.tool(
  "get_tier",
  "Return all principles in a given evidence tier (A, B, C, or D), including the tier description.",
  { tier: z.enum(["A", "B", "C", "D"]).describe("Tier level") },
  async ({ tier }) => {
    const { principles, meta } = loadPrinciples();
    const results = principles.filter((p) => p.tier === tier);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              tier,
              description: meta.tiers[tier],
              count: results.length,
              principles: results,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── read_candidates() ─────────────────────────────────────────────────────────

server.tool(
  "read_candidates",
  "Read all candidate principles from hg-candidates.json.",
  {},
  async () => {
    const candidates = loadCandidates();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { count: candidates.length, candidates },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ── write_candidate(candidate_object) ────────────────────────────────────────

server.tool(
  "write_candidate",
  "Append a new candidate principle to hg-candidates.json. Assigns a unique id and defaults status to 'pending' if not provided.",
  {
    candidate: z
      .object({
        name: z.string().describe("Principle name"),
        description: z.string().optional().describe("What it is / how it works"),
        tier_proposed: z
          .enum(["A", "B", "C", "D"])
          .optional()
          .describe("Proposed evidence tier"),
        source: z.string().optional().describe("Source or rationale"),
        status: z
          .string()
          .optional()
          .describe("Status (default: 'pending')"),
        notes: z.string().optional().describe("Additional notes"),
      })
      .passthrough()
      .describe("Candidate principle object"),
  },
  async ({ candidate }) => {
    const candidates = loadCandidates();
    const entry = {
      id: `cand-${Date.now()}`,
      status: "pending",
      created_at: new Date().toISOString(),
      ...candidate,
    };
    candidates.push(entry);
    saveCandidates(candidates);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ ok: true, written: entry }, null, 2),
        },
      ],
    };
  }
);

// ── flag_candidate(id, status) ────────────────────────────────────────────────

server.tool(
  "flag_candidate",
  "Update the status field of a candidate in hg-candidates.json by id.",
  {
    id: z.string().describe("The candidate's id field (e.g. 'cand-1234567890')"),
    status: z
      .string()
      .describe(
        "New status — e.g. 'accepted', 'rejected', 'needs-review', 'promoted'"
      ),
  },
  async ({ id, status }) => {
    const candidates = loadCandidates();
    const idx = candidates.findIndex((c) => c.id === id);
    if (idx === -1) {
      return {
        content: [
          { type: "text", text: `No candidate found with id "${id}".` },
        ],
      };
    }
    candidates[idx] = { ...candidates[idx], status, updated_at: new Date().toISOString() };
    saveCandidates(candidates);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ ok: true, updated: candidates[idx] }, null, 2),
        },
      ],
    };
  }
);

// ── Connect ───────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
