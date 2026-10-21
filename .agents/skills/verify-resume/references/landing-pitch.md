# Landing pitch

## What it is

The homepage, as the F7 "Poster on black" composition (resume-soe.12 D4): the tagline top-left with a pink "dread." block, the lime name along the foot, and the mirrored photo whose fingertip touches the tagline and whose clog stands on the name. Four links: `What excites me` -> `/factory/`, `What bores me` -> `/resume/`, GitHub, LinkedIn. No site navbar or footer on this page.

## How to reach it

Navigate to `/`.

## How to drive it with this project's harness

```bash
scripts/launch && scripts/drive home-contacts && scripts/cleanup
```

Details in SKILL.md "Home-contacts drive".

## What observable end state proves it works

`evidence.json` `result: pass`: in every engine and size, both contacts within 0-4px of the target glyph's ink (wide: `t` of "agent" and `d` of "Snyders"; squarer: final `s`; narrow: the "dread." block and the final `n` of "Jonatan"), zero lime-hued ground pixels around the shirt, the composition hidden while the font is held, a contact-free settled layout when the font fails, and all four links visible and reachable.

**What no automated check can reach here:** whether the sentence lands on a cold reader, and whether the composition looks right (D2 "played straight"). The first is the cold-context read-back under `copy-and-positioning` in `.claude/verification.md`; the second is the human's walk (resume-soe.12 Signal 4).
