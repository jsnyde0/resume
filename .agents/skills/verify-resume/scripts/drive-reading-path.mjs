#!/usr/bin/env node
// drive-reading-path.mjs — the /resume/ cross-folder reading path, deep links and folder counts.
//
// Implements resume-soe.12 Verification target Signal 2 (bead resume-soe.3):
//
//   (a) READING PATH at 390x844 and 768x1024 (the <=860px accordion, touch): from a fresh
//       /resume/, open experience/<first>.md, then achievements/<first>.md. Every tap is a real
//       touchscreen tap at a target a visitor can hit RIGHT NOW (lib.mjs visitorPress refuses
//       off-screen or covered targets), and the drive never scrolls. Green: <=3 taps total, and
//       after each file opens, THAT file's first content line is in the viewport and not under the
//       pinned row. The first-line check is keyed to the opened file's own panel, so the page
//       auto-scrolling some other file into view cannot satisfy it.
//   (b) DEEP LINK #skills/<sub>/<file>.md at 390x844 (accordion) and 1440x900 (two-pane): the file
//       opens on arrival, is the one current file and one visible panel, and its first line is
//       readable; two-pane also shows the full path line, accordion puts it inline under its row.
//   (c) COUNTS: every folder's displayed file count equals the files listed under it.
//
// File names are discovered from the live DOM, never hardcoded.

import {
  LABEL, URL_BASE, checker, evidenceDir, fileSel, folderSel, load, openTab, panelSel,
  reach, reachFirstLine, releaseTab, report, setLayout, state, visitorPress, writeEvidence,
} from "./lib.mjs";
import { join } from "node:path";

const MAX_TAPS = 3;
const PATH_LAYOUTS = [
  { name: "390x844", width: 390, height: 844 },
  { name: "768x1024", width: 768, height: 1024 },
];
const LINK_LAYOUTS = [
  { name: "390x844", width: 390, height: 844, touch: true, twoPane: false },
  { name: "1440x900", width: 1440, height: 900, touch: false, twoPane: true },
];

const outDir = evidenceDir("reading-path");
const C = checker();
const { check } = C;
const paths = [], links = [];
let counts = null, crashed = null, browser, page;

// Open one file as a visitor: tap the row if reachable; otherwise tap its (collapsed) section
// heading first, if THAT is reachable. Anything else would need a scroll, which fails the run.
async function openAsVisitor(target, log, tag) {
  const section = target.split("/")[0];
  const row = await reach(page, fileSel(target));
  if (!(row.inView && row.onTop)) {
    const expanded = await page.evaluate((s) => document.querySelector(s)?.getAttribute("aria-expanded"), folderSel(section));
    if (expanded === "true") throw new Error(`${tag} ${target} is listed in an open section but off-screen — reaching it needs a scroll`);
    await visitorPress(page, folderSel(section), true);
    log.push({ tap: `section ${section}`, scrollY: await page.evaluate(() => scrollY) });
  }
  await visitorPress(page, fileSel(target), true);
  log.push({ tap: target, scrollY: await page.evaluate(() => scrollY) });
  const s = await state(page);
  const first = await reachFirstLine(page, target);
  check(s.visiblePanels.length === 1 && s.visiblePanels[0] === target,
    `${tag} after tapping ${target} the one open file should be it, got ${JSON.stringify(s.visiblePanels)}`);
  check(s.hash === target, `${tag} hash should be #${target}, got #${s.hash}`);
  check(first.exists && first.inView && first.onTop,
    `${tag} ${target}: its first content line is not readable in the viewport without scrolling: ${JSON.stringify(first)}`);
  return { state: s, first };
}

try {
  console.log(`==> target   ${URL_BASE}/resume/   (tab label ${LABEL})`);
  console.log(`==> evidence ${outDir}`);
  ({ browser, page } = await openTab("/resume/"));

  // (a) reading path
  for (const L of PATH_LAYOUTS) {
    const tag = `[path ${L.name}]`;
    const run = { layout: L.name, taps: [] };
    paths.push(run);
    await setLayout(page, L.width, L.height);
    await page.goto("about:blank");
    await load(page, "/resume/");
    const all = (await state(page)).paths;
    run.a = all.find((p) => p.startsWith("experience/"));
    run.b = all.find((p) => p.startsWith("achievements/"));
    if (!run.a || !run.b) throw new Error(`${tag} could not discover experience/ and achievements/ files: ${JSON.stringify(all)}`);
    await page.screenshot({ path: join(outDir, `path-${L.name}-0-arrival.png`) });

    const A = await openAsVisitor(run.a, run.taps, tag);
    run.afterA = { firstLine: A.first, scrollY: A.state.scrollY };
    await page.screenshot({ path: join(outDir, `path-${L.name}-1-${run.a.replace(/\//g, "_")}.png`) });
    const B = await openAsVisitor(run.b, run.taps, tag);
    run.afterB = { firstLine: B.first, scrollY: B.state.scrollY };
    await page.screenshot({ path: join(outDir, `path-${L.name}-2-${run.b.replace(/\//g, "_")}.png`) });

    check(run.taps.length <= MAX_TAPS, `${tag} ${run.a} then ${run.b} took ${run.taps.length} taps (max ${MAX_TAPS}): ${run.taps.map((t) => t.tap).join(" -> ")}`);
    console.log(`${tag} ${run.taps.length} taps: ${run.taps.map((t) => t.tap).join(" -> ")}`);
    console.log(`${"".padEnd(16)} A first line "${A.first.text}" y=${Math.round(A.first.top)}; B first line "${B.first.text}" y=${Math.round(B.first.top)}; test-issued scrolls 0`);
  }

  // (b) deep links
  for (const L of LINK_LAYOUTS) {
    const tag = `[link ${L.name}]`;
    await setLayout(page, L.width, L.height);
    await page.goto("about:blank");
    await load(page, "/resume/");
    const target = (await state(page)).paths.find((p) => /^skills\/[^/]+\/[^/]+\.md$/.test(p));
    if (!target) throw new Error(`${tag} no skills/<sub>/<file>.md in the tree`);
    await page.goto("about:blank");
    await load(page, `/resume/#${target}`);
    const s = await state(page);
    const first = await reachFirstLine(page, target);
    const run = { layout: L.name, target, state: s, firstLine: first };
    links.push(run);
    await page.screenshot({ path: join(outDir, `link-${L.name}.png`) });
    check(s.ariaCurrent.length === 1 && s.ariaCurrent[0] === target, `${tag} #${target} should make it the one current file, got ${JSON.stringify(s.ariaCurrent)}`);
    check(s.visiblePanels.length === 1 && s.visiblePanels[0] === target, `${tag} #${target} should open that panel alone, got ${JSON.stringify(s.visiblePanels)}`);
    check(first.exists && first.inView && first.onTop, `${tag} #${target}: first content line not readable on arrival: ${JSON.stringify(first)}`);
    if (L.twoPane) {
      check(s.crumbs.length === 1 && s.crumbs[0] === target, `${tag} path line should read the full ${target}, got ${JSON.stringify(s.crumbs)}`);
    } else {
      run.inline = await page.evaluate((f, p) => document.querySelector(f)?.nextElementSibling === document.querySelector(p), fileSel(target), panelSel(target));
      check(run.inline, `${tag} #${target}'s panel should sit inline under its own row`);
    }
    console.log(`${tag} #${target} -> current ${JSON.stringify(s.ariaCurrent)}, first line "${first.text}" y=${Math.round(first.top ?? -1)}`);
  }

  // (c) per-folder counts vs files listed
  counts = await page.evaluate(() =>
    [...document.querySelectorAll("#tree .folder-toggle")].map((t) => {
      const list = document.getElementById(t.getAttribute("aria-controls"));
      return {
        folder: t.dataset.folder,
        shown: Number((t.querySelector(".count")?.textContent ?? "").trim()),
        listed: list ? list.querySelectorAll("button[data-path]").length : -1,
      };
    }));
  check(counts.length >= 4, `expected at least 4 folders with counts, found ${counts.length}`);
  for (const c of counts) check(c.shown === c.listed && c.listed > 0, `${c.folder}/ shows ${c.shown} files but lists ${c.listed}`);
  console.log(`[counts] ${counts.map((c) => `${c.folder} ${c.shown}/${c.listed}`).join(", ")}`);
} catch (e) {
  crashed = e && e.message ? e.message : String(e);
} finally {
  await releaseTab(browser, page);
  const failed = C.failures();
  const evidencePath = writeEvidence(outDir, {
    feature: "resume reading path (<=3 taps, no scroll), deep links in both layouts, folder counts",
    route: `${URL_BASE}/resume/`,
    ranAt: new Date().toISOString(),
    maxTaps: MAX_TAPS,
    paths,
    links,
    counts,
    checksRun: C.checks.length,
    checks: C.checks,
    crashed,
    failures: failed,
    result: crashed || failed.length ? "fail" : "pass",
  });
  process.exit(report(C, crashed, evidencePath));
}
