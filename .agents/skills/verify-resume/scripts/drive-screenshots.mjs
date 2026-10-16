#!/usr/bin/env node
// drive-screenshots.mjs — full-page PNGs + computed-style fingerprints for the
// five routes at desktop (1440) and mobile (390), for before/after comparison.
//
// WHY. A refactor that is meant to change nothing visually (token/component
// consolidation) is only verifiable by diffing what the browser computed. This
// drive captures that state; `scripts/compare <before> <after>` diffs two runs.
//
// DETERMINISM IS THE CONTRACT (see SKILL.md "Screenshots drive" for the list):
//   - prefers-reduced-motion: reduce is emulated, and a style override kills
//     animation / transition / caret, so nothing is captured mid-flight.
//   - the page is only captured after document.fonts.ready and a settle delay.
//   - the fingerprint holds style values only, never text, so time-based copy
//     (footer build year) cannot enter it. The PNG does show that text.
//   - elements are keyed by a structural path, never by generated ids.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ENGINE = process.env.VR_ENGINE;
const URL_BASE = process.env.VR_URL;
const EVIDENCE = process.env.VR_EVIDENCE;
if (!ENGINE || !URL_BASE || !EVIDENCE) {
  console.error("FAIL: run this through scripts/drive, which resolves VR_ENGINE / VR_URL / VR_EVIDENCE.");
  process.exit(1);
}

const LABEL = "verify-resume";
const ROUTES = [
  ["home", "/"],
  ["resume", "/resume/"],
  ["readme", "/readme/"],
  ["projects", "/projects/"],
  ["factory", "/factory/"],
];
const VIEWPORTS = [
  ["desktop", 1440, 900],
  ["mobile", 390, 844],
];
const SETTLE_MS = 600;

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = join(EVIDENCE, `screenshots-${stamp}`);
mkdirSync(outDir, { recursive: true });

const engine = (script, ...args) =>
  execFileSync("node", [join(ENGINE, script), ...args], { encoding: "utf8" });

// The engine owns puppeteer-core; import it from there rather than installing a copy.
const puppeteer = (await import(pathToFileURL(join(ENGINE, "node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js")).href)).default;
const { pickTab } = await import(pathToFileURL(join(ENGINE, "_tabs.js")).href);

const PROPS = [
  "color", "background-color", "background-image",
  "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
  "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
  "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
  "box-shadow", "font-family", "font-size", "font-weight", "line-height", "letter-spacing",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "row-gap", "column-gap", "opacity",
];

// Runs in the page. Returns { "<path>": {prop: value}, "<path>::before": {...} }.
const FINGERPRINT = `(() => {
  const PROPS = ${JSON.stringify(PROPS)};
  const out = {};
  const read = (cs) => { const o = {}; for (const p of PROPS) o[p] = cs.getPropertyValue(p); return o; };
  const key = (el) => {
    const parts = [];
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const sibs = Array.from(n.parentElement.children).filter(c => c.tagName === n.tagName);
      const idx = sibs.indexOf(n) + 1;
      const cls = typeof n.className === 'string' && n.className.trim() ? '.' + n.className.trim().split(/\\s+/).join('.') : '';
      parts.unshift(n.tagName.toLowerCase() + (sibs.length > 1 ? ':' + idx : '') + cls);
    }
    return 'html>' + parts.join('>');
  };
  const els = [document.documentElement, ...document.body.querySelectorAll('*')]
    .filter(e => !['SCRIPT','STYLE','NOSCRIPT','TEMPLATE'].includes(e.tagName));
  for (const el of els) {
    const k = el === document.documentElement ? 'html' : key(el);
    out[k] = read(getComputedStyle(el));
    for (const pe of ['::before', '::after']) {
      const cs = getComputedStyle(el, pe);
      const c = cs.getPropertyValue('content');
      if (c && c !== 'none' && c !== 'normal') out[k + pe] = { content: c, ...read(cs) };
    }
  }
  return JSON.stringify(out);
})()`;

const FREEZE_CSS = `*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;caret-color:transparent!important}`;

let crashed = null;
const results = [];
let browser, page, client;
try {
  console.log(`==> engine   ${ENGINE}`);
  console.log(`==> evidence ${outDir}`);
  engine("start.js");
  // Reuse the labelled tab (same reasoning as drive-file-tree.mjs).
  try { engine("nav.js", `${URL_BASE}/`, `--label=${LABEL}`); }
  catch { engine("nav.js", `${URL_BASE}/`, "--new", `--label=${LABEL}`); }

  browser = await puppeteer.connect({ browserURL: "http://localhost:9222", defaultViewport: null });
  page = await pickTab(browser, { label: LABEL });
  if (!page) throw new Error("labelled tab not found");
  client = await page.createCDPSession();
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);

  for (const [vpName, width, height] of VIEWPORTS) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    for (const [name, route] of ROUTES) {
      await page.goto(`${URL_BASE}${route}`, { waitUntil: "networkidle0" });
      await page.addStyleTag({ content: FREEZE_CSS });
      await page.evaluate(() => document.fonts.ready.then(() => true));
      await new Promise((r) => setTimeout(r, SETTLE_MS));
      await page.evaluate(() => window.scrollTo(0, 0));
      const base = `${name}-${vpName}`;
      // Fingerprint BEFORE the full-page screenshot: puppeteer resizes the viewport
      // to the page height for fullPage, and reading styles while that is in flight
      // flaked (site-shell auto margins read 0px vs 16px on /factory/ mobile).
      const fp = JSON.parse(await page.evaluate(FINGERPRINT));
      await page.screenshot({ path: join(outDir, `${base}.png`), fullPage: true });
      writeFileSync(join(outDir, `${base}.fingerprint.json`), JSON.stringify(fp, null, 1) + "\n");
      const n = Object.keys(fp).length;
      results.push({ base, route, width, entries: n });
      console.log(`${base.padEnd(18)} ${route.padEnd(11)} ${String(n).padStart(5)} fingerprint entries`);
    }
  }
} catch (e) {
  crashed = e && e.message ? e.message : String(e);
} finally {
  try {
    if (client) await client.send("Emulation.clearDeviceMetricsOverride");
    if (page) await page.emulateMediaFeatures([]);
  } catch {}
  if (browser) await browser.disconnect();
  // Population check: a run that fingerprinted nothing is green and worthless.
  const empty = results.filter((r) => r.entries < 10);
  const ok = !crashed && results.length === 10 && empty.length === 0;
  writeFileSync(join(outDir, "evidence.json"), JSON.stringify({ ranAt: new Date().toISOString(), results, crashed, result: ok ? "pass" : "fail" }, null, 2) + "\n");
  console.log(`\npages captured   : ${results.length} (expected 10)`);
  console.log(`evidence         : ${outDir}`);
  if (crashed) console.log(`CRASHED: ${crashed}`);
  if (empty.length) console.log(`VACUOUS: ${empty.map((r) => r.base).join(", ")} fingerprinted <10 elements`);
  console.log(ok ? "DRIVE-RESULT: pass" : "DRIVE-RESULT: fail");
  process.exit(ok ? 0 : 1);
}
