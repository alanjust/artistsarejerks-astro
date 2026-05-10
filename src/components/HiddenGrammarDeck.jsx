
import { useState, useEffect } from "react";

const C = {
  bg: "#080c14",
  surf: "#0f1520",
  border: "#1a2030",
  text: "#d8e0ee",
  muted: "#4a5a72",
  accent: "#f0a030",
  mono: '"DM Mono", monospace',
  serif: '"Playfair Display", serif',
  sans: '"DM Sans", sans-serif',
};

const DIMS = [
  {
    name: "Perceptual",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    def: "What the eye does in the first seconds, before meaning kicks in",
    layer: "Neural / biological layer",
    questions: [
      "Where does the eye enter?",
      "How does contrast gradient route attention?",
      "What figure-ground tensions exist?",
    ],
  },
  {
    name: "Material",
    color: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    def: "What the work is made of, and how the making is visible",
    layer: "Forensic / physical layer",
    questions: [
      "What medium evidence is present?",
      "How does process show in the surface?",
      "What does the substrate contribute?",
    ],
  },
  {
    name: "Cultural",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    def: "Where the work sits in the field of what gets valued and recognized",
    layer: "Sociological layer",
    questions: [
      "What tradition does this inherit?",
      "What institutional frame surrounds it?",
      "What field of value does it claim?",
    ],
  },
  {
    name: "Conceptual",
    color: "#c084fc",
    bg: "rgba(192,132,252,0.08)",
    def: "What argument or system of ideas the work is in dialogue with",
    layer: "Philosophical / discursive layer",
    questions: [
      "What proposition does this make?",
      "What ideas does it extend or challenge?",
      "What discourse does it enter?",
    ],
  },
];

const SLIDE_LABELS = [
  "Title",
  "The Problem",
  "The Architecture",
  "Four Dimensions",
  "Domain Isolation",
  "Two-Pass Pipeline",
  "RAP Protocol",
  "The Ontology",
  "What You Get",
];

// ── Shared components ──────────────────────────────────────────────────────────

function Mono({ children, color, size = 11 }) {
  return (
    <span style={{ fontFamily: C.mono, fontSize: size, letterSpacing: "0.12em", textTransform: "uppercase", color: color || C.muted }}>
      {children}
    </span>
  );
}

function Slide({ children, pre, title, wide }) {
  return (
    <div style={{ minHeight: "calc(100vh - 48px)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 64px 24px", maxWidth: wide ? 1200 : 1040, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      {(pre || title) && (
        <div style={{ marginBottom: 36 }}>
          {pre && <Mono color={C.accent}>{pre}</Mono>}
          {title && <h1 style={{ fontFamily: C.serif, fontSize: 44, fontWeight: 700, color: C.text, margin: pre ? "10px 0 0" : 0, lineHeight: 1.15 }}>{title}</h1>}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Slide 1: Title ─────────────────────────────────────────────────────────────

function TitleSlide() {
  return (
    <div style={{ minHeight: "calc(100vh - 48px)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", maxWidth: 1040, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <Mono color={C.accent} size={12}>Art Lab / Hidden Grammar</Mono>
      <h1 style={{ fontFamily: C.serif, fontSize: 80, fontWeight: 900, color: C.text, margin: "18px 0 0", lineHeight: 1.02 }}>
        A Schema<br />for Seeing
      </h1>
      <p style={{ fontFamily: C.sans, fontSize: 22, fontWeight: 300, color: C.muted, margin: "28px 0 0", lineHeight: 1.55, maxWidth: 520 }}>
        What happens when you give AI a structured framework instead of a blank prompt.
      </p>
      <div style={{ display: "flex", gap: 56, marginTop: 64 }}>
        {[
          { n: "4", label: "Domains", color: C.accent },
          { n: "2", label: "Pass Pipeline", color: "#60a5fa" },
          { n: "11", label: "Roots", color: "#34d399" },
          { n: "54", label: "Principles", color: "#c084fc" },
        ].map(({ n, label, color }) => (
          <div key={label}>
            <div style={{ fontFamily: C.mono, fontSize: 40, fontWeight: 500, color, lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 2: The Problem ───────────────────────────────────────────────────────

function ProblemSlide() {
  return (
    <Slide pre="The Problem" title="AI art analysis: fluent, confident, unvalidated">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: C.surf, border: "1px solid #3a1515", borderRadius: 12, padding: "24px 28px" }}>
          <Mono color="#f87171">Without structure</Mono>
          <p style={{ fontFamily: C.mono, fontSize: 13, color: "#f87171", lineHeight: 1.7, margin: "14px 0 18px", fontStyle: "italic" }}>
            "This painting evokes a deep sense of melancholy. The artist's use of blue suggests sadness, while the composition reflects inner turmoil..."
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {["Confident-sounding", "Unfalsifiable", "Domain confusion", "No evidence cited", "Unverifiable"].map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#f87171", fontSize: 13, fontFamily: C.mono }}>✗</span>
                <span style={{ fontFamily: C.sans, fontSize: 13, color: C.muted }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: C.surf, border: "1px solid #153a25", borderRadius: 12, padding: "24px 28px" }}>
          <Mono color="#34d399">With structure</Mono>
          <p style={{ fontFamily: C.mono, fontSize: 13, color: C.text, lineHeight: 1.7, margin: "14px 0 18px", fontStyle: "italic" }}>
            "Compressed value range across 80% of the canvas creates figure-ground tension at the upper edge—consistent with{" "}
            <span style={{ color: "#60a5fa" }}>Value Structure/Massing</span>. The blue is a material fact: cobalt, translucent, wet-on-wet..."
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {["Evidence-grounded", "Falsifiable", "Domain-specific", "Named vocabulary", "Checkable by anyone"].map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#34d399", fontSize: 13, fontFamily: C.mono }}>✓</span>
                <span style={{ fontFamily: C.sans, fontSize: 13, color: C.text }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p style={{ fontFamily: C.sans, fontSize: 15, color: C.muted, lineHeight: 1.7, margin: 0 }}>
        The problem isn't AI's fluency. It's that nothing in a blank prompt prevents domain confusion, unsupported claims, or unfalsifiable interpretation. The fix is structural.
      </p>
    </Slide>
  );
}

// ── Slide 3: Architecture ──────────────────────────────────────────────────────

function ArchitectureSlide() {
  const layers = [
    { label: "Input", desc: "Image + optional metadata (artist, title, medium, context)", color: C.muted },
    { label: "Domain Routing", desc: "4 non-overlapping domains — each a distinct layer of inquiry", color: "#60a5fa" },
    { label: "Pass 1 — Observation", desc: "Pure formal observation. No interpretation allowed. Evidence only.", color: C.accent },
    { label: "Pass 2 — Matching", desc: "Observations mapped to named principles from the ontology", color: "#34d399" },
    { label: "RAP Gate", desc: "Minimum 2 independent observations required per interpretive claim", color: "#c084fc" },
    { label: "Output", desc: "Structured, evidence-grounded analysis with audience framing", color: C.text },
  ];

  return (
    <Slide pre="The Architecture" title="A constraint pipeline, not a chatbot">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {layers.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color, flexShrink: 0, marginTop: i === 0 ? 16 : 0 }} />
                {i < layers.length - 1 && <div style={{ width: 1, flex: 1, background: C.border, minHeight: 28 }} />}
              </div>
              <div style={{ paddingLeft: 18, paddingBottom: i < layers.length - 1 ? 24 : 0, paddingTop: i === 0 ? 10 : 0 }}>
                <Mono color={l.color}>{l.label}</Mono>
                <div style={{ fontFamily: C.sans, fontSize: 14, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>{l.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 12, padding: "22px 26px", flex: 1 }}>
            <Mono color={C.accent}>For engineers</Mono>
            <p style={{ fontFamily: C.sans, fontSize: 15, color: C.text, lineHeight: 1.65, margin: "12px 0 0" }}>
              Think of this as a typed pipeline. Each layer constrains what the next layer is allowed to do. This isn't text generation with a nice prompt—it's text generation with a schema enforced at every step.
            </p>
          </div>
          <div style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 12, padding: "22px 26px", flex: 1 }}>
            <Mono>What the constraint buys you</Mono>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {["Domain confusion becomes a type error", "Every claim requires a citation", "Output is auditable, not just plausible"].map((s) => (
                <div key={s} style={{ fontFamily: C.sans, fontSize: 14, color: C.muted, display: "flex", gap: 8 }}>
                  <span style={{ color: C.accent, flexShrink: 0 }}>→</span>{s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// ── Slide 4: Four Dimensions ───────────────────────────────────────────────────

function FourDomainsSlide({ hov, setHov }) {
  return (
    <Slide pre="The Core Framework" title="Art's Four Dimensions" wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {DIMS.map((d, i) => (
          <div
            key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{
              background: hov === i ? d.bg : C.surf,
              border: `1px solid ${hov === i ? d.color + "50" : C.border}`,
              borderRadius: 12,
              padding: "24px 28px",
              transition: "all 0.2s ease",
              cursor: "default",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <Mono color={d.color} size={12}>{d.name}</Mono>
              <Mono size={9}>{d.layer}</Mono>
            </div>
            <p style={{ fontFamily: C.sans, fontSize: 16, color: C.text, lineHeight: 1.6, margin: "0 0 16px" }}>{d.def}</p>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
              {d.questions.map((q, j) => (
                <div key={j} style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, marginBottom: 5, lineHeight: 1.5 }}>
                  <span style={{ color: d.color + "70", marginRight: 6 }}>→</span>{q}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Slide>
  );
}

// ── Slide 5: Domain Isolation ──────────────────────────────────────────────────

function DomainIsolationSlide() {
  return (
    <Slide pre="Key Insight" title="These domains don't bleed into each other">
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 780 }}>
        <p style={{ fontFamily: C.sans, fontSize: 18, color: C.text, lineHeight: 1.65, margin: 0 }}>
          A perceptual claim—"the eye is drawn to the upper-left quadrant"—can only be validated by perceptual evidence. Not by knowing who made it. Not by knowing its cultural moment.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ background: "#0f1a20", border: "1px solid #153a25", borderRadius: 10, padding: "20px 24px" }}>
            <Mono color="#34d399">Valid evidence chain</Mono>
            <p style={{ fontFamily: C.sans, fontSize: 14, color: C.text, lineHeight: 1.65, margin: "10px 0 8px" }}>
              Perceptual claim → supported by perceptual observation + named principle
            </p>
            <Mono color="#34d399" size={10}>Domain: consistent ✓</Mono>
          </div>
          <div style={{ background: "#1a0f10", border: "1px solid #3a1515", borderRadius: 10, padding: "20px 24px" }}>
            <Mono color="#f87171">Domain confusion</Mono>
            <p style={{ fontFamily: C.sans, fontSize: 14, color: C.text, lineHeight: 1.65, margin: "10px 0 8px" }}>
              Perceptual claim → "supported" by cultural context or artist biography
            </p>
            <Mono color="#f87171" size={10}>Domain: mixed ✗</Mono>
          </div>
        </div>
        <div style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 24px" }}>
          <Mono color={C.accent}>For engineers: it's a type system</Mono>
          <p style={{ fontFamily: C.sans, fontSize: 15, color: C.muted, lineHeight: 1.65, margin: "10px 0 0" }}>
            Each domain is a type. Evidence must be of the correct type to validate a claim. Domain confusion—the most common failure mode in AI art analysis—is a type error. The framework catches it structurally, before the model generates fluent-sounding nonsense.
          </p>
        </div>
      </div>
    </Slide>
  );
}

// ── Slide 6: Two-Pass ─────────────────────────────────────────────────────────

function TwoPassSlide() {
  const passes = [
    {
      num: "01",
      name: "Formal Observation",
      color: C.accent,
      rule: "No interpretation allowed",
      items: [
        "Describe what is literally present",
        "Spatial organization, tonal relationships, edge quality",
        "Material evidence: medium, substrate, surface",
        "Zero interpretive language — observation only",
      ],
      ex: '"The upper-left quadrant holds the highest contrast edge in the composition. A diagonal implied line runs from upper-left to lower-right, bisecting the tonal field."',
    },
    {
      num: "02",
      name: "Principle Matching",
      color: "#60a5fa",
      rule: "Two observations minimum per claim",
      items: [
        "Map observations to named principles from the ontology",
        "RAP Protocol enforced: 2+ observations per interpretive claim",
        "Gaps surfaced as candidate principles",
        "Audience framing applied at output layer only",
      ],
      ex: '"The diagonal and the contrast gradient act in concert—consistent with Compositional Vectors. The eye is routed, not wandering. This is directed attention, not ambient."',
    },
  ];

  return (
    <Slide pre="The Pipeline" title="Two-pass validation structure" wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {passes.map((p) => (
          <div key={p.num} style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 28px" }}>
            <div style={{ fontFamily: C.mono, fontSize: 36, fontWeight: 500, color: p.color, lineHeight: 1, marginBottom: 8 }}>Pass {p.num}</div>
            <div style={{ fontFamily: C.sans, fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 4 }}>{p.name}</div>
            <Mono color={p.color}>Rule: {p.rule}</Mono>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, margin: "14px 0" }}>
              {p.items.map((item) => (
                <div key={item} style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, marginBottom: 7, paddingLeft: 12, borderLeft: `2px solid ${p.color}40`, lineHeight: 1.5 }}>
                  {item}
                </div>
              ))}
            </div>
            <div style={{ background: "#0a0d14", borderRadius: 8, padding: "12px 16px" }}>
              <Mono color={p.color}>Example output</Mono>
              <p style={{ fontFamily: C.mono, fontSize: 12, color: C.text, lineHeight: 1.65, margin: "8px 0 0", fontStyle: "italic" }}>{p.ex}</p>
            </div>
          </div>
        ))}
      </div>
    </Slide>
  );
}

// ── Slide 7: RAP Protocol ──────────────────────────────────────────────────────

function RAPSlide() {
  return (
    <Slide pre="The Evidence Requirement" title="RAP Protocol">
      <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 800 }}>
        <div style={{ background: "#0f1020", border: "1px solid #2a2060", borderRadius: 12, padding: "28px 36px" }}>
          <Mono color="#c084fc" size={12}>The Rule</Mono>
          <p style={{ fontFamily: C.serif, fontSize: 26, color: C.text, lineHeight: 1.5, margin: "14px 0 0" }}>
            No interpretive claim without observable evidence.
            <br />
            <span style={{ color: "#c084fc" }}>Minimum: two independent visual observations</span>
            <br />
            to support any interpretive claim.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 24px" }}>
            <Mono color="#f87171">Rejected</Mono>
            <p style={{ fontFamily: C.mono, fontSize: 13, color: "#f87171", lineHeight: 1.65, margin: "10px 0 10px", fontStyle: "italic" }}>
              "This work suggests tension and unease."
            </p>
            <div style={{ fontFamily: C.sans, fontSize: 12, color: C.muted }}>Zero observations cited. Unfalsifiable. Fails RAP.</div>
          </div>
          <div style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 24px" }}>
            <Mono color="#34d399">Accepted</Mono>
            <p style={{ fontFamily: C.mono, fontSize: 13, color: "#34d399", lineHeight: 1.65, margin: "10px 0 10px", fontStyle: "italic" }}>
              "The vertical bisection and near-equal value weights create unresolved figure-ground tension."
            </p>
            <div style={{ fontFamily: C.sans, fontSize: 12, color: C.muted }}>Two observations, named principle. Passes RAP.</div>
          </div>
        </div>
        <p style={{ fontFamily: C.sans, fontSize: 15, color: C.muted, lineHeight: 1.7, margin: 0 }}>
          Engineers: this is a proof requirement embedded in the prompt architecture. The model can't generate interpretive language without first generating the evidence that supports it. The constraint is structural, not stylistic.
        </p>
      </div>
    </Slide>
  );
}

// ── Slide 8: Ontology ─────────────────────────────────────────────────────────

function OntologySlide() {
  const sample = [
    {
      root: "Early Vision",
      tier: "A",
      principles: ["Edge Detection", "Color Opponent Channels", "Figure-Ground Relationships"],
    },
    {
      root: "Organization",
      tier: "A–B",
      principles: ["Grouping", "Pattern Completion/Closure", "Symmetry Detection"],
    },
    {
      root: "Attention",
      tier: "A–B",
      principles: ["Visual Pop-out / Pre-attentive Features", "Focal Blur / Depth of Field", "Value Structure/Massing"],
    },
    {
      root: "Color & Light",
      tier: "A–C",
      principles: ["Simultaneous Contrast", "Warm/Cool Temperature", "Color Harmony Systems"],
    },
  ];

  return (
    <Slide pre="The Vocabulary" title="11 Roots — 54 Principles">
      <div style={{ display: "flex", gap: 32 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: C.sans, fontSize: 16, color: C.text, lineHeight: 1.65, margin: "0 0 20px" }}>
            Named phenomena. Shared reference. Checkable claims.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sample.map((r) => (
              <div key={r.root} style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <Mono color={C.accent} size={10}>Root: {r.root}</Mono>
                  <Mono size={9}>Tier {r.tier}</Mono>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {r.principles.map((p) => (
                    <span key={p} style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, background: "#0a0d14", border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 8px" }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: 280 }}>
          <div style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 26px", height: "100%", boxSizing: "border-box" }}>
            <Mono color="#60a5fa">Why named principles matter</Mono>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 22 }}>
              {[
                { title: "Shared vocabulary", body: "Artist, critic, and AI are working from the same named phenomena. Claims can be compared." },
                { title: "Checkable claims", body: "If a principle is named, a second observer can verify whether it's actually present in the work." },
                { title: "Gap surfacing", body: "When a work breaks a principle, that's data. Gaps become candidate principles—the framework extends itself." },
                { title: "Tier structure", body: "Principles rated A–D by empirical robustness. Tier A = strong perceptual bias. Tier D = contested. Epistemic honesty built in." },
              ].map(({ title, body }) => (
                <div key={title}>
                  <div style={{ fontFamily: C.sans, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// ── Slide 9: Value ─────────────────────────────────────────────────────────────

function ValueSlide() {
  return (
    <Slide pre="What You Get" title="Analysis that rewards attention">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "◎", color: "#60a5fa", title: "Falsifiable", body: "Every claim comes with the observations that support it. You can check. You can disagree. That's the point." },
          { icon: "◈", color: "#34d399", title: "Teachable", body: "Named principles create shared vocabulary between instructor and student, artist and viewer, human and AI." },
          { icon: "△", color: "#c084fc", title: "Generative", body: "Gap surfacing means the framework improves itself. Analysis produces new candidate principles. It's not closed." },
        ].map(({ icon, color, title, body }) => (
          <div key={title} style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 26px" }}>
            <div style={{ fontFamily: C.mono, fontSize: 26, color, marginBottom: 14 }}>{icon}</div>
            <div style={{ fontFamily: C.sans, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>{title}</div>
            <div style={{ fontFamily: C.sans, fontSize: 14, color: C.muted, lineHeight: 1.65 }}>{body}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#0a0d14", border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 32px" }}>
        <Mono color={C.accent}>The underlying principle</Mono>
        <p style={{ fontFamily: C.serif, fontSize: 22, color: C.text, lineHeight: 1.55, margin: "12px 0 0" }}>
          Art that rewards attention deserves analysis that rewards attention.{" "}
          <span style={{ color: C.muted, fontWeight: 400 }}>
            Hidden Grammar is the architecture that makes that possible—at scale, with a model, without losing rigor.
          </span>
        </p>
      </div>
    </Slide>
  );
}

// ── Nav ────────────────────────────────────────────────────────────────────────

const navBtn = {
  fontFamily: '"DM Mono", monospace',
  fontSize: 11,
  letterSpacing: "0.08em",
  color: "#4a5a72",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "4px 0",
};

// ── Main ───────────────────────────────────────────────────────────────────────

export default function Presentation() {
  const [slide, setSlide] = useState(0);
  const [hov, setHov] = useState(null);
  const TOTAL = 9;

  const slides = [
    <TitleSlide />,
    <ProblemSlide />,
    <ArchitectureSlide />,
    <FourDomainsSlide hov={hov} setHov={setHov} />,
    <DomainIsolationSlide />,
    <TwoPassSlide />,
    <RAPSlide />,
    <OntologySlide />,
    <ValueSlide />,
  ];

  useEffect(() => {
    if (!document.getElementById("hg-fonts")) {
      const l = document.createElement("link");
      l.id = "hg-fonts";
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  useEffect(() => {
    const handle = (e) => {
      if (["ArrowRight", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
        setSlide((s) => Math.min(s + 1, TOTAL - 1));
      }
      if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setSlide((s) => Math.max(s - 1, 0));
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', background: C.bg, color: C.text, minHeight: "100vh" }}>
      {/* Slide counter */}
      <div style={{ position: "fixed", top: 18, right: 24, fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: "0.1em", zIndex: 10 }}>
        {String(slide + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")} — {SLIDE_LABELS[slide]}
      </div>

      {/* Current slide */}
      {slides[slide]}

      {/* Nav bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 28px", background: "rgba(8,12,20,0.96)", borderTop: `1px solid ${C.border}`, backdropFilter: "blur(8px)", zIndex: 10 }}>
        <button onClick={() => setSlide((s) => Math.max(s - 1, 0))} disabled={slide === 0} style={{ ...navBtn, opacity: slide === 0 ? 0.25 : 1 }}>
          ← PREV
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {slides.map((_, i) => (
            <div
              key={i}
              title={SLIDE_LABELS[i]}
              onClick={() => setSlide(i)}
              style={{ width: i === slide ? 22 : 6, height: 6, borderRadius: 3, background: i === slide ? C.accent : C.border, cursor: "pointer", transition: "all 0.2s" }}
            />
          ))}
        </div>
        <button onClick={() => setSlide((s) => Math.min(s + 1, TOTAL - 1))} disabled={slide === TOTAL - 1} style={{ ...navBtn, opacity: slide === TOTAL - 1 ? 0.25 : 1 }}>
          NEXT →
        </button>
      </div>
    </div>
  );
}
