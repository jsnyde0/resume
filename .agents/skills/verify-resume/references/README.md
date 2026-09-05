# Feature map — resume (Astro site)

One file per user-facing feature, written from a **visitor's** point of view, each answering four questions: what it is, how to reach it, how to drive it, and what observable end state proves it works.

Seeded 2026-09-05 by `/verify scaffold` with the top five. This is a map, not an inventory of files — a feature is something a visitor does or sees.

| Feature | Route | Driven? |
|---|---|---|
| [Landing pitch](landing-pitch.md) | `/` | not yet — static, low value |
| [Resume file-tree browser](resume-file-tree.md) | `/resume/` | **yes** — `scripts/drive file-tree` |
| [Download-PDF joke](download-pdf-joke.md) | `/resume/` | not yet |
| [Projects list](projects-list.md) | `/projects/` | covered statically by `npm run test:projects` |
| [Factory orbit graph](factory-orbit-graph.md) | `/factory/` | **not yet — highest-value gap** |

## Where the coverage actually is

Two features are genuinely interactive: the file-tree browser and the orbit graph. Only the file tree has a mapped drive. **The orbit graph is the biggest hole in this map** — it is the most complex client-side behaviour on the site and nothing verifies it at all today.

The three static features are cheap to check and mostly already are: `npm run test:projects` pins `/projects/` content, and `npm run build` catches compile breakage everywhere. Adding browser drives for them would buy little; they are listed so the map is honest about what exists, not because each needs a drive.

## Adding a drive

See `../recipes/drive-a-feature.md`.
