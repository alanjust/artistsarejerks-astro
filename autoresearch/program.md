# Art Lab basePrompt Optimization

## Your goal
Maximize the composite score produced by `eval.py`.
Score range: 0–100. Higher is better.
Run `python eval.py` to get the current score before making any changes.

## The one file you may edit
`prompt.md` — the basePrompt that prefixes every Art Lab analysis.
Do not touch any other file.

## What the score measures
A Sonnet judge scores each of 4 test images on 4 criteria, then averages everything:

| Criterion | What fails it |
|---|---|
| register_separation | Observable facts and interpretations merged into unqualified claims |
| principle_specificity | Principles not named, or named without their perceptual mechanism |
| jargon_clarity | Unexplained neuroaesthetic or art-speak language |
| actionability | Output a practicing artist cannot use |

## Test images and their stress cases
- `agnes-martin-the-islands.jpg` → register collapse (almost nothing to observe)
- `anselm-kiefer-margarethe.jpeg` → intent attribution under cultural pressure
- `richard-estes-telephone-booths.jpg` → principle specificity (dense visual complexity)
- `roy-lichtenstein-whaam.jpg` → actionability (familiar work, explicit visual system)

## Score variance — critical
The judge is a live LLM. Scores vary ±2–3 points run to run on identical prompts.
This means:
- A change that moves the score by 1–2 points is noise, not signal. Discard it.
- Only treat a change as a real improvement if it moves the score by 3+ points.
- If a change looks promising but scores only +1 or +2, run eval.py a second time
  and average the two results before deciding to keep or discard.

## Workflow per experiment
1. Edit `prompt.md`
2. Run `python eval.py`
3. If score increased by 3+ points: keep the change, commit, move to next experiment
4. If score increased by 1–2 points: run eval.py once more and average before deciding
5. If score stayed flat or dropped: revert the change and try something else
6. Commit format: `git add autoresearch/prompt.md && git commit -m "expN: SCORE — one-line description"`

## Simplicity bias
A 3-point improvement that adds 50+ words? Discard.
A 3-point improvement from cutting 20 words? Keep.
Equal score but the prompt reads more clearly? Keep.
Never optimize toward a longer, more complex prompt.

## Stopping criteria
Stop after **20 experiments** OR when score exceeds **90**, whichever comes first.
If 5 consecutive experiments score below the current best, stop and write a summary.

## Hard spend cap
Each full eval run costs approximately $0.50.
20 experiments = ~$10 maximum.
Do not exceed 20 runs under any circumstances.

## Current best
Score: 78.8 — committed as exp1 (artist-facing closing sentence per Root)

## What not to do
- Do not modify the framework context (roots/principles) — it is injected by eval.py automatically
- Do not add instructions that duplicate what the mode-specific prompts already say
- Do not introduce new register names that conflict with the three existing ones
- Do not make the prompt longer in order to score higher — the judge penalizes jargon density
