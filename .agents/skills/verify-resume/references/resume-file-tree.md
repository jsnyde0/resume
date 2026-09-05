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

`scripts/drive file-tree` runs `drive-file-tree.mjs`, which navigates a real Chrome to `/resume/`, waits for `.ghv-shell`, captures the tree's full state, clicks the first file that is **not** currently selected, waits for the selection to actually move, and captures the state again.

The file list is **discovered from the live DOM**, never hardcoded — the tree is generated from repo data, so a fixed list would rot on the next data change and would report as a broken feature.

## What observable end state proves it works

A click must move **four** things, and they must all name the same file:

1. the clicked entry gains the `ghv-file--selected` class, and it is the only entry with it;
2. that entry's `aria-current` becomes `true`, and it is the only one;
3. the matching `[data-ghv-panel]` becomes the only visible panel (the others get `display: none`);
4. the breadcrumb `#ghv-preview-path` names that file.

Plus: the selection must have actually left the previously selected file. That last check is what stops the drive passing on a page where nothing happened.

All four matter separately. The handler sets them in separate statements, so a half-broken feature — panel swaps, breadcrumb does not — passes any single-observable check while looking obviously wrong to a visitor.

**None of this is visible to a static-HTML check.** The markup is byte-identical whether the click handlers are wired or not, which is exactly why this feature needs a browser and `npm run test:projects` cannot help.
