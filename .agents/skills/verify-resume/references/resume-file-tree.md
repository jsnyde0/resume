# Resume file-tree browser

## What it is

The `/resume/` page presents a CV as if it were a GitHub repository: a file tree on the left, a preview pane on the right, a breadcrumb above it. Clicking a "file" swaps the preview to that section — experience, achievements, education, skills. It is the page's central conceit, and the thing a visitor is most likely to actually play with.

## How to reach it

Navigate to `/resume/`. No login, no state, no prerequisite. The tree renders with `README.md` selected by default (`DEFAULT_PATH` in the page's inline script).

## How to drive it with this project's harness

```bash
scripts/launch
scripts/doctor
scripts/drive file-tree
scripts/cleanup
```

`scripts/drive file-tree` runs `drive-file-tree.mjs`, which navigates a real Chrome to `/resume/`, waits for `.ghv-shell`, captures the tree's full state, then walks the **real user path**: it deliberately picks a file that is currently *hidden*, clicks the folder toggles that reveal it — outermost first, each found from the panel it controls — checks it actually became visible, and only then clicks it.

The file list is **discovered from the live DOM**, never hardcoded — the tree is generated from repo data, so a fixed list would rot on the next data change and would report as a broken feature.

## What observable end state proves it works

Two behaviours, in order.

**Expanding a folder** must make the file reachable:

1. every collapsed container in the chain has a toggle that controls it;
2. each toggle's `aria-expanded` becomes `true`;
3. the file is genuinely visible afterwards (`offsetParent` is no longer null).

Point 3 is the one that matters. `aria-expanded` can flip to `true` while the panel stays `display: none` — that exact half-broken state was produced deliberately and only the visibility check caught it.

**Clicking the file** must then move four things, all naming the same path:

1. the clicked entry gains the `ghv-file--selected` class, and it is the only entry with it;
2. that entry's `aria-current` becomes `true`, and it is the only one;
3. the matching `[data-ghv-panel]` becomes the only visible panel;
4. the breadcrumb `#ghv-preview-path`, resolved back to a path, equals the **full** clicked path — directory prefix included. Basename alone is not enough: four basenames in this tree each live in two directories.

## Why the reachability half is not optional

An earlier version of this drive clicked the first unselected entry in DOM order. Every file except `README.md` starts inside a collapsed folder, so it was clicking a node no visitor could see. It passed every check while the folder-expand handlers could have been completely dead — a visitor able to open nothing at all. **That is the exact "green while broken" failure this whole skill exists to catch**, and it survived in the skill's own drive until an adversarial review found it.

**None of this is visible to a static-HTML check.** The markup is byte-identical whether the handlers are wired or not, which is why this feature needs a browser and `npm run test:projects` cannot help.
