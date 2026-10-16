# Design system

Single source for the site's visual values. Read this before touching CSS on `/`, `/resume/`, `/readme/`, `/projects/`, or `/factory/`.

## Where things live

- **Tokens:** `src/styles/tokens.css` (one `:root` block). Imported once by `src/layouts/BaseLayout.astro`, so every page, including `/factory/`, receives them. Edit tokens only there.
- **Global chrome** (navbar, footer, `.button`, hero, `.site-shell`, `.content-container`): `<style is:global>` in `BaseLayout.astro`, consuming tokens.
- **Page and component CSS:** scoped `<style>` in each `.astro` file, consuming tokens via `var(--name)`.

## Token families

| Family | Tokens |
|---|---|
| Site colour | `--base-100/200/300`, `--base-content`, `--muted-content`, `--primary`, `--primary-focus`, `--primary-content`, `--accent(-content)`, `--success(-content)`, `--info(-content)`, `--content-bright`, `--tooltip-bg/-text/-dark-bg` |
| Tints | `--surface-subtle`, `--border-subtle`, `--primary-tint`, `--info-tint` |
| Font | `--font-body`, `--font-mono`, `--line-height-body` (1.5), `--line-height-relaxed` (1.65) |
| Type scale, fixed | `--text-xs` .75rem, `--text-sm` .875rem, `--text-base` 1rem, `--text-prose-sm` .95rem, `--text-xl` 1.5rem, `--text-2xl` 1.875rem |
| Type scale, fluid | `--text-title` (page h1), `--text-lead` (intro paragraph), `--text-card-title`, `--text-hero`, `--text-hero-lead` |
| Spacing (n x 0.25rem) | `--space-1` .25, `-2` .5, `-3` .75, `-4` 1, `-5` 1.25, `-6` 1.5, `-8` 2, `-10` 2.5, `-12` 3 (rem) |
| Containers | `--container-prose` 42rem, `--container-narrow` 52rem (/projects/), `--container-content` 56rem (/resume/, /readme/, home), `--container-site` 80rem |
| Radius | `--radius-sm/md/lg/xl/full`, `--radius-button` |
| Shadow | `--shadow-card`, `--shadow-avatar` |
| Motion | `--transition-base` |
| Card surface | `--card-bg`, `--card-radius`, `--card-shadow`, `--card-padding`, `--card-padding-compact` (mobile) |

## /resume/ sub-palette (`--ghv-*`)

`/resume/` is a GitHub-viewer metaphor with a GitHub-dark palette. This is a deliberate sub-theme: it is its own token group and is never remapped onto the site palette. Use `--ghv-*` only inside the viewer (`.ghv-*` classes in `resume.astro`).

- Colours: `--ghv-canvas`, `--ghv-canvas-subtle`, `--ghv-border`, `--ghv-border-muted`, `--ghv-fg`, `--ghv-fg-muted`, `--ghv-fg-bright`, `--ghv-fg-on-emphasis`, `--ghv-accent`, `--ghv-accent-light`, `--ghv-accent-emphasis`, `--ghv-green`, `--ghv-btn-green(-hover)`.
- Tints: `--ghv-tint-control/-pill/-hover/-selected/-selected-hover/-code`, `--ghv-btn-border`, `--ghv-btn-progress`, `--ghv-spinner-track`.
- Radii: `--ghv-radius` 6px, `--ghv-radius-sm` 4px, `--ghv-radius-xs` 3px.

## Shared components

- `src/components/resume/ResumeCard.astro` (props: `title?: string`, `tooltip?: string`; default slot). The card surface, used by `/readme/`. Its surface values are the `--card-*` tokens.
- `src/components/projects/ProjectCard.astro` (prop: `project: ProjectEntry`). Same card surface via the same `--card-*` tokens, so the two cards cannot drift apart.

Class names are part of the verification fingerprint (below). Renaming or adding a class on an existing element shows up as a diff, so do it only on purpose.

## Rules for adding tokens

1. Additive only. Never rename or change the value of an existing token: `/factory/` consumes them and must not move.
2. Add a token when a value appears on two or more pages/components, or is a named step of a scale. A one-off value stays a literal in its own file.
3. Add it in `src/styles/tokens.css` under the matching family. Name by role or scale step (`--space-5`, `--card-padding`), never by value (`--orange`).
4. New colour: site colour goes in the Site colour block; anything for `/resume/`'s viewer goes in `--ghv-*`.
5. Update the table above in the same commit.
6. Prefer an existing token with an adjacent value over a new off-scale one; that is a consistency fix and must be named in the commit/ship-record.

## How to verify

Run from `.agents/skills/verify-resume` (details in its `SKILL.md`, "Screenshots drive"):

```
scripts/launch && scripts/drive screenshots && scripts/cleanup
scripts/compare <baselineDir> <afterDir>   # dirs under .verify-evidence/screenshots-<ts>/
```

The drive captures full-page PNGs (1440 and 390 wide) and a computed-style fingerprint of every element for `/`, `/resume/`, `/readme/`, `/projects/`, `/factory/`. Capture a baseline on the unchanged tree before editing, then compare. A pure refactor must show zero diffs; every non-zero diff must be an intended change you can name. `/factory/` must always be zero unless you own it. Not covered: hover/focus states, post-click JS states. Also run `npm run gate` (typecheck, build, projects verifier).

Centralization check: grep for `#hex` / `rgb(a)` and raw `rem|px` in `margin|padding|gap` across the page and component files; remaining hits need a justification.
