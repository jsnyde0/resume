# Landing pitch

## What it is

The homepage: a one-line positioning statement and two links that fork the visitor toward either the technical work or the CV. It is the first thing anyone sees and the only place the site's thesis is stated in one sentence.

## How to reach it

Navigate to `/`.

## How to drive it with this project's harness

Not mapped, and probably not worth a browser. The page is fully static with no interactivity, so a static check is a faster, more deterministic signal for the same coverage:

```bash
npm run build
grep -q 'catwalks' dist/index.html
```

## What observable end state proves it works

The pitch line is present verbatim — `From catwalks to startups, agent harnesses to existential dread.` — and **both** forks are present and correctly targeted: `what excites me` pointing at `/factory/`, `what bores me` pointing at `/resume/`. The pair matters: one link surviving a refactor while the other breaks is the realistic failure, and checking only one would miss it.

**What no automated check can reach here:** whether the sentence actually lands on a cold reader. That is a positioning question, and this repo's inventory already names the right mechanism for it — the cold-context read-back under `copy-and-positioning` in `.claude/verification.md`. Do not pretend a grep covers it.
