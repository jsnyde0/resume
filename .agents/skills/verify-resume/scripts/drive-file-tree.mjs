#!/usr/bin/env node
// drive-file-tree.mjs — drive the /resume/ repo explorer: expand a folder chain, open a file.
//
// WHY THIS FEATURE. The explorer is inline vanilla JS that rewrites the DOM in place: folders
// open, a panel is shown (desktop: in the right pane; <=860px: moved inline under its own row),
// the hash changes. A static-HTML check sees identical markup whether the handlers work or not.
//
// THE REAL USER PATH, AND WHY IT IS LOAD-BEARING. Most files start inside a collapsed folder
// (`ul.files[hidden]`). An earlier drive clicked a node no visitor could see and passed while the
// folder-expand feature could have been dead. So, in BOTH layouts (1440x900 two-pane, 390x844
// accordion), this drive:
//
//   1. deliberately picks a HIDDEN file, preferring the deepest one (skills/<sub>/<file>.md),
//   2. expands its folder chain by pressing the toggles a visitor presses, outermost first,
//   3. REFUSES to press anything a visitor could not hit right now: off-screen, covered, or
//      hidden targets fail (lib.mjs visitorPress: viewport + elementFromPoint hit-test),
//   4. presses the file, and requires every observable the press moves to name that path.
//
// Step 3 is the guard that stops the old bug coming back. The drive never scrolls.

import {
  LABEL, URL_BASE, checker, evidenceDir, fileSel, folderSel, load, openTab, panelSel,
  reach, reachFirstLine, releaseTab, report, setLayout, state, visitorPress, writeEvidence,
} from "./lib.mjs";
import { join } from "node:path";

const LAYOUTS = [
  { name: "desktop", width: 1440, height: 900, touch: false },
  { name: "mobile", width: 390, height: 844, touch: true },
];

const outDir = evidenceDir("file-tree");
const C = checker();
const { check } = C;
const runs = [];
let crashed = null, browser, page;

try {
  console.log(`==> target   ${URL_BASE}/resume/   (tab label ${LABEL})`);
  console.log(`==> evidence ${outDir}`);
  ({ browser, page } = await openTab("/resume/"));

  for (const L of LAYOUTS) {
    const run = { layout: L.name };
    runs.push(run);
    const tag = `[${L.name}]`;
    await setLayout(page, L.width, L.height);
    await load(page, "/resume/");

    const before = (run.before = await state(page));
    await page.screenshot({ path: join(outDir, `${L.name}-01-before.png`) });
    check(before.paths.length > 0, `${tag} the tree rendered no file entries`);
    check(before.visiblePaths.length < before.paths.length,
      `${tag} every file was already visible: folders start collapsed, so the collapse is broken or the markup changed`);
    if (L.name === "desktop") {
      check(before.ariaCurrent.length === 1 && before.ariaCurrent[0] === "README.md",
        `${tag} README.md should be the one current file on arrival, got ${JSON.stringify(before.ariaCurrent)}`);
      check(before.visiblePanels.length === 1 && before.visiblePanels[0] === "README.md",
        `${tag} README.md should be the one visible panel on arrival, got ${JSON.stringify(before.visiblePanels)}`);
    } else {
      check(before.visiblePanels.length <= 1, `${tag} more than one panel open on arrival: ${JSON.stringify(before.visiblePanels)}`);
    }

    // 1. the deepest hidden file
    const hidden = before.paths.filter((p) => !before.visiblePaths.includes(p));
    const target = hidden.sort((a, b) => b.split("/").length - a.split("/").length)[0];
    run.target = target;
    if (!target) throw new Error(`${tag} no hidden file to pick`);

    // 2-3. expand the chain as a visitor: outermost first, each press guarded
    const chain = target.split("/").slice(0, -1).map((_, i, a) => a.slice(0, i + 1).join("/"));
    run.chain = chain;
    run.pressedToggles = [];
    for (const folder of chain) {
      const open = await page.evaluate((s) => {
        const t = document.querySelector(s);
        const list = t && document.getElementById(t.getAttribute("aria-controls"));
        return { toggle: !!t, list: !!list, hidden: list ? list.hidden || list.offsetParent === null : null };
      }, folderSel(folder));
      check(open.toggle && open.list, `${tag} folder ${folder} has no toggle controlling a file list`);
      if (open.hidden) {
        await visitorPress(page, folderSel(folder), L.touch);
        run.pressedToggles.push(folder);
      }
    }
    check(run.pressedToggles.length > 0, `${tag} no folder toggle needed pressing, so the expand behaviour was never exercised`);
    run.ariaExpanded = await page.evaluate((sels) => sels.map((s) => document.querySelector(s)?.getAttribute("aria-expanded")), chain.map(folderSel));
    check(run.ariaExpanded.every((v) => v === "true"), `${tag} aria-expanded should be true along ${JSON.stringify(chain)}, got ${JSON.stringify(run.ariaExpanded)}`);
    const r = (run.targetReach = await reach(page, fileSel(target)));
    check(r.inView && r.onTop, `${tag} ${target} is not reachable after opening its folders (inView=${r.inView}, onTop=${r.onTop})`);
    await page.screenshot({ path: join(outDir, `${L.name}-02-expanded.png`) });

    // 4. open the file
    await visitorPress(page, fileSel(target), L.touch);
    const after = (run.after = await state(page));
    await page.screenshot({ path: join(outDir, `${L.name}-03-after.png`) });

    check(after.ariaCurrent.length === 1 && after.ariaCurrent[0] === target,
      `${tag} aria-current should be exactly ${target}, got ${JSON.stringify(after.ariaCurrent)}`);
    check(after.visiblePanels.length === 1 && after.visiblePanels[0] === target,
      `${tag} the one visible panel should be ${target}, got ${JSON.stringify(after.visiblePanels)}`);
    check(after.hash === target, `${tag} location.hash should deep-link ${target}, got ${JSON.stringify(after.hash)}`);
    const first = (run.firstLine = await reachFirstLine(page, target));
    check(first.exists && first.inView && first.onTop,
      `${tag} the opened file's first content line is not readable in the viewport: ${JSON.stringify(first)}`);

    if (L.name === "desktop") {
      // Whole path, never a basename: four basenames each live in two directories.
      check(after.crumbs.length === 1 && after.crumbs[0] === target,
        `${tag} the open panel's path line should read the FULL path ${target}, got ${JSON.stringify(after.crumbs)}`);
    } else {
      const inline = (run.inline = await page.evaluate((f, p) => {
        const b = document.querySelector(f), panel = document.querySelector(p);
        return { besideRow: !!b && b.nextElementSibling === panel, expanded: b?.getAttribute("aria-expanded"), rowOpen: !!b?.closest("li.is-open") };
      }, fileSel(target), panelSel(target)));
      check(inline.besideRow, `${tag} ${target}'s panel should sit inline directly under its own row`);
      check(inline.expanded === "true" && inline.rowOpen, `${tag} the open row should be aria-expanded and marked open, got ${JSON.stringify(inline)}`);
    }

    console.log(`${tag.padEnd(10)} files ${before.paths.length}, visible at start ${before.visiblePaths.length}`);
    console.log(`${"".padEnd(10)} chosen (hidden) ${target}; pressed ${JSON.stringify(run.pressedToggles)}`);
    console.log(`${"".padEnd(10)} current ${JSON.stringify(after.ariaCurrent)}, panel ${JSON.stringify(after.visiblePanels)}, hash #${after.hash}, crumb ${JSON.stringify(after.crumbs)}`);
    console.log(`${"".padEnd(10)} first line "${first.text}" at y=${Math.round(first.top ?? -1)}`);
  }
} catch (e) {
  crashed = e && e.message ? e.message : String(e);
} finally {
  await releaseTab(browser, page);
  const failed = C.failures();
  const evidencePath = writeEvidence(outDir, {
    feature: "resume explorer: expand a folder chain, open a file (desktop two-pane + mobile accordion)",
    route: `${URL_BASE}/resume/`,
    ranAt: new Date().toISOString(),
    runs,
    checksRun: C.checks.length,
    checks: C.checks,
    crashed,
    failures: failed,
    result: crashed || failed.length ? "fail" : "pass",
  });
  process.exit(report(C, crashed, evidencePath));
}
