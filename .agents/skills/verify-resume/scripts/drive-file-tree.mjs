#!/usr/bin/env node
// drive-file-tree.mjs — drive the /resume/ file-tree browser and capture evidence.
//
// WHY THIS FEATURE. The tree is inline vanilla JS with no URL or hash change:
// expanding a folder and clicking a file rewrite the DOM in place. Nothing about
// it is visible to a static-HTML check, which is what `npm run test:projects`
// does. This is the gap the agentic-e2e mechanism fills.
//
// THE REAL USER PATH, AND WHY IT IS LOAD-BEARING HERE. Every file except
// README.md starts inside a folder container carrying style="display:none". A
// visitor must click one or two folder toggles before any of them is reachable.
// An earlier version of this drive picked the first unselected entry in DOM
// order and called .click() on it directly -- a node no visitor could see. It
// passed all its checks while the entire folder-expand feature could have been
// dead, with a visitor able to reach no file but README.md. That is exactly the
// "green while broken" failure this skill exists to catch, so the drive now:
//
//   1. deliberately picks a file that is HIDDEN,
//   2. expands its folder chain by clicking the toggles a visitor clicks,
//   3. REFUSES to click a target that is still not visible,
//   4. then clicks it.
//
// Step 3 is the guard that stops the old bug coming back. Steps 1-2 mean this
// drive now covers the folder-expand behaviour too, which nothing covered before.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const ENGINE = process.env.VR_ENGINE;
const URL_BASE = process.env.VR_URL;
const EVIDENCE = process.env.VR_EVIDENCE;
if (!ENGINE || !URL_BASE || !EVIDENCE) {
  console.error("FAIL: run this through scripts/drive, which resolves VR_ENGINE / VR_URL / VR_EVIDENCE.");
  process.exit(1);
}

const LABEL = "verify-resume";
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = join(EVIDENCE, `file-tree-${stamp}`);
mkdirSync(outDir, { recursive: true });

const engine = (script, ...args) =>
  execFileSync("node", [join(ENGINE, script), ...args], { encoding: "utf8" });

// Checks are COUNTED, never announced as a literal. A hardcoded "checks run: N"
// silently lies the moment a check is added or removed -- inside the very block
// whose job is honest output reporting.
const checks = [];
const check = (ok, msg) => { checks.push({ ok: !!ok, msg }); return !!ok; };
const failures = () => checks.filter((c) => !c.ok).map((c) => c.msg);

const CAPTURE = `(() => {
  const els = Array.from(document.querySelectorAll('[data-ghv-path]'));
  const panels = Array.from(document.querySelectorAll('[data-ghv-panel]'));
  const crumb = document.getElementById('ghv-preview-path');
  return JSON.stringify({
    paths: els.map(e => e.getAttribute('data-ghv-path')),
    visiblePaths: els.filter(e => e.offsetParent !== null).map(e => e.getAttribute('data-ghv-path')),
    selected: els.filter(e => e.classList.contains('ghv-file--selected')).map(e => e.getAttribute('data-ghv-path')),
    ariaCurrent: els.filter(e => e.getAttribute('aria-current') === 'true').map(e => e.getAttribute('data-ghv-path')),
    visiblePanels: panels.filter(p => p.style.display !== 'none').map(p => p.getAttribute('data-ghv-panel')),
    breadcrumb: crumb ? crumb.textContent.trim() : null
  });
})()`;

// Pick a HIDDEN file and expand its folder chain the way a visitor would:
// outermost toggle first, each one found from the panel it controls.
const EXPAND = `(() => {
  const els = Array.from(document.querySelectorAll('[data-ghv-path]'));
  const target = els.find(e => e.offsetParent === null && !e.classList.contains('ghv-file--selected'));
  if (!target) return JSON.stringify({ error: 'no hidden file entry — the tree was already expanded, so this drive would not exercise the folder toggles' });
  const path = target.getAttribute('data-ghv-path');
  const chain = [];
  let n = target.parentElement;
  while (n && n !== document.body) {
    if (n.classList && n.classList.contains('ghv-folder-files')) chain.unshift(n);
    n = n.parentElement;
  }
  const toggles = chain.map(p =>
    document.querySelector('[aria-controls="' + p.id + '"]') ||
    document.querySelector('[data-ghv-subfolder-panel="' + p.id + '"]'));
  const clickedToggles = [];
  toggles.forEach((t, i) => {
    if (!t) return;
    if (chain[i].style.display === 'none') {
      t.click();
      clickedToggles.push(t.getAttribute('data-ghv-folder-toggle') || t.getAttribute('data-ghv-subfolder-toggle'));
    }
  });
  return JSON.stringify({
    path,
    panelsInChain: chain.length,
    togglesFound: toggles.filter(Boolean).length,
    clickedToggles,
    ariaExpanded: toggles.filter(Boolean).map(t => t.getAttribute('aria-expanded')),
    nowVisible: target.offsetParent !== null
  });
})()`;

const clickExpr = (path) => `(() => {
  const el = document.querySelector('[data-ghv-path="${path}"]');
  if (!el) return JSON.stringify({ error: 'target vanished from the DOM' });
  if (el.offsetParent === null) return JSON.stringify({ error: 'target is still not visible — refusing to click what a visitor cannot see' });
  el.click();
  return JSON.stringify({ clicked: '${path}' });
})()`;

const shot = (name) => {
  const printed = engine("screenshot.js", `--label=${LABEL}`).trim();
  const src = printed.split("\n").filter((l) => l.includes(".png")).pop().trim();
  const dest = join(outDir, name);
  copyFileSync(src, dest);
  return dest;
};

// Normalise the breadcrumb to a comparable path. The page renders
// "dir/sub / file.md"; a basename-only check would pass on a wrong directory
// prefix, and this tree has FOUR duplicated basenames across directories
// (mapular.md, moonbird.md, humainly.md, kuleuven.md each live in two places),
// so basename-only is not a theoretical weakness here.
const normaliseCrumb = (s) => (s || "").replace(/\s*\/\s*/g, "/").trim();

let before = null, after = null, expand = null, clicked = null;
let beforeShot = null, midShot = null, afterShot = null;
let crashed = null;

try {
  console.log(`==> engine   ${ENGINE}`);
  console.log(`==> target   ${URL_BASE}/resume/`);
  console.log(`==> evidence ${outDir}`);
  console.log();

  engine("start.js");

  // Reuse the labelled tab across runs rather than opening a new one each time.
  // `nav.js --new` every run orphans the previous tab: the label sidecar is
  // overwritten and nothing ever closes the old one, so N runs leak N tabs.
  try {
    engine("nav.js", `${URL_BASE}/resume/`, `--label=${LABEL}`);
  } catch {
    engine("nav.js", `${URL_BASE}/resume/`, "--new", `--label=${LABEL}`);
  }
  engine("wait.js", `--label=${LABEL}`, "--selector=.ghv-shell");

  before = JSON.parse(engine("eval.js", `--label=${LABEL}`, CAPTURE).trim());
  beforeShot = shot("01-before.png");

  check(before.paths.length > 0, "the tree rendered no file entries at all");
  check(before.selected.length === 1,
    `expected exactly 1 selected entry before the click, got ${before.selected.length}`);
  check(before.visiblePanels.length === 1,
    `expected exactly 1 visible panel before the click, got ${before.visiblePanels.length}`);
  check(before.visiblePaths.length < before.paths.length,
    "every file entry was already visible — folders start collapsed, so this means the collapse is broken or the markup changed");

  // --- the real user path: expand, then click ---
  expand = JSON.parse(engine("eval.js", `--label=${LABEL}`, EXPAND).trim());
  if (expand.error) throw new Error(expand.error);

  check(expand.panelsInChain > 0,
    `the chosen file ${expand.path} sits in no folder container — it should have been reachable already`);
  check(expand.togglesFound === expand.panelsInChain,
    `found ${expand.togglesFound} toggles for ${expand.panelsInChain} collapsed containers — a folder panel has no control`);
  check(expand.clickedToggles.length > 0,
    "no folder toggle needed clicking, so the drive never exercised the expand behaviour");
  check(expand.ariaExpanded.every((v) => v === "true"),
    `after expanding, aria-expanded should be true on every toggle, got ${JSON.stringify(expand.ariaExpanded)}`);
  check(expand.nowVisible === true,
    `${expand.path} is still not visible after clicking its folder toggles — the expand handlers are not working`);

  midShot = shot("02-expanded.png");

  const clickResult = JSON.parse(engine("eval.js", `--label=${LABEL}`, clickExpr(expand.path)).trim());
  if (clickResult.error) throw new Error(clickResult.error);
  clicked = clickResult.clicked;

  let waitTimedOut = false;
  try {
    engine("wait.js", `--label=${LABEL}`, "--timeout=10000",
      `--fn=document.querySelector('[data-ghv-path="${clicked}"]').classList.contains('ghv-file--selected')`);
  } catch {
    waitTimedOut = true;
  }
  check(!waitTimedOut,
    `the click on ${clicked} never moved the selection (wait timed out) — the file click handler is probably not wired`);

  after = JSON.parse(engine("eval.js", `--label=${LABEL}`, CAPTURE).trim());
  afterShot = shot("03-after.png");

  // The four observables the click handler moves, each checked against the path
  // that was actually clicked -- not merely "something changed".
  check(after.selected.length === 1 && after.selected[0] === clicked,
    `selected entry should be ${clicked}, got ${JSON.stringify(after.selected)}`);
  check(after.ariaCurrent.length === 1 && after.ariaCurrent[0] === clicked,
    `aria-current should be ${clicked}, got ${JSON.stringify(after.ariaCurrent)}`);
  check(after.visiblePanels.length === 1 && after.visiblePanels[0] === clicked,
    `visible panel should be ${clicked}, got ${JSON.stringify(after.visiblePanels)}`);
  check(normaliseCrumb(after.breadcrumb) === clicked,
    `breadcrumb should resolve to the FULL path ${clicked}, got ${JSON.stringify(after.breadcrumb)} (normalised: ${JSON.stringify(normaliseCrumb(after.breadcrumb))})`);
} catch (e) {
  crashed = e && e.message ? e.message : String(e);
} finally {
  // Evidence is written on EVERY path, including a crash. A run that dies
  // without leaving evidence is precisely the run whose evidence a reader wants.
  const failed = failures();
  const evidence = {
    feature: "resume file-tree browser (expand a folder, then open a file)",
    route: `${URL_BASE}/resume/`,
    ranAt: new Date().toISOString(),
    filesDiscovered: before ? before.paths : null,
    visibleBefore: before ? before.visiblePaths : null,
    expand,
    clicked,
    before,
    after,
    screenshots: [beforeShot, midShot, afterShot].filter(Boolean),
    checksRun: checks.length,
    checks,
    crashed,
    failures: failed,
    result: crashed || failed.length ? "fail" : "pass",
  };
  const evidencePath = join(outDir, "evidence.json");
  writeFileSync(evidencePath, JSON.stringify(evidence, null, 2) + "\n");

  // Report the OUTPUT, not just an exit code. A reader who sees only "exit 0"
  // cannot tell a real drive from a run that discovered nothing and asserted
  // nothing -- so the populations and the observed values are printed.
  if (before) {
    console.log(`files discovered : ${before.paths.length}`);
    console.log(`visible at start : ${before.visiblePaths.length}  ${JSON.stringify(before.visiblePaths)}`);
  }
  if (expand) {
    console.log(`chosen (hidden)  : ${expand.path}`);
    console.log(`folders opened   : ${JSON.stringify(expand.clickedToggles)}  (chain depth ${expand.panelsInChain})`);
    console.log(`aria-expanded    : ${JSON.stringify(expand.ariaExpanded)}`);
    console.log(`now visible      : ${expand.nowVisible}`);
  }
  if (clicked) console.log(`clicked          : ${clicked}`);
  if (after) {
    console.log(`selected after   : ${JSON.stringify(after.selected)}`);
    console.log(`aria-current     : ${JSON.stringify(after.ariaCurrent)}`);
    console.log(`visible panel    : ${JSON.stringify(after.visiblePanels)}`);
    console.log(`breadcrumb       : ${JSON.stringify(after.breadcrumb)} -> ${JSON.stringify(normaliseCrumb(after.breadcrumb))}`);
  }
  console.log(`checks run       : ${checks.length}`);
  console.log(`screenshots      : ${evidence.screenshots.join("\n                   ")}`);
  console.log(`evidence         : ${evidencePath}`);
  console.log();

  if (crashed) console.log(`CRASHED: ${crashed}`);
  if (failed.length) {
    console.log(`DRIVE-RESULT: fail (${failed.length})`);
    for (const f of failed) console.log(`  - ${f}`);
  } else if (!crashed) {
    console.log("DRIVE-RESULT: pass");
  }
  process.exit(crashed || failed.length ? 1 : 0);
}
