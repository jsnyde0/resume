# Projects list

## What it is

`/projects/` lists the author's built projects as cards, each with a title, a tag chip (built / company / in-progress) and an outbound link. It is the portfolio proper.

## How to reach it

Navigate to `/projects/`. Linked from the site nav.

## How to drive it with this project's harness

**Already covered, and not by this skill.** `npm run test:projects` (`scripts/verify-projects-page.mjs`) reads `dist/projects/index.html` off disk after a build and asserts the content directly. No browser, no server, about a second.

```bash
npm run build && npm run test:projects
```

Prefer it. The page is fully static, so a browser adds cost and flakiness and buys nothing. Adding a drive here would be duplicated coverage at a slower, less deterministic altitude.

## What observable end state proves it works

The existing script already asserts the right things: the page title and the on-page `<h1>Building</h1>`, every project title present, the required outbound and internal links, the five required sections of the companion inventory doc — and, importantly, a set of **negative** assertions that legacy Django-era content is gone (old project titles, old image assets, carousel markup, template-engine leftovers).

Those negative assertions are the interesting half: this script doubles as a migration-completeness check for the route. Read them before changing the projects data, because they hard-code expected strings and will need rewriting whenever the data shape moves.
