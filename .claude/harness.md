# Harness inventory — resume (Astro personal site)

Per-repo inventory of verification mechanisms and their fit profiles. Consult when picking a feedback loop or authoring a `## Harness target`. Seeded 2026-06-26 from the resume-9mf positioning increment.

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
