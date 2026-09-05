# Verification inventory — resume (Astro personal site)

Per-repo inventory of verification mechanisms and their fit profiles. Consult when picking a feedback loop or authoring a `## Verification target` (closed records carry the older `## Harness target`; both spellings read). Seeded 2026-06-26 from the resume-9mf positioning increment.

## Mechanisms available

- `npm run build` (`astro build`) — compiles all routes; catches syntax/import/type errors. Necessary, never goal-faithful on its own.
- `npm run test:projects` (`scripts/verify-projects-page.mjs`) — asserts rendered `dist/projects/index.html` content (entry titles, repo links, built/build-on tags, legacy-absence). Rewrite its assertions whenever the projects data shape changes — it hard-codes expected strings.
- Cloudflare Pages preview — per `resume-cloudflare-preview-route-content-check` memory, verify each route (`/`, `/resume/`, `/readme/`, `/projects/`, `/factory/`) for route-specific content, not just HTTP 200 / homepage.

## Fit profiles

### copy-and-positioning

**Work surface:** Public-facing positioning pages (flagship, homepage, about) where the strategic signal is thesis legibility + credibility, not code correctness.

**Why build-green alone fails here:** A green build confirms the route compiles; it passes even if the copy overclaims authorship, the thesis fails to land on a cold reader, or a claim implies linkable public proof that does not exist. These are the failure modes that actually matter for a persuasion-targeted page aimed at a skeptical technical audience.

**Recommended harness — cold-context read-back:** Dispatch a fresh reviewer with NO prior exposure to the brainstorm/design to read the BUILT HTML and report: (a) one-sentence thesis recovered; (b) any authorship overclaim vs the mine-vs-composed ledger in the bead design; (c) any claim that implies a public/linkable proof artifact the page does not actually link; (d) blunt credibility read — differentiated builder vs generic noise. Gate on all four: (a) must match the intended thesis, (b)(c) must return zero, (d) must be affirmative.

**Altitude this catches:** Thesis-transmission failure, authorship overclaim, implied-but-unlinked public-proof, positioning coherence with the stated audience. All invisible to `npm run build` and to a reviewer who helped write the page.

**Invalidation:** Wrong if the cold reviewer is handed the thesis in advance (a is then circular). Also wrong if the mine-vs-composed ledger used as the (b) check is itself unverified — verify the ledger independently before the read-back runs. Validated on resume-9mf.5 (`/factory/` flagship): cold reader recovered the intended thesis and returned a "clearly-a-builder" credibility read with zero clean overclaims.

### visual-equivalence refactor (design tokens / CSS systematization)

**Work surface:** "Hold the look constant" refactors — extracting literals into tokens, centralizing CSS — where intent is to change implementation, not appearance.

**Recommended harness:** For a pure value-preserving rename, analytical value-equality (every token equals the literal it replaced → computed styles identical by construction) is a STRONGER signal than noisy before/after screenshot diffing. Pair with a grep for remaining un-tokenized literals (centralization check). Both required. Validated on resume-x1g; a fresh reviewer caught one real value drift (`#fff` → off-white) the value-equality check surfaced.

## Refactoring fit profile (gate manifest — dotpi-aut6.8, 2026-08-09)

RIDER (FIRM): non-visual refactoring only (build scripts, data plumbing, utilities); visual/copy/styling work parks for the human. NOTE 2026-08-09: www.jonatansnyders.com is still served by the LEGACY DJANGO stack living in this repo (`a_core/`, `templates/`, `node/` Tailwind pipeline) — the Astro site is the unfinished migration target. The Django app is LIVE: not a deletion candidate; migration completion is attended work (parked proposal bead).

- **Gate command:** `npm run build && npm run test:projects` (ran green 2026-08-09, offline with existing node_modules; build ~1s). NOTE: no `npm test` script exists — an earlier fleet inventory claimed one; wrong.
- **Gate files (fail-closed):** `scripts/verify-*.mjs`, `package.json` script definitions, `docs/projects-source-inventory.md` (asserted-against), plus any future test files. `scripts/verify-resume-layout.mjs` is visual + non-hermetic (headless Chrome) — never part of the dispatch gate.
- **D3 conformance:** partial — the build catches syntax/import breakage at a stable boundary and `test:projects` pins built-HTML content, but NOTHING type-checks (`@astrojs/check` not installed — typecheck gate bead filed; type-incompatible props currently build green).
- **Green-at-dispatch:** checked by the dispatching brain; result recorded on the dispatched bead.

## Agentic e2e (mechanism class added 2026-09-05 by `/verify scaffold`, dotpi-gtng.2)

- **`.agents/skills/verify-resume/`** — a per-project verification skill that drives the **real Astro site in a real browser** and keeps the evidence. Reached from Claude Code through the relative symlink `.claude/skills/verify-resume`; pi reads `.agents/skills/` directly, gated on project trust.

  **Commands:** `scripts/doctor` (read-only, is this worth driving), `scripts/launch` (build, then serve `dist/` on 127.0.0.1:4329), `scripts/seed` (nothing to seed — hermetic), `scripts/drive file-tree`, `scripts/cleanup` (stops only what launch started; evidence survives).

  **Speed:** ~4s for the full launch→drive→cleanup cycle, measured 2026-09-05 (launch incl. build 2s, doctor+drive 2s, cleanup <1s). Cheap enough to run on any change to a page's inline script.

  **Catches:** client-side behaviour that no static check can see. The `/resume/` file tree and the `/factory/` orbit graph are inline vanilla JS that rewrite the DOM on click with no URL or hash change — the served markup is byte-identical whether the handlers are wired or not. `npm run build` and `npm run test:projects` both pass on a page whose interactivity is completely dead.

  **Useful when:** changing anything under a page's inline `<script>`, refactoring the components those scripts query, or touching the data that generates the file tree (the drive discovers entries from the live DOM, so it fails honestly when the data shape moves rather than passing on a stale hardcoded list).

  **Less useful when:** the work is copy, positioning, or styling. Prefer the `copy-and-positioning` cold-context read-back above; a browser drive confirms the DOM moved, not that the writing lands. Also skip it for `/projects/` — `npm run test:projects` already covers that route faster and more deterministically.

  **Coverage today, stated honestly:** one mapped drive (`file-tree`). The `/factory/` orbit graph is the largest uncovered interactive surface and has no drive at all. See `.agents/skills/verify-resume/references/README.md`.

  **Evidence:** `.verify-evidence/<feature>-<timestamp>/` — two screenshots plus `evidence.json` holding the before state, after state, what was clicked, and every check's result. Gitignored; `cleanup` never deletes it.
