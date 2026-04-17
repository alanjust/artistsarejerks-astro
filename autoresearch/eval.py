#!/usr/bin/env python3
"""
Art Lab basePrompt optimization eval.

Scores prompt.md against 4 test images using a Sonnet judge.
Outputs a single composite score (0-100) to stdout.
Progress and per-image scores go to stderr.

Usage:
    python eval.py

Requirements:
    pip install anthropic
    export ANTHROPIC_API_KEY=your_key_here

Cost per run: ~$0.50 (4 Sonnet analyses + 4 Sonnet judge calls)
"""

import anthropic
import base64
import json
import re
import sys
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "src" / "data"
IMAGES_DIR = PROJECT_DIR / "public" / "images" / "artists"

# ── Test images ────────────────────────────────────────────────────────────────
# Each image stresses a different failure mode in the prompt.
# agnes-martin   → register collapse (almost nothing to observe)
# kiefer         → intent attribution under cultural pressure
# estes          → principle citation specificity (dense visual complexity)
# lichtenstein   → actionability (familiar work, explicit visual system)
TEST_IMAGES = [
    "agnes-martin-the-islands.jpg",
    "anselm-kiefer-margarethe.jpeg",
    "richard-estes-telephone-booths.jpg",
    "roy-lichtenstein-whaam.jpg",
]

# ── Analysis prompt (mode: fine-art-comprehensive) ─────────────────────────────
# Fixed variable — do not modify in the eval loop.
ANALYSIS_PROMPT = """Conduct a full Hidden Grammar analysis of this work.
Work through all 11 Roots systematically: Design Logic, Tactile Execution, Structural Integrity,
Atmosphere, Visual Hierarchy, Narrative Sequence, Signal Strength, Gravitas, Entropy,
Materiality, and Format. For each Root, identify which of the 54 Principles are active.
Map observations to perceptual and neural mechanisms. Do not interpret until the Evidence Gate
is passed. Present findings as structured observations, not conclusions."""

# ── Judge prompt ───────────────────────────────────────────────────────────────
JUDGE_PROMPT = """Score this art analysis on 4 criteria.

CRITICAL FORMAT RULE: Your entire response must be a single raw JSON object.
No markdown. No code fences. No backticks. No explanation. Just the JSON.
Start your response with {{ and end with }}. Nothing before or after.

ANALYSIS:
{analysis}

CRITERIA (score each 1-10):

register_separation: Are the three language registers kept distinct?
10 = observable / perceptual / interpretive registers cleanly separated throughout
5 = occasional collapse but generally maintained
1 = facts and interpretations merged into unqualified claims

principle_specificity: Are Hidden Grammar principles named with mechanisms explained?
10 = every principle named; mechanism described concretely
5 = some principles named but mechanisms vague
1 = no principle names; only generic art commentary

jargon_clarity: Is technical language accessible without losing precision?
10 = terms defined or replaced with plain English; no unexplained jargon
5 = some jargon present but manageable
1 = dense clinical or art-speak without grounding

actionability: Could a practicing artist use this output?
10 = specific visual observations the artist can act on or push against
5 = some actionable observations buried in abstraction
1 = purely descriptive; nothing an artist can work with

Respond with only this JSON (no markdown, no fences, raw JSON only):
{{"register_separation": N, "principle_specificity": N, "jargon_clarity": N, "actionability": N}}"""


def load_prompt() -> str:
    prompt_path = SCRIPT_DIR / "prompt.md"
    if not prompt_path.exists():
        print("ERROR: prompt.md not found in autoresearch/", file=sys.stderr)
        sys.exit(1)
    return prompt_path.read_text().strip()


def load_framework_context() -> str:
    try:
        with open(DATA_DIR / "hg-roots.json") as f:
            roots_data = json.load(f)
        with open(DATA_DIR / "hg-principles.json") as f:
            principles_data = json.load(f)
    except FileNotFoundError as e:
        print(f"ERROR: Framework data not found: {e}", file=sys.stderr)
        sys.exit(1)

    roots_text = "\n\n".join(
        f"**{r['name']}** — {r['subtitle']}\nGoverns: {r['governs']}"
        for r in roots_data["roots"]
    )
    principles_text = "\n".join(
        f"**{p['name']}** — {p['subtitle']}"
        for p in principles_data["principles"]
    )

    return f"""

# HIDDEN GRAMMAR FRAMEWORK REFERENCE

## The 11 Roots
{roots_text}

## The 54 Principles
{principles_text}

---

# UNIVERSAL OUTPUT CONSTRAINTS

- NEVER use Hebrew consonant abbreviations in output — use English names only
- NEVER reference principles by number — use descriptive names
- Evidence-based reasoning: observations → mechanisms → effects → conclusions
- Claims are testable hypotheses tied to visible evidence, not verdicts
"""


def encode_image(image_path: Path) -> tuple[str, str]:
    suffix = image_path.suffix.lower()
    media_type_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }
    media_type = media_type_map.get(suffix, "image/jpeg")
    with open(image_path, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode("utf-8")
    return data, media_type


def run_analysis(client: anthropic.Anthropic, system_prompt: str, image_path: Path) -> str:
    image_data, media_type = encode_image(image_path)
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=system_prompt,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": media_type,
                        "data": image_data,
                    },
                },
                {
                    "type": "text",
                    "text": ANALYSIS_PROMPT,
                },
            ],
        }],
    )
    return message.content[0].text


def parse_judge_response(response_text: str) -> dict:
    """
    Robustly parse the judge's response.
    Strips markdown fences and finds the JSON object even if extra text leaks in.
    """
    # Strip markdown code fences
    cleaned = re.sub(r"```(?:json)?\s*", "", response_text).strip()
    cleaned = cleaned.replace("```", "").strip()

    # Try direct parse first
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Fall back: extract first {...} block from the text
    match = re.search(r"\{[^{}]+\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    print(f"  WARNING: Could not parse judge response: {response_text[:120]}", file=sys.stderr)
    return None


def judge_analysis(client: anthropic.Anthropic, analysis: str) -> dict:
    truncated = analysis[:3500]
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=256,
        messages=[{
            "role": "user",
            "content": JUDGE_PROMPT.format(analysis=truncated),
        }],
    )
    response_text = message.content[0].text.strip()
    result = parse_judge_response(response_text)

    if result is None:
        return {"register_separation": 5, "principle_specificity": 5,
                "jargon_clarity": 5, "actionability": 5}

    expected = {"register_separation", "principle_specificity", "jargon_clarity", "actionability"}
    if not expected.issubset(result.keys()):
        print(f"  WARNING: Judge response missing keys. Got: {list(result.keys())}", file=sys.stderr)
        return {"register_separation": 5, "principle_specificity": 5,
                "jargon_clarity": 5, "actionability": 5}

    return result


def main():
    client = anthropic.Anthropic()

    print("Loading prompt and framework context...", file=sys.stderr)
    base_prompt = load_prompt()
    framework_context = load_framework_context()
    system_prompt = base_prompt + framework_context

    all_image_composites = []

    for i, image_name in enumerate(TEST_IMAGES):
        image_path = IMAGES_DIR / image_name
        if not image_path.exists():
            print(f"  WARNING: {image_name} not found, skipping", file=sys.stderr)
            continue

        print(f"\n  [{i+1}/4] {image_name}", file=sys.stderr)
        print(f"  → Analyzing...", file=sys.stderr)
        analysis = run_analysis(client, system_prompt, image_path)

        print(f"  → Judging...", file=sys.stderr)
        scores = judge_analysis(client, analysis)

        image_composite = sum(scores.values()) / len(scores)
        all_image_composites.append(image_composite)

        print(
            f"  → {image_composite:.2f}/10  "
            f"[sep={scores.get('register_separation','?')} "
            f"spec={scores.get('principle_specificity','?')} "
            f"jarg={scores.get('jargon_clarity','?')} "
            f"act={scores.get('actionability','?')}]",
            file=sys.stderr
        )

    if not all_image_composites:
        print("ERROR: No images were successfully evaluated", file=sys.stderr)
        print("0.0")
        return

    final_score = (sum(all_image_composites) / len(all_image_composites)) * 10
    print(f"\nFinal composite score: {final_score:.1f}/100", file=sys.stderr)
    print(f"{final_score:.1f}")


if __name__ == "__main__":
    main()
