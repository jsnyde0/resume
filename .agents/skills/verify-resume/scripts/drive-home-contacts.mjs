#!/usr/bin/env node
// drive-home-contacts.mjs — prove the home composition's contacts, outfit rule and links on served /.
//
// WHY THIS FEATURE. The F7 home (resume-soe.12 D4, built by resume-soe.18) is geometry: his mirrored
// fingertip touches the end of a tagline line and his clog stands on a letter of the lime name, solved in
// CSS from the photo's alpha landmarks and Schibsted Grotesk's metrics. `npm run build` is blind to all of
// it. Only a real browser renders where a glyph's ink lands, so this drive measures it, per engine and size.
//
// WHAT IT MEASURES (bead resume-soe.12 Verification target Signal 1; bead resume-soe.18):
//   contacts  Landmarks are fractions of the rendered, mirrored img box (fingertip x 0.1294 y 0.2065, sole
//             patch x 0.89 at the contact row y 0.987 above the 1.3% contact shadow) — the alpha
//             landmarks, never the img box edges. The target glyph's ink is found in pixels: a screenshot
//             with the figure hidden, scanned for non-ground pixels inside the glyph's Range rect. Distance
//             = from the landmark to the nearest ink pixel (0 = on the ink). Green: 0-4px. The sole also
//             may not sink more than 4px below the ink top under it.
//   branch    Read from the page's own media queries, so 1280x1024 (aspect 1.25) is measured in the
//             narrow branch the CSS actually applies (D4: narrow = <=760px or aspect <=1.3).
//   halo      Ground pixels 2-8px from the shirt (lime pixels of the asset between the shoulder and the
//             bib hem, rows SHIRT_ROWS), mapped through the mirrored img box: zero may have hue 60-110deg
//             and HSL saturation > 0.25. The 2px inner clearance skips the antialiased photo edge.
//   held      woff2 held 2s at first paint: every frame before the gate settles shows the tagline, name
//             and figure hidden; fonts-ready only once the face is loaded.
//   failed    woff2 aborted: html.fonts-failed, composition visible, fingertip clear of the tagline (>8px);
//             on narrow screens the fallback drops the figure (display:none), which is contact-free too.
//   links     Each of the four links is visible, inside the viewport, and is what a click at its centre
//             hits; the two internal links are clicked for real and must land on their route.
//
// ENGINES. Chrome: the shared automation Chrome on :9222, in a throwaway browser context (no tab is shared
// with other drives or agents). Firefox: launched headless through puppeteer-core's WebDriver BiDi from
// $VERIFY_RESUME_FIREFOX or /usr/bin/firefox. WebKit: puppeteer cannot drive it; reported, not skipped
// silently. VERIFY_RESUME_ENGINES=chrome,firefox narrows the set.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ENGINE = process.env.VR_ENGINE;
const URL_BASE = process.env.VR_URL;
const EVIDENCE = process.env.VR_EVIDENCE;
if (!ENGINE || !URL_BASE || !EVIDENCE) {
  console.error("FAIL: run this through scripts/drive, which resolves VR_ENGINE / VR_URL / VR_EVIDENCE.");
  process.exit(1);
}

const SIZES = [
  [1280, 800], [1440, 900], [1920, 1080], // wide
  [1024, 768], [1280, 1024],              // squarer (1280x1024 is narrow by D4's own query)
  [390, 844], [768, 1024],                // narrow
];
const BAND_PX = 4;          // contact band: 0-4px
const FAILED_CLEAR_PX = 8;  // fonts-failed: fingertip at least this far from tagline ink
const HOLD_MS = 2000;
const HALO_OUTER = 8, HALO_INNER = 2;
// Measured once from public/img/jonatan_posing_rocks_hires_no_bg.png (alpha >= 200, hue 60-110, s > 0.25):
// lime rows run 128..345 of 1041 (0.123..0.331). Band padded to 0.12..0.34.
const SHIRT_ROWS = [0.12, 0.34];
const PHOTO = "/img/jonatan_posing_rocks_hires_no_bg.png";
const LM = { tipX: 0.1294, tipY: 0.2065, soleX: 0.89, soleY: 0.987 };

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = join(EVIDENCE, `home-contacts-${stamp}`);
mkdirSync(outDir, { recursive: true });

const checks = [];
const check = (id, ok, msg, observed) => {
  checks.push({ id, result: ok ? "pass" : "fail", msg, observed });
  return !!ok;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isFont = (req) => /\.woff2(\?|$)/.test(req.url());
const expectedBranch = (w, h) => (w <= 760 || w / h <= 1.3 ? "narrow" : w / h >= 1.57 ? "wide" : "squarer");

// Per-frame sampler, installed before page scripts: visibility of the gated composition until settle.
const INIT = `(() => {
  const boot = () => {
    const h = document.documentElement;
    const faces = () => [...document.fonts].filter((f) => f.family.replace(/["']/g, '') === 'Schibsted Grotesk').map((f) => f.status);
    const s = (window.__hc = { samples: [], classLog: [], t0: performance.now() });
    new MutationObserver(() => s.classLog.push({ t: performance.now() - s.t0, cls: h.className, faces: faces() }))
      .observe(h, { attributes: true, attributeFilter: ['class'] });
    let settled = 0;
    const tick = () => {
      const els = [...document.querySelectorAll('.tagline, .name, .figure')];
      const cls = h.className;
      s.samples.push({ t: performance.now() - s.t0, n: els.length,
        vis: els.map((e) => getComputedStyle(e).visibility), settled: /fonts-(ready|failed)/.test(cls) });
      if (/fonts-(ready|failed)/.test(cls)) settled++;
      if (s.samples.length < 3000 && settled < 5) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (document.documentElement) boot();
  else new MutationObserver((_, o) => { if (document.documentElement) { o.disconnect(); boot(); } }).observe(document, { childList: true });
})()`;

// Geometry from the live DOM: branch, img box, target glyph rects, links.
const GEOM = `(() => {
  const narrow = matchMedia('(max-width: 760px), (max-aspect-ratio: 13/10)').matches;
  const branch = narrow ? 'narrow' : matchMedia('(min-aspect-ratio: 157/100)').matches ? 'wide' : 'squarer';
  const r2o = (r) => ({ x: r.left, y: r.top, w: r.width, h: r.height });
  const charRect = (el, idx) => {
    const tn = [...el.childNodes].find((n) => n.nodeType === 3);
    const range = document.createRange();
    const i = idx < 0 ? tn.length + idx : idx;
    range.setStart(tn, i); range.setEnd(tn, i + 1);
    return { ch: tn.data[i], rect: r2o(range.getBoundingClientRect()) };
  };
  const img = document.querySelector('.figure');
  const tip = narrow
    ? { label: 'the pink "dread." block', ch: 'dread.', rect: r2o(document.querySelector('mark').getBoundingClientRect()) }
    : { label: 't of "agent" (tagline line 2)', ...charRect(document.querySelectorAll('.l2 .seg')[1], -1) };
  const sole = branch === 'wide'
    ? { label: 'd of "Snyders"', ...charRect(document.querySelector('.name .last'), 3) }
    : branch === 'squarer'
      ? { label: 'final s of "Snyders"', ...charRect(document.querySelector('.name .last'), -1) }
      : { label: 'final n of "Jonatan"', ...charRect(document.querySelector('.name .first'), -1) };
  const links = [...document.querySelectorAll('.links a')].map((a) => {
    const r = a.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const hit = document.elementFromPoint(cx, cy);
    return { text: a.textContent.trim(), href: a.getAttribute('href'), rect: r2o(r), cx, cy,
      visibility: getComputedStyle(a).visibility, hits: !!hit && (hit === a || a.contains(hit)),
      hitTag: hit ? hit.tagName + '.' + hit.className : null };
  });
  return {
    branch, cls: document.documentElement.className,
    vw: innerWidth, vh: innerHeight, scrollH: document.documentElement.scrollHeight,
    img: r2o(img.getBoundingClientRect()), figRendered: getComputedStyle(img).display !== 'none' && img.getBoundingClientRect().width > 0,
    imgTransform: getComputedStyle(img).transform,
    tip, sole, links,
    gatedVis: [...document.querySelectorAll('[data-font-gate]')].map((e) => getComputedStyle(e).visibility),
    tagFont: getComputedStyle(document.querySelector('.name')).fontFamily,
  };
})()`;

// Pixel analysis, in the page (canvas decodes the PNG screenshots; no image library needed).
// Runs as a function source with args: [plainB64, compB64, geom, cfg].
const ANALYZE = async (plainB64, compB64, g, cfg) => {
  const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const pixels = async (src) => {
    const i = await load(src);
    const c = document.createElement("canvas"); c.width = i.naturalWidth; c.height = i.naturalHeight;
    const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(i, 0, 0);
    return { w: c.width, h: c.height, d: x.getImageData(0, 0, c.width, c.height).data };
  };
  const plain = await pixels("data:image/png;base64," + plainB64);
  const comp = await pixels("data:image/png;base64," + compB64);
  const ground = [0x15, 0x15, 0x13];
  const isInk = (p, x, y) => {
    if (x < 0 || y < 0 || x >= p.w || y >= p.h) return false;
    const o = (y * p.w + x) * 4;
    return Math.max(Math.abs(p.d[o] - ground[0]), Math.abs(p.d[o + 1] - ground[1]), Math.abs(p.d[o + 2] - ground[2])) > 48;
  };
  const { img } = g;
  const lm = (fx, fy) => ({ x: img.x + fx * img.w, y: img.y + fy * img.h });
  const nearest = (pt, rect) => {
    let best = Infinity, bx = null, by = null, count = 0;
    const x0 = Math.floor(rect.x), x1 = Math.ceil(rect.x + rect.w), y0 = Math.floor(rect.y), y1 = Math.ceil(rect.y + rect.h);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (!isInk(plain, x, y)) continue;
      count++;
      const dx = Math.max(x - pt.x, 0, pt.x - (x + 1)), dy = Math.max(y - pt.y, 0, pt.y - (y + 1));
      const d = Math.hypot(dx, dy);
      if (d < best) { best = d; bx = x; by = y; }
    }
    return { dist: best, at: bx === null ? null : [bx, by], inkPixels: count };
  };
  const inkTopNear = (pt, rect) => {
    let top = Infinity;
    for (let x = Math.floor(pt.x) - 2; x <= Math.floor(pt.x) + 2; x++)
      for (let y = Math.floor(rect.y); y < rect.y + rect.h; y++) if (isInk(plain, x, y)) { top = Math.min(top, y); break; }
    return top;
  };
  const tipPt = lm(cfg.LM.tipX, cfg.LM.tipY), solePt = lm(cfg.LM.soleX, cfg.LM.soleY);
  const tip = nearest(tipPt, g.tip.rect);
  const sole = nearest(solePt, g.sole.rect);
  const soleInkTop = inkTopNear(solePt, g.sole.rect);
  const soleSink = Number.isFinite(soleInkTop) ? solePt.y - soleInkTop : null;
  // Fingertip clearance from ANY tagline ink (for the fonts-failed layout).
  const tagRect = g.tagRect || null;
  const tipClear = tagRect ? nearest(tipPt, tagRect) : null;

  // Halo: map screen pixels back into the source asset through the mirrored img box.
  const src = await pixels(cfg.PHOTO);
  const srcAt = (x, y) => {
    const fx = (x + 0.5 - img.x) / img.w, fy = (y + 0.5 - img.y) / img.h;
    if (fx < 0 || fx >= 1 || fy < 0 || fy >= 1) return null;
    const sx = Math.floor((1 - fx) * src.w), sy = Math.floor(fy * src.h);
    return { o: (sy * src.w + sx) * 4, fy };
  };
  const hsl = (r, g2, b) => {
    r /= 255; g2 /= 255; b /= 255;
    const mx = Math.max(r, g2, b), mn = Math.min(r, g2, b), l = (mx + mn) / 2;
    if (mx === mn) return { h: 0, s: 0, l };
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h = mx === r ? (g2 - b) / d + (g2 < b ? 6 : 0) : mx === g2 ? (b - r) / d + 2 : (r - g2) / d + 4;
    return { h: h * 60, s, l };
  };
  const limeHue = (c) => c.h >= 60 && c.h <= 110 && c.s > 0.25;
  const y0 = Math.max(0, Math.floor(img.y + cfg.SHIRT_ROWS[0] * img.h) - cfg.HALO_OUTER);
  const y1 = Math.min(comp.h, Math.ceil(img.y + cfg.SHIRT_ROWS[1] * img.h) + cfg.HALO_OUTER);
  const x0 = Math.max(0, Math.floor(img.x) - cfg.HALO_OUTER), x1 = Math.min(comp.w, Math.ceil(img.x + img.w) + cfg.HALO_OUTER);
  const W = x1 - x0, H = y1 - y0;
  const fig = new Uint8Array(W * H), shirt = new Uint8Array(W * H);
  let shirtPx = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const s = srcAt(x, y); if (!s) continue;
    const a = src.d[s.o + 3]; const i = (y - y0) * W + (x - x0);
    if (a > 0) fig[i] = 1;
    if (a >= 200 && s.fy >= cfg.SHIRT_ROWS[0] && s.fy <= cfg.SHIRT_ROWS[1] && limeHue(hsl(src.d[s.o], src.d[s.o + 1], src.d[s.o + 2]))) { shirt[i] = 1; shirtPx++; }
  }
  const near = (mask, x, y, r) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      if (mask[yy * W + xx]) return true;
    }
    return false;
  };
  let ring = 0; const lime = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (fig[y * W + x] || near(fig, x, y, cfg.HALO_INNER) || !near(shirt, x, y, cfg.HALO_OUTER)) continue;
    ring++;
    const o = ((y + y0) * comp.w + (x + x0)) * 4;
    const c = hsl(comp.d[o], comp.d[o + 1], comp.d[o + 2]);
    if (limeHue(c)) lime.push({ x: x + x0, y: y + y0, rgb: [comp.d[o], comp.d[o + 1], comp.d[o + 2]] });
  }
  return {
    tipPt, solePt,
    tip: { ...tip, label: g.tip.label },
    sole: { ...sole, label: g.sole.label, inkTop: Number.isFinite(soleInkTop) ? soleInkTop : null, sink: soleSink },
    tipClear,
    halo: { shirtPx, ringPx: ring, limePx: lime.length, sample: lime.slice(0, 5) },
  };
};

const fmt = (n) => (n === null || n === undefined || !Number.isFinite(n) ? String(n) : n.toFixed(2));

async function settledGeom(page) {
  await page.waitForFunction(() => /fonts-(ready|failed)/.test(document.documentElement.className), { timeout: 10000 });
  await page.evaluate(() => new Promise((r) => {
    const i = document.querySelector(".figure");
    i.complete ? r() : i.addEventListener("load", r, { once: true });
  }));
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  return page.evaluate(GEOM);
}

async function pixelsFor(page, g, name, extra = {}) {
  const comp = await page.screenshot({ encoding: "base64" });
  await page.evaluate(() => {
    const s = document.createElement("style"); s.id = "__hc_hide"; s.textContent = ".figure{visibility:hidden!important}";
    document.head.appendChild(s);
  });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const plain = await page.screenshot({ encoding: "base64" });
  await page.evaluate(() => document.getElementById("__hc_hide").remove());
  writeFileSync(join(outDir, `${name}.png`), Buffer.from(comp, "base64"));
  const cfg = { LM, SHIRT_ROWS, HALO_OUTER, HALO_INNER, PHOTO };
  return page.evaluate(`(${ANALYZE.toString()})(${JSON.stringify(plain)}, ${JSON.stringify(comp)}, ${JSON.stringify({ ...g, ...extra })}, ${JSON.stringify(cfg)})`);
}

async function runEngine(engineName, browser, newPage) {
  const out = { engine: engineName, version: await browser.version(), sizes: [] };
  for (const [w, h] of SIZES) {
    const tag = `${engineName}-${w}x${h}`;
    const rec = { size: `${w}x${h}`, expectedBranch: expectedBranch(w, h) };
    out.sizes.push(rec);

    // ---- settled capture ----
    {
      const page = await newPage(w, h);
      await page.goto(`${URL_BASE}/`, { waitUntil: "load" });
      const g = await settledGeom(page);
      const px = await pixelsFor(page, g, `${tag}-settled`);
      rec.settled = { geom: g, px };
      const B = `[${tag} ${g.branch}]`;
      check(`${tag}:route`, (await page.evaluate(() => document.body.innerText)).includes("existential") && !!(await page.$(".figure")) && g.vw === w && g.vh === h,
        `${B} / served the home composition at ${g.vw}x${g.vh}`, { vw: g.vw, vh: g.vh });
      check(`${tag}:ready`, /\bfonts-ready\b/.test(g.cls) && g.gatedVis.length === 3 && g.gatedVis.every((v) => v === "visible"),
        `${B} gate settled fonts-ready and the 3 gated parts are visible (class="${g.cls}", ${JSON.stringify(g.gatedVis)})`, g.gatedVis);
      check(`${tag}:branch`, g.branch === rec.expectedBranch,
        `${B} CSS branch matches D4's rule for ${w}x${h} (expected ${rec.expectedBranch})`, g.branch);
      check(`${tag}:mirrored`, /matrix\(-1/.test(g.imgTransform),
        `${B} figure is mirrored (transform ${g.imgTransform})`, g.imgTransform);
      check(`${tag}:tip`, px.tip.inkPixels > 0 && px.tip.dist <= BAND_PX,
        `${B} fingertip -> ${px.tip.label}: ${fmt(px.tip.dist)}px from ink (band 0-${BAND_PX}; landmark ${fmt(px.tipPt.x)},${fmt(px.tipPt.y)}; ${px.tip.inkPixels} ink px)`, px.tip);
      check(`${tag}:sole`, px.sole.inkPixels > 0 && px.sole.dist <= BAND_PX && px.sole.sink !== null && px.sole.sink <= BAND_PX,
        `${B} clog -> ${px.sole.label}: ${fmt(px.sole.dist)}px from ink, sink ${fmt(px.sole.sink)}px below the ink top (band 0-${BAND_PX})`, px.sole);
      check(`${tag}:halo`, px.halo.ringPx > 0 && px.halo.shirtPx > 0 && px.halo.limePx === 0,
        `${B} outfit halo: ${px.halo.limePx} lime-hued ground px in a ${px.halo.ringPx}px ring around ${px.halo.shirtPx} shirt px`, px.halo);
      check(`${tag}:links`, g.links.length === 4 && g.links.every((l) => l.visibility === "visible" && l.hits && l.rect.w > 0 && l.rect.y >= 0 && l.rect.y + l.rect.h <= g.vh && l.rect.x >= 0 && l.rect.x + l.rect.w <= g.vw),
        `${B} 4 links visible, inside the viewport and hit at their centre: ${g.links.map((l) => `${l.text}${l.hits ? "" : "(MISS:" + l.hitTag + ")"}`).join(", ")}`, g.links);
      check(`${tag}:fold`, g.scrollH <= g.vh + 1,
        `${B} the composition fits the viewport (scrollHeight ${g.scrollH} <= ${g.vh})`, g.scrollH);
      // Real clicks on the two internal links.
      for (const want of ["/factory/", "/resume/"]) {
        await page.goto(`${URL_BASE}/`, { waitUntil: "load" });
        await settledGeom(page);
        const l = (await page.evaluate(GEOM)).links.find((x) => x.href === want);
        await Promise.all([page.waitForNavigation({ waitUntil: "load", timeout: 10000 }).catch(() => {}), page.mouse.click(l.cx, l.cy)]);
        const path = new URL(page.url()).pathname;
        check(`${tag}:click${want}`, path === want, `${B} clicking "${l.text}" lands on ${path} (want ${want})`, path);
      }
      await page.close();
    }

    // ---- woff2 held 2s: never a composition on fallback metrics ----
    {
      const page = await newPage(w, h, true);
      await page.setRequestInterception(true);
      let requestedAt = null, releasedAt = null;
      page.on("request", (req) => {
        if (!isFont(req)) return req.continue().catch(() => {});
        requestedAt = Date.now();
        setTimeout(() => { releasedAt = Date.now(); req.continue().catch(() => {}); }, HOLD_MS);
      });
      await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded" });
      await sleep(900);
      const midShot = await page.screenshot({ encoding: "base64" });
      writeFileSync(join(outDir, `${tag}-held.png`), Buffer.from(midShot, "base64"));
      const mid = await page.evaluate(() => ({ cls: document.documentElement.className,
        vis: [...document.querySelectorAll(".tagline, .name, .figure")].map((e) => getComputedStyle(e).visibility) }));
      await page.waitForFunction(() => /fonts-(ready|failed)/.test(document.documentElement.className), { timeout: 10000 }).catch(() => {});
      await sleep(200);
      const hc = await page.evaluate(() => window.__hc);
      const pre = hc.samples.filter((s) => !s.settled && s.n === 3);
      const leaked = pre.filter((s) => s.vis.some((v) => v !== "hidden"));
      const readyEntry = hc.classLog.find((e) => /fonts-ready/.test(e.cls));
      rec.held = { requestedAt, releasedAt, mid, preSamples: pre.length, leaked: leaked.slice(0, 3), readyEntry };
      const B = `[${tag}]`;
      check(`${tag}:held`, requestedAt && releasedAt && releasedAt - requestedAt >= HOLD_MS - 50 && mid.vis.length === 3 && mid.vis.every((v) => v === "hidden") && !/fonts-(ready|failed)/.test(mid.cls),
        `${B} woff2 held ${releasedAt && requestedAt ? releasedAt - requestedAt : "n/a"}ms; at 0.9s tagline/name/figure are hidden (${JSON.stringify(mid.vis)}, class="${mid.cls}")`, rec.held.mid);
      check(`${tag}:held-frames`, pre.length > 0 && leaked.length === 0,
        `${B} every frame before the gate settled kept the composition hidden (${pre.length} frames, ${leaked.length} visible)`, { pre: pre.length, leaked: rec.held.leaked });
      check(`${tag}:held-ready`, !!readyEntry && readyEntry.faces.length > 0 && readyEntry.faces.every((s) => s === "loaded"),
        `${B} fonts-ready was set only with the face loaded (${JSON.stringify(readyEntry ?? null)})`, readyEntry ?? null);
      await page.close();
    }
  }

  // ---- woff2 aborted: settled, contact-free fallback, one size per branch ----
  for (const [w, h] of [[1440, 900], [1024, 768], [390, 844]]) {
    const tag = `${engineName}-${w}x${h}-failed`;
    const page = await newPage(w, h);
    await page.setRequestInterception(true);
    page.on("request", (req) => (isFont(req) ? req.abort("failed").catch(() => {}) : req.continue().catch(() => {})));
    await page.goto(`${URL_BASE}/`, { waitUntil: "load" });
    const g = await settledGeom(page);
    const tagRect = await page.evaluate(() => { const r = document.querySelector(".tagline").getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    const px = await pixelsFor(page, g, tag, { tagRect });
    out.sizes.push({ size: `${w}x${h}`, failed: { geom: g, px } });
    const B = `[${tag} ${g.branch}]`;
    check(`${tag}:settled`, /\bfonts-failed\b/.test(g.cls) && g.gatedVis.every((v) => v === "visible"),
      `${B} woff2 aborted: html.fonts-failed and the composition is visible (class="${g.cls}", ${JSON.stringify(g.gatedVis)})`, g.gatedVis);
    check(`${tag}:contact-free`, g.figRendered ? px.tipClear && px.tipClear.dist > FAILED_CLEAR_PX : g.branch === "narrow",
      g.figRendered
        ? `${B} fallback layout is contact-free: fingertip ${fmt(px.tipClear?.dist)}px from any tagline ink (> ${FAILED_CLEAR_PX})`
        : `${B} fallback layout is contact-free: figure not rendered (narrow fallback is type only)`, { figRendered: g.figRendered, tipClear: px.tipClear });
    if (g.figRendered) check(`${tag}:halo`, px.halo.limePx === 0 && px.halo.ringPx > 0,
      `${B} outfit halo: ${px.halo.limePx} lime-hued ground px in a ${px.halo.ringPx}px ring`, px.halo);
    check(`${tag}:links`, g.links.length === 4 && g.links.every((l) => l.visibility === "visible" && l.hits && l.rect.y + l.rect.h <= g.vh),
      `${B} 4 links visible and hit at their centre`, g.links);
    await page.close();
  }
  return out;
}

const engines = (process.env.VERIFY_RESUME_ENGINES || "chrome,firefox").split(",").map((s) => s.trim()).filter(Boolean);
const results = [];
const notRun = [{ engine: "webkit", why: "puppeteer-core drives Chrome and Firefox only; no WebKit driver (Playwright) is installed in the shared engine" }];
let crashed = null;

try {
  const puppeteer = (await import(pathToFileURL(join(ENGINE, "node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js")).href)).default;
  for (const name of engines) {
    if (name === "chrome") {
      const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9222", defaultViewport: null });
      const ctx = await browser.createBrowserContext();
      const newPage = async (w, h, init) => {
        const p = await ctx.newPage();
        await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
        await p.setCacheEnabled(false);
        if (init) await p.evaluateOnNewDocument(INIT);
        return p;
      };
      try { results.push(await runEngine("chrome", browser, newPage)); }
      finally { await ctx.close(); await browser.disconnect(); }
    } else if (name === "firefox") {
      const exe = process.env.VERIFY_RESUME_FIREFOX || "/usr/bin/firefox";
      if (!existsSync(exe)) {
        check("firefox:available", false, `Firefox not found at ${exe} (set VERIFY_RESUME_FIREFOX)`, exe);
        continue;
      }
      const browser = await puppeteer.launch({ browser: "firefox", executablePath: exe, headless: true });
      const newPage = async (w, h, init) => {
        const p = await browser.newPage();
        await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
        await p.setCacheEnabled(false);
        if (init) await p.evaluateOnNewDocument(INIT);
        return p;
      };
      try { results.push(await runEngine("firefox", browser, newPage)); }
      finally { await browser.close(); }
    } else {
      check(`${name}:available`, false, `unknown engine '${name}'`, name);
    }
  }
} catch (e) {
  crashed = e && e.stack ? e.stack : String(e);
} finally {
  const failed = checks.filter((c) => c.result === "fail");
  const evidence = {
    feature: "home composition contacts, outfit halo, held/failed font, links (resume-soe.18)",
    route: `${URL_BASE}/`,
    ranAt: new Date().toISOString(),
    constants: { SIZES, BAND_PX, FAILED_CLEAR_PX, HOLD_MS, HALO_OUTER, HALO_INNER, SHIRT_ROWS, LM, PHOTO },
    engines: results.map((r) => ({ engine: r.engine, version: r.version })),
    notRun,
    results,
    checksRun: checks.length,
    checks,
    crashed,
    failures: failed.map((c) => `${c.id}: ${c.msg}`),
    result: crashed || failed.length || checks.length === 0 ? "fail" : "pass",
  };
  writeFileSync(join(outDir, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
  for (const c of checks) console.log(`${c.result === "pass" ? "PASS" : "FAIL"} ${c.id}  ${c.msg}`);
  console.log();
  for (const n of notRun) console.log(`NOT RUN    : ${n.engine} — ${n.why}`);
  console.log(`checks run : ${checks.length}`);
  console.log(`failed     : ${failed.length}`);
  if (crashed) console.log(`CRASHED    : ${crashed}`);
  console.log(`evidence   : ${join(outDir, "evidence.json")}`);
  console.log(evidence.result === "pass" ? "RESULT: pass" : "RESULT: FAIL");
  process.exit(evidence.result === "pass" ? 0 : 1);
}
