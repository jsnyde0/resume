# Design system

Canonical home of the site's visual identity (D1-D3, landed on bead `resume-soe.12`) and the token layer that carries it. Read this before touching CSS on any page. Rollout state: the identity is in the shared layer; pages adopt it one at a time (see "Legacy tokens").

## Identity rules (D1-D3, binding)

**D1 - "Poster, on black."**
- Palette, by role (tokens in the next section): near-black ground; off-white body type; brand **lime** and **pink** go on type, rules, marks and UI (never as a field behind the figure, D3); with pink the *single hit colour* (emphasis block, the open/selected item, hover); **ink** for type set on lime or pink. `lime-dim` and `paper-2` are the quiet derived neutrals (rest-state UI, counts and meta).
- One type family: **Schibsted Grotesk**, weights 400-900. Heavy weights (800-900) at poster scale with tight tracking for the name, tagline and headings; 400-500 for running text.
- Swiss-poster discipline: few elements, enormous scale contrast, no ornament. Every value comes from a token; a new colour needs a role in D1 before it ships.

**D2 - No costume.**
- No decorative borrowed-format conceit (magazine, newspaper, film slate, terminal cosplay, stickers, fake metadata, jokey microcopy). Only real copy, played straight; personality comes from scale, the photo and the tagline.
- Carve-out: the `/resume/` repo-explorer *mechanism* (README landing, folders with file counts, `#path` deep links) is the human's own content device and functional navigation, so it stays. Decorative GitHub chrome that does nothing (Star/Fork, branch name, Raw/Blame, fake download buttons) does not.

**D3 - Outfit pops.**
- The lime shirt is never placed on a lime or near-lime ground; the pink clogs never on a pink ground. Brand colours go on type, rules, marks and UI; the body sits on `--id-ground`.

## Where things live

- **Tokens:** `src/styles/tokens.css` (one `:root` block plus the `@font-face`). Imported once by `src/layouts/BaseLayout.astro`, so every page receives them. Edit tokens only there.
- **Font file:** `public/fonts/schibsted-grotesk-latin-wght.woff2` (variable, latin subset, OFL licence beside it as `OFL.txt`). Self-hosted so the build is offline-deterministic; no `fonts.googleapis`/`fonts.gstatic` reference on any live page. Exception: the `/directions/` prototypes still link Google Fonts until they are deleted (resume-soe.20).
- **Global chrome** (navbar, footer, `.button`, hero, `.site-shell`, `.content-container`): `<style is:global>` in `BaseLayout.astro`. It still reads legacy tokens and is migrated page by page (see below).
- **Page and component CSS:** scoped `<style>` in each `.astro` file, consuming tokens via `var(--name)`.

## D1 token family (`--id-*`)

| Family | Tokens |
|---|---|
| Colour | `--id-ground` #151513, `--id-paper` #efede4, `--id-paper-2` #b9b6ab, `--id-lime` #c8ec6c, `--id-lime-dim` #8fa84f, `--id-pink` #f294cc, `--id-ink` #0b0b0a, `--id-rule` (paper at 16%), `--id-tint-hover` (paper at 7%, hover wash on list rows) |
| Font | `--id-font-display`, `--id-font-body` (both Schibsted Grotesk, then `"Helvetica Neue", Arial, sans-serif`) |
| Weight / tracking / leading | `--id-weight-body` 400, `-medium` 500, `-strong` 800, `-poster` 900; `--id-tracking-poster` -0.05em, `-display` -0.035em, `-heading` -0.01em; `--id-leading-poster` 0.9, `-display` 0.98 |
| Poster type scale | `--id-text-poster` (name), `--id-text-display` (tagline, page titles), `--id-text-heading`, `--id-text-body`, `--id-text-small` |

A page adopts the identity by reading these tokens in its own scoped CSS (ground on its outermost full-bleed container, `--id-font-*` on text). `BaseLayout`'s body ground, colour and font are still the legacy values, so unmigrated pages do not move.

A page that owns its full viewport and its own home link passes `bare` to `BaseLayout`: head, tokens, font preload and gate stay; navbar, footer, `.site-shell` and the `main` wrapper are not rendered, and the page sets its own `html`/`body` ground. `/resume/` does this (D5: the face avatar is its home link), and so does `/` (D4: the composition owns 100svh and its four links are the home navigation).

## Font gate

Geometry that depends on Schibsted Grotesk's real metrics (the home composition's contacts) must never render on fallback metrics. `BaseLayout.astro` ships the mechanism; a page opts in per element.

- **Opt in:** put `data-font-gate` on any element that must not show before the face is ready. Non-gated content is unaffected.
- **`html.fonts-ready`:** `document.fonts.load()` resolved with a loaded face for both `400` and `900` (the weights the identity uses). Gated elements are visible, on real metrics.
- **`html.fonts-failed`:** the load rejected, no face was declared by `window.load`, or `GATE_TIMEOUT_MS` (3000 ms, in the inline script) passed first. Gated elements are visible; a page styles its contact-free fallback under `html.fonts-failed`. First verdict wins and is never revised. Trade-off: a font that arrives after the timeout leaves that visit in the `fonts-failed` state (fallback metrics) for its whole life; the page does not switch back. Pages that need the real metrics (the home composition) decide whether that is acceptable or whether to extend the timeout.
- **Neither class yet:** gated elements are `visibility: hidden`.
- **No JS:** `<noscript>` reveals gated elements.
- The font is preloaded on every page (`<link rel=preload as=font type=font/woff2 crossorigin>`), so the gate normally settles within one round trip.
- `/` accepts the 3000 ms timeout (resume-soe.18): the woff2 is preloaded and ~47 KB, so the gate settles long before it on any working connection, and a longer timeout only lengthens the blank composition for the visitor whose font never comes. Its `fonts-failed` layout is contact-free (figure flush right behind the name on landscape; type only on narrow screens). Its links are not gated, so navigation works while the gate is pending.
- The timeout has one source: the inline script sets `data-font-gate-timeout` (ms) on `<html>`, and the `font-gate` drive reads it from there.

## Legacy tokens (retiring)

These predate D1. They keep their values and stay in `tokens.css` while a live page reads them; each is deleted in the commit that removes its last reader (prove with `grep -rn "var(--name"` under `src/`, excluding `src/pages/directions` and `src/components/directions`, which are prototypes that ship out).

| Legacy group | Tokens | Still read by |
|---|---|---|
| Site palette | `--base-100/200/300`, `--base-content`, `--muted-content`, `--primary(-focus/-content)`, `--success`, `--info`, `--content-bright`, `--tooltip-bg/-text`, tints `--surface-subtle`, `--border-subtle`, `--primary-tint`, `--info-tint` | `BaseLayout` chrome (navbar, footer, body; `/` renders `bare`, without the chrome, and overrides the body ground); `/factory/` (+ `/factory/a`, `/factory/b`; owned by bead `resume-t7j`); `/readme/` (`resume-soe.5`); `/projects/` (`ProjectCard`, `resume-soe.4`) |
| Legacy fonts | `--font-body` (system stack) | `BaseLayout` body, `/factory/b` |

Deleted (no reader left): `--ghv-*` and `--font-mono`, when `/resume/` became the D5 explorer on `--id-*` (`resume-soe.3`).

Migration rule: do not change the value of a legacy token (pages that still read it must not move); migrate a page by switching its reads to `--id-*`, then delete any token that has no reader left. Do not add new legacy-family tokens. When `--font-body` loses its last reader, the `--id-font-*` tokens become the only font tokens.

## Structural tokens (shared, not part of the retiring set)

| Family | Tokens |
|---|---|
| Font | `--line-height-body` (1.5), `--line-height-relaxed` (1.65) |
| Type scale, fixed | `--text-xs` .75rem, `--text-sm` .875rem, `--text-base` 1rem, `--text-prose-sm` .95rem, `--text-xl` 1.5rem, `--text-2xl` 1.875rem |
| Type scale, fluid (legacy pages) | `--text-title`, `--text-lead`, `--text-card-title`, `--text-hero`, `--text-hero-lead` |
| Spacing (n x 0.25rem) | `--space-1` .25, `-2` .5, `-3` .75, `-4` 1, `-5` 1.25, `-6` 1.5, `-8` 2, `-10` 2.5, `-12` 3 (rem); plus off-grid `--space-2-5` 0.6 |
| Containers | `--container-prose` 42rem, `--container-narrow` 52rem (/projects/), `--container-content` 56rem (/readme/), `--container-site` 80rem |
| Radius | `--radius-sm/md/lg/xl/full`, `--radius-button` |
| Shadow | `--shadow-card` |
| Motion | `--transition-base` |
| Card surface | `--card-bg`, `--card-radius`, `--card-shadow`, `--card-padding`, `--card-padding-compact` (mobile) |

## Shared components

- `src/components/resume/ResumeCard.astro` (props: `title?: string`, `tooltip?: string`; default slot). The card surface, used by `/readme/`. Its surface values are the `--card-*` tokens.
- `src/components/projects/ProjectCard.astro` (prop: `project: ProjectEntry`). Same card surface via the same `--card-*` tokens, so the two cards cannot drift apart.

Class names are part of the verification fingerprint (below). Renaming or adding a class on an existing element shows up as a diff, so do it only on purpose.

## Rules for adding tokens

1. New identity values go in the `--id-*` family, named by role or scale step, never by value (`--id-pink`, not `--id-f294cc`). Nothing new joins the legacy groups.
2. Add a token when a value appears on two or more pages/components, or is a named step of a scale. A one-off value stays a literal in its own file.
3. Never change the value of a token a live page still reads; add a new one and migrate the readers.
4. Update the tables above in the same commit.
5. Prefer an existing token with an adjacent value over a new off-scale one; that is a consistency fix and must be named in the commit/ship-record.

## How to verify

Run from `.agents/skills/verify-resume` (details in its `SKILL.md`). Evidence dirs live at the repo root, so from that directory they are `../../../.verify-evidence/...`:

```
scripts/launch && scripts/drive font-gate && scripts/drive file-tree && scripts/drive reading-path && scripts/drive identity && scripts/drive home-contacts && scripts/cleanup
scripts/launch && scripts/drive screenshots && scripts/cleanup
scripts/compare ../../../.verify-evidence/screenshots-<baselineTs> ../../../.verify-evidence/screenshots-<afterTs>
```

- `identity [route ...]` checks D1 on served routes (default `/resume/`): `html`, `body` and the outermost container on `#151513`, headings on the self-hosted face, and every hex in the page's CSS declared in `tokens.css`.
- `font-gate` proves the font contract above in a real browser: preload and same-origin woff2, `fonts-ready` only after the face is loaded, gated elements hidden while the font is held, settled visible on abort and on timeout.
- `home-contacts` proves the home composition on `/`: contacts 0-4px at seven sizes in Chrome and Firefox, no lime pixels around the shirt, no composition on fallback metrics, links reachable (verify-resume SKILL.md "Home-contacts drive").
- `screenshots` captures full-page PNGs (1440 and 390 wide) and a computed-style fingerprint of every element for `/`, `/resume/`, `/readme/`, `/projects/`, `/factory/`. Capture a baseline on the unchanged tree before editing, then compare. A pure refactor must show zero diffs; every non-zero diff must be an intended change you can name. Pages you do not own must be zero. Not covered: hover/focus states, post-click JS states, `/factory/a` and `/factory/b` prototypes, and layout width (the fingerprint has no `width`/`max-width`; check the PNGs).
- Always also run `npm run gate` (typecheck, build, projects verifier).

Centralization check: grep for `#hex` / `rgb(a)`, raw `rem|px` in `margin|padding|gap`, and raw `rem|px|clamp` in `font-size`, across `src/layouts/BaseLayout.astro`, the four pages and `src/components/{resume,projects}/`; remaining hits need a justification.
