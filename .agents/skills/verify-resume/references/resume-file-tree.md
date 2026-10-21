# Resume repo explorer

## What it is

`/resume/` presents the CV as a repository you browse (design: bead `resume-soe.12` D5). `README.md` is the landing file; the folders `experience/`, `achievements/`, `skills/` (with subfolders) and `education/` each show a file count; every item is a file you open; every open file has a shareable `#path` deep link.

- **Desktop (>860px):** two panes. The lime section words on the left are the tree; the open file is set like poster type on the right, with its full path above it.
- **<=860px:** an accordion. One section and one file open at a time; the file opens inline directly under its own row; that row turns pink, is marked open, and stays pinned to the top while you read. Tapping it again folds it away.

## How to reach it

Navigate to `/resume/`. No login, no state. Desktop arrives with `README.md` open; both layouts arrive with `experience/` expanded, so one tap reads a file. `/resume/#<path>` opens that file on arrival.

## How to drive it with this project's harness

```bash
scripts/launch
scripts/doctor
scripts/drive file-tree
scripts/drive reading-path
scripts/drive identity
scripts/cleanup
```

All presses go through `visitorPress` in `scripts/lib.mjs`: a real mouse click (desktop) or touchscreen tap (<=860px) at the target's centre, refused unless the target is in the viewport and on top at that point. No drive ever scrolls. File names are **discovered from the live DOM**, never hardcoded.

- **`file-tree`**, at 1440x900 and 390x844: picks the deepest *hidden* file (a `skills/<sub>/<file>.md`), presses the folder toggles that reveal it, outermost first, then presses the file.
- **`reading-path`** (bead `resume-soe.12` Verification target Signal 2): at 390x844 and 768x1024, from a fresh load, opens `experience/<first>.md`, then `achievements/<first>.md`, counting taps; loads `#skills/<sub>/<file>.md` at 390x844 and 1440x900; compares every folder's count with the files listed under it.
- **`identity`**: Signal 3 for `/resume/` (see `SKILL.md`).

## What observable end state proves it works

**Expanding a folder chain:** each toggle's `aria-expanded` becomes `true`, and the file becomes reachable by a visitor (in view, on top). `aria-expanded` can flip while the list stays hidden; only the reachability check catches that.

**Opening a file** moves all of these, each naming the same path:

1. `aria-current="true"` on exactly that file's button;
2. its `[data-panel]` is the only visible panel;
3. `location.hash` is `#<path>`;
4. the file's first content line is in the viewport and not under the pinned row (hit-tested);
5. two-pane: the panel's path line reads the **full** path (four basenames each live in two directories, so a basename check is not enough); accordion: the panel sits directly after its own row, which is `aria-expanded="true"` and inside `li.is-open`.

**Reading path:** <=3 taps from arrival to reading the achievements file, with no test-issued scroll. The first-line check is keyed to the opened file's own panel, so the page scrolling some other file into view cannot satisfy it.

**Known dependency:** the 3-tap path holds because the first experience file is short enough that the `Achievements` heading stays on screen after it opens. A long first experience file would push the heading off-screen, and the drive would fail with "not reachable without scrolling". That failure is real: a visitor would have to scroll.

## Why the reachability guard is not optional

An earlier drive clicked the first unselected entry in DOM order: a node inside a collapsed folder that no visitor could see. It passed every check while the folder-expand handlers could have been dead. **That is the exact "green while broken" failure this skill exists to catch.** Mutation check run when the guard was rewritten (resume-soe.3): with the folder-toggle handler disabled, both `file-tree` and `reading-path` fail with "not reachable without scrolling".

**None of this is visible to a static-HTML check.** The markup is byte-identical whether the handlers are wired or not.
