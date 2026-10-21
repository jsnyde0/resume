#!/usr/bin/env node
// drive-font-gate.mjs — prove the font-loading mechanism the home composition relies on.
//
// WHY THIS FEATURE. `npm run build` is blind to font loading: markup and CSS are
// identical whether the woff2 is served, slow, or missing. The D4 contact geometry
// (resume-soe.12) is only right on Schibsted Grotesk's real metrics, so BaseLayout
// ships a gate: elements marked `data-font-gate` stay visibility:hidden until the
// face is loaded (html.fonts-ready), or settle visible on failure / timeout
// (html.fonts-failed). This drive checks that contract at the browser seam.
//
// WHY RAW PUPPETEER. The shared engine's CLI scripts (nav/eval/wait) cannot intercept
// requests or inject a script before page JS, which (c) and (d) need. This drive
// resolves puppeteer-core FROM the engine dir (never a copy) and attaches to the same
// shared automation Chrome on :9222, in a throwaway browser context so no cache or
// cookies leak in from the other drives.
//
// Checks (bead resume-soe.17, Verification target Signal 2):
//   (a) built HTML preloads a same-origin woff2; no fonts.googleapis/gstatic anywhere
//   (b) fonts.ready -> check('900 1em "Schibsted Grotesk"') true, html.fonts-ready set
//   (c) woff2 held 2s: gated probe hidden at every post-parse sample, non-gated text
//       visible, fonts-ready never set before the face status is `loaded`, probe
//       visible after release
//   (d) woff2 aborted: html.fonts-failed within the timeout, probe visible
//   (d2) woff2 never answers: the timeout alone settles fonts-failed, probe visible

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

// Single source: BaseLayout exposes its timeout as html[data-font-gate-timeout]; read in scenario (b).
let GATE_TIMEOUT_MS = NaN;
const SLACK_MS = 1000;
const HOLD_MS = 2000;

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = join(EVIDENCE, `font-gate-${stamp}`);
mkdirSync(outDir, { recursive: true });

const checks = [];
const check = (id, ok, msg, observed) => {
  checks.push({ id, result: ok ? "pass" : "fail", msg, observed });
  return !!ok;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Runs in the page before any page script: a probe carrying data-font-gate, a class
// recorder, and a per-frame visibility sampler.
const INIT = `(() => {
  const boot = () => {
  const h = document.documentElement;
  const status = () => [...document.fonts]
    .filter((f) => f.family.replace(/["']/g, '') === 'Schibsted Grotesk')
    .map((f) => f.status);
  const fg = (window.__fg = { samples: [], classLog: [], t0: performance.now() });
  const probe = document.createElement('div');
  probe.id = '__fg_probe';
  probe.setAttribute('data-font-gate', '');
  probe.textContent = 'probe';
  probe.style.cssText = 'position:fixed;top:0;left:0;z-index:9999';
  h.appendChild(probe);
  // Control: same injection, NOT opted in. The gate must never touch it.
  const plain = document.createElement('div');
  plain.id = '__fg_plain';
  plain.textContent = 'plain';
  plain.style.cssText = 'position:fixed;top:0;left:60px;z-index:9999';
  h.appendChild(plain);
  new MutationObserver(() => {
    fg.classLog.push({ t: performance.now() - fg.t0, cls: h.className, faces: status() });
  }).observe(h, { attributes: true, attributeFilter: ['class'] });
  let settledFrames = 0;
  const tick = () => {
    const cls = h.className;
    fg.samples.push({
      t: performance.now() - fg.t0,
      rs: document.readyState,
      vis: getComputedStyle(probe).visibility,
      plain: getComputedStyle(plain).visibility,
      ready: cls.includes('fonts-ready'),
      failed: cls.includes('fonts-failed'),
    });
    if (/fonts-(ready|failed)/.test(cls)) settledFrames++;
    if (fg.samples.length < 2000 && settledFrames < 5) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  };
  // At document start <html> may not exist yet; boot the moment the parser creates it.
  if (document.documentElement) boot();
  else new MutationObserver((_, o) => { if (document.documentElement) { o.disconnect(); boot(); } }).observe(document, { childList: true });
})()`;

const SNAP = `(() => {
  const h = document.documentElement;
  const probe = document.getElementById('__fg_probe');
  const text = document.getElementById('__fg_plain');
  return {
    cls: h.className,
    probeVis: probe ? getComputedStyle(probe).visibility : null,
    nonGatedVis: text ? getComputedStyle(text).visibility : null,
    faces: [...document.fonts].filter((f) => f.family.replace(/["']/g, '') === 'Schibsted Grotesk').map((f) => f.status),
  };
})()`;

const isFont = (req) => /\.woff2(\?|$)/.test(req.url());

let crashed = null;
let htmlInfo = null;
const scenarios = {};

try {
  const puppeteer = (await import(pathToFileURL(join(ENGINE, "node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js")).href)).default;
  const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: { width: 1280, height: 800 } });
  const ctx = await browser.createBrowserContext();

  // ---------- (a) built HTML ----------
  {
    const res = await fetch(`${URL_BASE}/`);
    const html = await res.text();
    const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
    const preload = links.find((l) => /rel=["']?preload/i.test(l) && /as=["']?font/i.test(l));
    const attr = (tag, name) => (tag && (tag.match(new RegExp(`${name}=["']?([^"'\\s>]*)`, "i")) || [])[1]) ?? null;
    const href = attr(preload, "href");
    const type = attr(preload, "type");
    const hasCrossorigin = !!preload && /\scrossorigin\b/i.test(preload);
    const sameOrigin = !!href && href.startsWith("/") && !href.startsWith("//");
    // Also scan the stylesheets the page links, since a Google @import could hide there.
    const cssHrefs = links.filter((l) => /rel=["']?stylesheet/i.test(l)).map((l) => attr(l, "href")).filter(Boolean);
    let allText = html;
    for (const c of cssHrefs) {
      try { allText += await (await fetch(new URL(c, URL_BASE))).text(); } catch { /* reported via the check below */ }
    }
    const external = /fonts\.googleapis|fonts\.gstatic/.test(allText);
    let fontRes = null, magic = null;
    if (href) {
      const r = await fetch(new URL(href, URL_BASE));
      const buf = Buffer.from(await r.arrayBuffer());
      magic = buf.subarray(0, 4).toString("latin1");
      fontRes = { status: r.status, contentType: r.headers.get("content-type"), bytes: buf.length };
    }
    htmlInfo = { preload, href, type, hasCrossorigin, cssHrefs, fontRes, magic };
    check("a1", !!preload && type === "font/woff2" && hasCrossorigin && sameOrigin,
      `built / has <link rel=preload as=font type=font/woff2 crossorigin> to a same-origin href (got ${JSON.stringify(preload ?? null)})`, htmlInfo);
    check("a2", !external, "no fonts.googleapis / fonts.gstatic reference in the built HTML or its linked CSS", { external });
    check("a3", !!fontRes && fontRes.status === 200 && magic === "wOF2",
      `the preload href serves a real woff2 (status 200, magic wOF2); got ${JSON.stringify(fontRes)} magic=${magic}`, fontRes);
  }

  const newPage = async () => {
    const page = await ctx.newPage();
    await page.evaluateOnNewDocument(INIT);
    return page;
  };

  // ---------- (b) normal load ----------
  {
    const page = await newPage();
    await page.goto(`${URL_BASE}/`, { waitUntil: "load" });
    const r = await page.evaluate(async () => {
      await document.fonts.ready;
      // Give the gate script's promise chain a few frames to land after fonts.ready.
      for (let i = 0; i < 30 && !/fonts-(ready|failed)/.test(document.documentElement.className); i++) {
        await new Promise((res) => setTimeout(res, 50));
      }
      return {
        check900: document.fonts.check('900 1em "Schibsted Grotesk"'),
        check400: document.fonts.check('400 1em "Schibsted Grotesk"'),
        cls: document.documentElement.className,
      };
    });
    const snap = await page.evaluate(SNAP);
    const attrTimeout = await page.evaluate(() => document.documentElement.getAttribute("data-font-gate-timeout"));
    GATE_TIMEOUT_MS = Number(attrTimeout);
    check("b0", Number.isFinite(GATE_TIMEOUT_MS) && GATE_TIMEOUT_MS > 0,
      `BaseLayout exposes the gate timeout as html[data-font-gate-timeout] (got ${JSON.stringify(attrTimeout)})`, attrTimeout);
    scenarios.normal = { ...r, snap };
    check("b1", r.check900 === true && snap.faces.length > 0 && snap.faces.every((s) => s === "loaded"),
      `after fonts.ready, check('900 1em "Schibsted Grotesk"') is true and the face status is loaded (got ${JSON.stringify({ check900: r.check900, faces: snap.faces })})`, scenarios.normal);
    check("b2", /\bfonts-ready\b/.test(r.cls) && !/\bfonts-failed\b/.test(r.cls),
      `html carries fonts-ready and not fonts-failed (got class="${r.cls}")`, r.cls);
    check("b3", snap.probeVis === "visible",
      `the gated probe is visible once fonts-ready is set (got ${snap.probeVis})`, snap.probeVis);
    await page.screenshot({ path: join(outDir, "01-normal.png") });
    await page.close();
  }

  // ---------- (c) font held 2s ----------
  {
    const page = await newPage();
    await page.setRequestInterception(true);
    let held = null, releasedAt = null, requestedAt = null;
    page.on("request", (req) => {
      if (!isFont(req)) return req.continue();
      requestedAt = Date.now();
      held = req;
      setTimeout(() => { releasedAt = Date.now(); req.continue().catch(() => {}); }, HOLD_MS);
    });
    await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded" });
    await sleep(1000);
    const mid = await page.evaluate(SNAP);
    await page.screenshot({ path: join(outDir, "02-held-mid.png") });
    await page.waitForFunction(() => /fonts-(ready|failed)/.test(document.documentElement.className), { timeout: 8000 }).catch(() => {});
    await sleep(300);
    const after = await page.evaluate(SNAP);
    const fg = await page.evaluate(() => window.__fg);
    scenarios.held = { mid, after, requestedAt, releasedAt, samples: fg.samples.length, classLog: fg.classLog };

    // Every unsettled sample counts, readyState "loading" included: a loading-state frame is still a frame.
    const parsed = fg.samples.filter((s) => !s.ready && !s.failed);
    const leaked = parsed.filter((s) => s.vis !== "hidden");
    const readyEntry = fg.classLog.find((e) => /fonts-ready/.test(e.cls));
    check("c0", !!held && requestedAt && releasedAt && releasedAt - requestedAt >= HOLD_MS - 50,
      `the woff2 request was actually held ~${HOLD_MS}ms (held ${releasedAt && requestedAt ? releasedAt - requestedAt : "n/a"}ms)`, { requestedAt, releasedAt });
    check("c1", mid.probeVis === "hidden" && !/fonts-(ready|failed)/.test(mid.cls),
      `mid-hold the gated probe is hidden and html has neither fonts-ready nor fonts-failed (got ${JSON.stringify(mid)})`, mid);
    check("c2", parsed.length > 0 && leaked.length === 0,
      `every per-frame sample after parse and before settle shows the probe hidden (${parsed.length} samples, ${leaked.length} visible)`, { parsed: parsed.length, leaked: leaked.slice(0, 3) });
    scenarios.held.sampleList = fg.samples;
    check("c3", mid.nonGatedVis === "visible",
      `a non-gated control element injected the same way is visible at the same moment: the gate hides only opted-in elements (got ${mid.nonGatedVis})`, mid.nonGatedVis);
    check("c4", !!readyEntry && readyEntry.faces.length > 0 && readyEntry.faces.every((s) => s === "loaded"),
      `at the instant fonts-ready was added, every Schibsted face status was loaded (got ${JSON.stringify(readyEntry ?? null)})`, readyEntry ?? null);
    check("c5", after.probeVis === "visible" && /\bfonts-ready\b/.test(after.cls),
      `after release the probe is visible and html has fonts-ready (got ${JSON.stringify(after)})`, after);
    await page.close();
  }

  // ---------- (d) font aborted ----------
  {
    const page = await newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => (isFont(req) ? req.abort("failed") : req.continue()));
    const t0 = Date.now();
    await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => /fonts-(ready|failed)/.test(document.documentElement.className), { timeout: GATE_TIMEOUT_MS + 3000 }).catch(() => {});
    const elapsed = Date.now() - t0;
    const snap = await page.evaluate(SNAP);
    scenarios.aborted = { elapsed, snap };
    check("d1", /\bfonts-failed\b/.test(snap.cls) && !/\bfonts-ready\b/.test(snap.cls) && elapsed <= GATE_TIMEOUT_MS + SLACK_MS,
      `with the woff2 aborted, html carries fonts-failed (not fonts-ready) within ${GATE_TIMEOUT_MS}ms+${SLACK_MS}ms slack (got ${elapsed}ms, class="${snap.cls}")`, { elapsed, cls: snap.cls });
    check("d2", snap.probeVis === "visible",
      `the gated probe is visible after failure (got ${snap.probeVis})`, snap.probeVis);
    await page.screenshot({ path: join(outDir, "03-aborted.png") });
    await page.close();
  }

  // ---------- (d2) font never answers: the timeout alone must settle ----------
  {
    const page = await newPage();
    await page.setRequestInterception(true);
    const stuck = [];
    page.on("request", (req) => { if (isFont(req)) stuck.push(req); else req.continue(); });
    const t0 = Date.now();
    await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded" });
    await sleep(Math.max(0, GATE_TIMEOUT_MS - 1000));
    const before = await page.evaluate(SNAP);
    await page.waitForFunction(() => /fonts-(ready|failed)/.test(document.documentElement.className), { timeout: GATE_TIMEOUT_MS + 3000 }).catch(() => {});
    const elapsed = Date.now() - t0;
    const snap = await page.evaluate(SNAP);
    scenarios.neverAnswers = { elapsed, before, snap, stuckRequests: stuck.length };
    check("e1", stuck.length > 0 && before.probeVis === "hidden" && !/fonts-(ready|failed)/.test(before.cls),
      `1s before the timeout the stalled font still has the probe hidden and nothing settled (got ${JSON.stringify(before)}, ${stuck.length} stalled requests)`, before);
    check("e2", /\bfonts-failed\b/.test(snap.cls) && snap.probeVis === "visible" && elapsed >= GATE_TIMEOUT_MS - 200 && elapsed <= GATE_TIMEOUT_MS + SLACK_MS,
      `a font that never answers settles to fonts-failed by the timeout alone, probe visible (got ${elapsed}ms, class="${snap.cls}", probe ${snap.probeVis})`, { elapsed, cls: snap.cls });
    await page.close();
  }

  await ctx.close();
  await browser.disconnect();
} catch (e) {
  crashed = e && e.message ? e.message : String(e);
} finally {
  const failed = checks.filter((c) => c.result === "fail");
  const evidence = {
    feature: "font gate (data-font-gate / html.fonts-ready / html.fonts-failed)",
    route: `${URL_BASE}/`,
    ranAt: new Date().toISOString(),
    gateTimeoutMs: GATE_TIMEOUT_MS,
    htmlInfo,
    scenarios,
    checksRun: checks.length,
    checks,
    crashed,
    failures: failed.map((c) => `${c.id}: ${c.msg}`),
    result: crashed || failed.length || checks.length === 0 ? "fail" : "pass",
  };
  writeFileSync(join(outDir, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");

  for (const c of checks) console.log(`${c.result === "pass" ? "PASS" : "FAIL"} ${c.id}  ${c.msg}`);
  console.log();
  console.log(`checks run : ${checks.length}`);
  console.log(`failed     : ${failed.length}`);
  if (crashed) console.log(`CRASHED    : ${crashed}`);
  console.log(`evidence   : ${join(outDir, "evidence.json")}`);
  console.log(evidence.result === "pass" ? "RESULT: pass" : "RESULT: FAIL");
  process.exit(evidence.result === "pass" ? 0 : 1);
}
