#!/usr/bin/env node
// drive-file-tree.mjs — drive the /resume/ file-tree browser and capture evidence.
//
// WHY THIS FEATURE. The tree is inline vanilla JS with no URL or hash change:
// clicking a file swaps the preview panel entirely in the DOM. Nothing about it
// is visible to a static-HTML check, which is exactly what the existing
// `npm run test:projects` does. This is the gap the agentic-e2e mechanism fills.
//
// WHAT IT ASSERTS. Not "the page loaded". It captures the state before the
// click and after it, and requires all FOUR observables the handler is supposed
// to move to have actually moved, and to agree with each other on the path that
// was clicked:
//   - the selected file entry (class ghv-file--selected)
//   - aria-current on that entry
//   - which panel is visible (data-ghv-panel, display toggled)
//   - the breadcrumb text (#ghv-preview-path)
// Any one of those alone would pass while the feature was half broken.
//
// The file list is DISCOVERED from the live DOM, never hardcoded: the tree is
// generated from repo data, so a hardcoded path list would rot the first time
// the data changed and would fail as if the feature broke.

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

const CAPTURE = `(() => {
  const els = Array.from(document.querySelectorAll('[data-ghv-path]'));
  const panels = Array.from(document.querySelectorAll('[data-ghv-panel]'));
  const crumb = document.getElementById('ghv-preview-path');
  return JSON.stringify({
    paths: els.map(e => e.getAttribute('data-ghv-path')),
    selected: els.filter(e => e.classList.contains('ghv-file--selected')).map(e => e.getAttribute('data-ghv-path')),
    ariaCurrent: els.filter(e => e.getAttribute('aria-current') === 'true').map(e => e.getAttribute('data-ghv-path')),
    visiblePanels: panels.filter(p => p.style.display !== 'none').map(p => p.getAttribute('data-ghv-panel')),
    breadcrumb: crumb ? crumb.textContent.trim() : null
  });
})()`;

const CLICK = `(() => {
  const els = Array.from(document.querySelectorAll('[data-ghv-path]'));
  const target = els.find(e => !e.classList.contains('ghv-file--selected'));
  if (!target) return JSON.stringify({ error: 'no unselected file entry in the tree' });
  const path = target.getAttribute('data-ghv-path');
  target.click();
  return JSON.stringify({ clicked: path });
})()`;

const shot = (name) => {
  const printed = engine("screenshot.js", `--label=${LABEL}`).trim();
  const src = printed.split("\n").filter((l) => l.includes(".png")).pop().trim();
  const dest = join(outDir, name);
  copyFileSync(src, dest);
  return dest;
};

const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); return ok; };

console.log(`==> engine   ${ENGINE}`);
console.log(`==> target   ${URL_BASE}/resume/`);
console.log(`==> evidence ${outDir}`);
console.log();

engine("start.js");
engine("nav.js", `${URL_BASE}/resume/`, "--new", `--label=${LABEL}`);
engine("wait.js", `--label=${LABEL}`, "--selector=.ghv-shell");

const before = JSON.parse(engine("eval.js", `--label=${LABEL}`, CAPTURE).trim());
const beforeShot = shot("01-before.png");

check(before.paths.length > 0, "the tree rendered no file entries at all");
check(before.selected.length === 1, `expected exactly 1 selected entry before the click, got ${before.selected.length}`);
check(before.visiblePanels.length === 1, `expected exactly 1 visible panel before the click, got ${before.visiblePanels.length}`);

const clickResult = JSON.parse(engine("eval.js", `--label=${LABEL}`, CLICK).trim());
if (clickResult.error) {
  console.error(`FAIL: ${clickResult.error}`);
  process.exit(1);
}
const clicked = clickResult.clicked;

// The wait is the FIRST place a dead feature shows up, so its failure has to
// become a recorded check rather than a stack trace. A drive that crashes here
// writes no evidence at all -- which is precisely the run whose evidence a
// reader will want. Timing out is a real result: the selection never moved.
let waitTimedOut = false;
try {
  engine("wait.js", `--label=${LABEL}`, "--timeout=10000",
    `--fn=document.querySelector('[data-ghv-path="${clicked}"]').classList.contains('ghv-file--selected')`);
} catch {
  waitTimedOut = true;
  failures.push(`the click on ${clicked} never moved the selection (wait timed out) — the handler is probably not wired`);
}

const after = JSON.parse(engine("eval.js", `--label=${LABEL}`, CAPTURE).trim());
const afterShot = shot("02-after.png");

// The four observables the click is supposed to move, each checked against the
// path that was actually clicked -- not merely "something changed".
check(after.selected.length === 1 && after.selected[0] === clicked,
  `selected entry should be ${clicked}, got ${JSON.stringify(after.selected)}`);
check(after.ariaCurrent.length === 1 && after.ariaCurrent[0] === clicked,
  `aria-current should be ${clicked}, got ${JSON.stringify(after.ariaCurrent)}`);
check(after.visiblePanels.length === 1 && after.visiblePanels[0] === clicked,
  `visible panel should be ${clicked}, got ${JSON.stringify(after.visiblePanels)}`);
check(after.breadcrumb && after.breadcrumb.includes(clicked.split("/").pop()),
  `breadcrumb should name ${clicked}, got ${JSON.stringify(after.breadcrumb)}`);
check(before.selected[0] !== after.selected[0],
  `the click did not move the selection off ${before.selected[0]}`);

const evidence = {
  feature: "resume file-tree browser",
  route: `${URL_BASE}/resume/`,
  ranAt: new Date().toISOString(),
  filesDiscovered: before.paths,
  clicked,
  before,
  after,
  screenshots: [beforeShot, afterShot],
  waitTimedOut,
  failures,
  verdict: failures.length === 0 ? "pass" : "fail",
};
const evidencePath = join(outDir, "evidence.json");
writeFileSync(evidencePath, JSON.stringify(evidence, null, 2) + "\n");

// Report the OUTPUT, not just an exit code. A reader who sees only "exit 0"
// cannot tell a real drive from a run that discovered nothing and asserted
// nothing -- so the population and the observed values are printed.
console.log(`files discovered : ${before.paths.length}  ${JSON.stringify(before.paths)}`);
console.log(`selected before  : ${JSON.stringify(before.selected)}`);
console.log(`clicked          : ${clicked}`);
console.log(`selected after   : ${JSON.stringify(after.selected)}`);
console.log(`aria-current     : ${JSON.stringify(after.ariaCurrent)}`);
console.log(`visible panel    : ${JSON.stringify(after.visiblePanels)}`);
console.log(`breadcrumb       : ${JSON.stringify(after.breadcrumb)}`);
console.log(`checks run       : 9`);
console.log(`wait timed out   : ${waitTimedOut}`);
console.log(`screenshots      : ${beforeShot}`);
console.log(`                   ${afterShot}`);
console.log(`evidence         : ${evidencePath}`);
console.log();

if (failures.length) {
  console.log(`VERDICT: fail (${failures.length})`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log("VERDICT: pass");
