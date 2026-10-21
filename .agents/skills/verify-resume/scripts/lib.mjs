// lib.mjs — shared plumbing for the /resume/ explorer drives (file-tree, reading-path, identity).
//
// Imported, never run. Owns: env resolution, the engine's puppeteer-core (imported FROM the
// engine dir, never a copy), the labelled tab, counted checks, and the visitor-reachability
// guard every click/tap goes through.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const ENGINE = process.env.VR_ENGINE;
export const URL_BASE = process.env.VR_URL;
export const EVIDENCE = process.env.VR_EVIDENCE;
if (!ENGINE || !URL_BASE || !EVIDENCE) {
  console.error("FAIL: run this through scripts/drive, which resolves VR_ENGINE / VR_URL / VR_EVIDENCE.");
  process.exit(1);
}
// Tab label: one tab per label, reused across runs. Parallel drivers (two worktrees, one shared
// Chrome) must pass different VERIFY_RESUME_LABELs or they drive each other's tab.
export const LABEL = process.env.VR_LABEL || "verify-resume";

export const engine = (script, ...args) =>
  execFileSync("node", [join(ENGINE, script), ...args], { encoding: "utf8" });

const puppeteer = (await import(pathToFileURL(join(ENGINE, "node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js")).href)).default;
const { pickTab } = await import(pathToFileURL(join(ENGINE, "_tabs.js")).href);

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function evidenceDir(feature) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = join(EVIDENCE, `${feature}-${stamp}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

// Checks are COUNTED, never announced as a literal.
export function checker() {
  const checks = [];
  const check = (ok, msg, observed) => { checks.push({ ok: !!ok, msg, observed }); return !!ok; };
  const failures = () => checks.filter((c) => !c.ok).map((c) => c.msg);
  return { checks, check, failures };
}

// Open (or reuse) the labelled tab on the shared automation Chrome and return a puppeteer page.
export async function openTab(path) {
  engine("start.js");
  try { engine("nav.js", `${URL_BASE}${path}`, `--label=${LABEL}`); }
  catch { engine("nav.js", `${URL_BASE}${path}`, "--new", `--label=${LABEL}`); }
  const browser = await puppeteer.connect({ browserURL: "http://localhost:9222", defaultViewport: null });
  const page = await pickTab(browser, { label: LABEL });
  if (!page) throw new Error(`labelled tab '${LABEL}' not found`);
  return { browser, page };
}

// Restore the shared tab: other drives and agents reuse it.
export async function releaseTab(browser, page) {
  try {
    if (page) {
      const client = await page.createCDPSession();
      await client.send("Emulation.clearDeviceMetricsOverride");
      await client.send("Emulation.setTouchEmulationEnabled", { enabled: false });
    }
  } catch {}
  try { if (browser) await browser.disconnect(); } catch {}
}

export async function setLayout(page, width, height) {
  const touch = width <= 860;
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch });
}

// Load a route fresh and wait until the font gate settled and the explorer script ran.
export async function load(page, path) {
  await page.goto(`${URL_BASE}${path}`, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => document.documentElement.matches(".fonts-ready, .fonts-failed"), { timeout: 10000 });
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await settle(page);
}

// Wait until the page stops scrolling and animating (the page itself may smooth-scroll a row up).
export async function settle(page) {
  let last = null, stable = 0;
  for (let i = 0; i < 60 && stable < 4; i++) {
    const now = await page.evaluate(() => `${scrollX},${scrollY},${document.getAnimations().filter((a) => a.playState === "running").length}`);
    stable = now === last && now.endsWith(",0") ? stable + 1 : 0;
    last = now;
    await sleep(80);
  }
}

// Where an element sits relative to the viewport, and whether a visitor's pointer at its centre
// would land on it (hit-test, so an element covered by a sticky row or off-screen fails).
export const REACH = `(sel) => {
  const el = document.querySelector(sel);
  if (!el) return { exists: false };
  const r = el.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + Math.min(r.height / 2, 20);
  const inView = r.width > 0 && r.height > 0 && y >= 0 && y < innerHeight && x >= 0 && x < innerWidth;
  const hit = inView ? document.elementFromPoint(x, y) : null;
  return { exists: true, inView, onTop: !!hit && (hit === el || el.contains(hit)), x, y, top: r.top, bottom: r.bottom, vh: innerHeight };
}`;

export async function reach(page, sel) {
  return page.evaluate(`(${REACH})(${JSON.stringify(sel)})`);
}

// The ONLY way a drive activates something: refuse unless a visitor could hit it right now,
// without any scroll issued by the test. Taps on touch layouts, mouse clicks otherwise.
export async function visitorPress(page, sel, touch) {
  const r = await reach(page, sel);
  if (!r.exists) throw new Error(`${sel}: not in the DOM`);
  if (!r.inView || !r.onTop) {
    throw new Error(`${sel}: not reachable without scrolling (inView=${r.inView}, onTop=${r.onTop}, top=${Math.round(r.top)}, viewport=${r.vh}) — refusing to press what a visitor cannot see`);
  }
  if (touch) await page.touchscreen.tap(r.x, r.y);
  else await page.mouse.click(r.x, r.y);
  await settle(page);
  return r;
}

// Snapshot of the explorer's state, by path. Panels are visible when not [hidden] and laid out.
export const STATE = `(() => {
  const files = [...document.querySelectorAll('#tree button[data-path]')];
  const panels = [...document.querySelectorAll('[data-panel]')];
  const path = (e) => e.getAttribute('data-path');
  return {
    hash: decodeURIComponent(location.hash.slice(1)),
    scrollY,
    paths: files.map(path),
    visiblePaths: files.filter((e) => e.offsetParent !== null).map(path),
    ariaCurrent: files.filter((e) => e.getAttribute('aria-current') === 'true').map(path),
    visiblePanels: panels.filter((p) => !p.hidden && p.offsetParent !== null).map((p) => p.dataset.panel),
    crumbs: panels.filter((p) => !p.hidden && p.offsetParent !== null).map((p) => {
      const c = p.querySelector('.p-path');
      return c && c.offsetParent !== null ? c.textContent.replace(/\\s+/g, '') : null;
    }),
  };
})()`;

export const state = (page) => page.evaluate(STATE);

// Selector helpers. Paths contain only [a-z0-9./-], so attribute selectors are safe.
export const fileSel = (path) => `#tree button[data-path="${path}"]`;
export const folderSel = (folder) => `#tree button[data-folder="${folder}"]`;
export const panelSel = (path) => `[data-panel="${path}"]`;
// The opened file's first content line: the first laid-out element in its panel, outside the
// path crumb, that carries text of its own. Marked with [data-vr-first] so REACH can measure it
// (hit-tested, so a line hidden under the pinned open row does not count as read).
export async function reachFirstLine(page, path) {
  const found = await page.evaluate((p) => {
    document.querySelectorAll("[data-vr-first]").forEach((e) => e.removeAttribute("data-vr-first"));
    const panel = document.querySelector(`[data-panel="${p}"]`);
    if (!panel) return null;
    const own = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const first = [...panel.querySelectorAll("*")].find((e) => !e.closest(".p-path") && e.offsetParent !== null && own(e));
    if (!first) return null;
    first.setAttribute("data-vr-first", "");
    return first.textContent.trim().slice(0, 60);
  }, path);
  if (!found) return { exists: false };
  return { text: found, ...(await reach(page, "[data-vr-first]")) };
}

export function writeEvidence(dir, evidence) {
  const p = join(dir, "evidence.json");
  writeFileSync(p, JSON.stringify(evidence, null, 2) + "\n");
  return p;
}

export function report({ checks, failures }, crashed, evidencePath) {
  const failed = failures();
  console.log(`checks run       : ${checks.length}`);
  console.log(`evidence         : ${evidencePath}`);
  console.log();
  if (crashed) console.log(`CRASHED: ${crashed}`);
  if (failed.length) {
    console.log(`DRIVE-RESULT: fail (${failed.length})`);
    for (const f of failed) console.log(`  - ${f}`);
  } else if (!crashed) {
    console.log("DRIVE-RESULT: pass");
  }
  return crashed || failed.length ? 1 : 0;
}
