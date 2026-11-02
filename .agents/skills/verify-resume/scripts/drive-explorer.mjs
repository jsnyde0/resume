#!/usr/bin/env node
// drive-explorer.mjs — drive the shared head+explorer layout on /resume/ and /projects/ (resume-soe.23.1).
//
// WHY. The two pages share one layout (ExplorerLayout): title (+ lede) and list on the left, the
// detail pane level with the h1 on the right (>860px), rows opening inline (<=860px). Static HTML
// cannot show "level with the h1", so this measures it in a real browser, then does the human's
// walk: default row open, click a row, deep link, keyboard, the 860px crossing, mobile tap.
//
// Evidence: screenshots + evidence.json under VERIFY_RESUME_EVIDENCE (default .verify-evidence).

import {
  LABEL, URL_BASE, checker, evidenceDir, load, openTab, releaseTab, report, setLayout, settle, sleep,
  visitorPress, writeEvidence,
} from "./lib.mjs";
import { join } from "node:path";
import { writeFileSync } from "node:fs";

const outDir = evidenceDir("explorer");
const C = checker();
const { check } = C;
const evidence = {};
let crashed = null, browser, page;
const consoleErrors = [];

const TOL = 4;
let g2;
// Row selector + panel selector per page, and the file/slug each walk opens.
const PAGES = {
  resume: {
    path: "/resume/", row: (id) => `#tree button[data-path="${id}"]`, panel: (id) => `[data-panel="${id}"]`,
    dflt: "about.md", other: "experience/mapular.md", deep: "experience/mapular.md", second: "experience/moonbird.md",
    hash: (id) => `#${id}`,
  },
  projects: {
    path: "/projects/", row: (id) => `#tree button[data-slug="${id}"]`, panel: (id) => `[data-panel="${id}"]`,
    dflt: null, other: "ebayes", deep: "ebayes", second: "meshmonk", hash: (id) => `#${id}`,
  },
};

// Screenshots are taken straight after a fresh navigation: on the shared automation Chrome a capture after page state changes hangs.
const shot = async (name) => {
  const c = await page.createCDPSession();
  const { data } = await c.send("Page.captureScreenshot", { format: "png", fromSurface: false });
  writeFileSync(join(outDir, name), Buffer.from(data, "base64"));
  await c.detach();
};
// A capture only works straight after a real navigation on this Chrome, so go through about:blank first.
const fresh = async (path) => { await page.goto("about:blank"); await load(page, path); };
// A visitor scrolls a row into view before pressing it.
const bringIntoView = async (sel) => {
  await page.evaluate((q) => { const r = document.querySelector(q).getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) document.querySelector(q).scrollIntoView({ block: "center" }); }, sel);
  await settle(page);
};
// Top-aligned: level with the h1 at the top of the page; once scrolled, the pane is pinned at the top margin instead.
const aligned = (g) => (g.scrollY === 0 ? Math.abs(g.pane.top - g.h1.top) <= TOL : g.pane.top >= 0 && g.pane.top <= 40);
const geom = (p) => page.evaluate(() => {
  const top = (sel) => { const r = document.querySelector(sel)?.getBoundingClientRect(); return r && { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height }; };
  const h1 = top("h1"), pane = top("#pane"), lede = top(".lede"), tree = top("#tree");
  const open = [...document.querySelectorAll("#tree [aria-current='true']")].map((e) => e.dataset.path || e.dataset.slug);
  const vis = [...document.querySelectorAll("[data-panel]")].filter((e) => !e.hidden && e.offsetParent !== null).map((e) => e.dataset.panel);
  return { h1, pane, lede, tree, open, vis, scrollY, hash: decodeURIComponent(location.hash.slice(1)) };
});

try {
  console.log(`==> target   ${URL_BASE}   (tab label ${LABEL})`);
  console.log(`==> evidence ${outDir}`);
  ({ browser, page } = await openTab("/resume/"));
  await page.bringToFront();
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });

  // ── Screenshots first: on the shared automation Chrome a capture after pointer input hangs. ──
  for (const [name, P] of Object.entries(PAGES)) {
    await setLayout(page, 1440, 900);
    await fresh(P.path);
    await shot(`${name}-1440.png`);
    await fresh(P.path + P.hash(P.deep));
    await shot(`${name}-1440-deeplink.png`);
    await setLayout(page, 390, 844);
    await fresh(P.path + P.hash(P.other));
    await shot(`${name}-390-open.png`);
  }

  // Agent-skill categories (resume-soe.4): evidence shots, expanded substrate with recall open, and a category open on mobile.
  await setLayout(page, 1440, 900);
  await fresh("/projects/#skills-substrate");
  await shot("projects-1440-skills-substrate.png");
  await setLayout(page, 390, 844);
  await fresh("/projects/#skills-learning");
  await shot("projects-390-skills-category.png");

  // ── Desktop ──
  for (const [name, P] of Object.entries(PAGES)) {
    const tag = `[desktop ${name}]`;
    await setLayout(page, 1440, 900);
    await load(page, P.path);
    let g = await geom();
    evidence[`${name}-desktop-initial`] = g;
    check(Math.abs(g.pane.top - g.h1.top) <= TOL, `${tag} pane top ${g.pane.top.toFixed(1)} vs h1 top ${g.h1.top.toFixed(1)} must be within ${TOL}px`, { pane: g.pane.top, h1: g.h1.top });
    check(g.pane.left > g.tree.right - 1, `${tag} pane must sit right of the list`);
    if (P.dflt) {
      check(g.open.length === 1 && g.open[0] === P.dflt, `${tag} ${P.dflt} must be the one open row by default, got ${JSON.stringify(g.open)}`);
      check(g.vis.length === 1 && g.vis[0] === P.dflt, `${tag} ${P.dflt} must be the one visible panel by default`);
    }
    if (name === "projects") {
      check(g.lede.left < g.pane.left && g.lede.top >= g.h1.bottom - 1, `${tag} lede must sit in the left column under the h1`);
    }

    // Click a row: it opens, the pane is still top-aligned.
    await bringIntoView(P.row(P.other));
    await visitorPress(page, P.row(P.other), false);
    g = await geom();
    evidence[`${name}-desktop-after-click`] = g;
    check(g.open[0] === P.other && g.vis[0] === P.other, `${tag} clicking ${P.other} must open it, got ${JSON.stringify(g.open)}/${JSON.stringify(g.vis)}`);
    check(aligned(g), `${tag} pane must stay top-aligned after click (scrollY ${g.scrollY}, pane ${g.pane.top.toFixed(1)}, h1 ${g.h1.top.toFixed(1)})`);

    // Keyboard: Enter and Space on a focused row open it.
    for (const key of ["Enter", "Space"]) {
      await page.evaluate((s) => document.querySelector(s).focus(), P.row(P.second));
      await page.keyboard.press(key);
      await settle(page);
      g = await geom();
      check(g.open[0] === P.second, `${tag} ${key} on ${P.second} must open it, got ${JSON.stringify(g.open)}`);
      await bringIntoView(P.row(P.other));
      await visitorPress(page, P.row(P.other), false);
    }

    // Deep link, fresh load.
    await load(page, P.path + P.hash(P.deep));
    g = await geom();
    evidence[`${name}-desktop-deeplink`] = g;
    check(g.open[0] === P.deep && g.vis[0] === P.deep, `${tag} ${P.path}${P.hash(P.deep)} must open ${P.deep}, got ${JSON.stringify(g.open)}`);

    // 860px crossing: down to mobile keeps the open row, back up to desktop shows a panel in the pane.
    await setLayout(page, 800, 900);
    await settle(page);
    const inline = await page.evaluate((s) => { const r = document.querySelector(s); return r?.nextElementSibling?.matches("[data-panel]") ?? false; }, P.row(P.deep));
    check(inline, `${tag} at 800px the open panel must sit inline under its row`);
    await setLayout(page, 1440, 900);
    await settle(page);
    g = await geom();
    check(g.vis.length === 1 && g.pane.height > 0, `${tag} back at 1440px exactly one panel must show in the pane, got ${JSON.stringify(g.vis)}`);
    check(aligned(g), `${tag} pane top-aligned again after crossing back`);
  }

  // ── Agent skills: desktop ──
  {
    const tag = "[desktop skills]";
    const exp = (id) => page.evaluate((i) => document.getElementById(i)?.getAttribute("aria-expanded"), id);
    const visibleKids = (cat) => page.evaluate((i) => {
      const list = document.getElementById(document.getElementById(i).dataset.fold);
      return [...list.querySelectorAll("button[data-slug]")].filter((b) => b.offsetParent !== null).length;
    }, cat);
    const items = (slug) => page.evaluate((s) => [...document.querySelectorAll(`[data-panel="${s}"] dt`)].map((e) => e.textContent.trim()), slug);
    await setLayout(page, 1440, 900);
    await load(page, "/projects/");
    check((await exp("skills")) === "false", `${tag} agent skills starts collapsed`);
    await bringIntoView("#skills");
    await visitorPress(page, "#skills", false);
    check((await exp("skills")) === "true", `${tag} clicking "agent skills" must set aria-expanded=true`);
    const cats = await visibleKids("skills");
    check(cats === 4, `${tag} 4 category rows must be visible, got ${cats}`);
    await bringIntoView("#skills-substrate");
    await visitorPress(page, "#skills-substrate", false);
    const g = await geom();
    const its = await items("skills-substrate");
    check(g.vis[0] === "skills-substrate" && its.length === 8 && its.some((n) => n.startsWith("recall")), `${tag} working substrate pane must list 8 items incl. recall, got ${JSON.stringify(its)}`);
    evidence["skills-desktop-substrate"] = g;
    // Old single-skill deep link lands on its category and expands agent skills.
    await load(page, "/projects/#skill-recall");
    const g2 = await geom();
    check(g2.open[0] === "skills-substrate" && (await exp("skills")) === "true", `${tag} /projects/#skill-recall must open working substrate and expand agent skills, got ${JSON.stringify(g2.open)}`);
    await load(page, "/projects/#cold-reader");
    const plain = await items("skills-plain");
    const meta = await page.evaluate(() => document.querySelector('[data-panel="skills-plain"]')?.textContent ?? "");
    check((await geom()).open[0] === "skills-plain" && plain.length === 3 && /output style, not a skill/.test(meta), `${tag} #cold-reader must open "making the models make sense" with the output-style note`);
  }

  // ── Mobile ──
  for (const [name, P] of Object.entries(PAGES)) {
    const tag = `[mobile ${name}]`;
    await setLayout(page, 390, 844);
    await load(page, P.path);
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "center" }), P.row(P.other));
    await settle(page);
    await visitorPress(page, P.row(P.other), true);
    const m = await page.evaluate((s) => {
      const row = document.querySelector(s), panel = row.nextElementSibling;
      const r = row.getBoundingClientRect(), p = panel?.getBoundingClientRect();
      return { isPanel: !!panel?.matches("[data-panel]"), hidden: panel?.hidden, rowBottom: r.bottom, panelTop: p?.top, current: row.getAttribute("aria-current") };
    }, P.row(P.other));
    evidence[`${name}-mobile-tap`] = m;
    check(m.isPanel && !m.hidden && Math.abs(m.panelTop - m.rowBottom) <= 2, `${tag} tapping a row must open its panel directly under it (row bottom ${m.rowBottom?.toFixed(1)}, panel top ${m.panelTop?.toFixed(1)})`);
    check(m.current === "true", `${tag} tapped row must be aria-current`);
  }
  {
    const tag = "[mobile skills]";
    await setLayout(page, 390, 844);
    await load(page, "/projects/");
    await page.evaluate(() => document.getElementById("skills").scrollIntoView({ block: "center" }));
    await settle(page);
    await visitorPress(page, "#skills", true);
    const c = await page.evaluate(() => {
      const r = document.getElementById("skills"), list = document.getElementById(r.dataset.fold);
      return { exp: r.getAttribute("aria-expanded"), kids: [...list.querySelectorAll("button[data-slug]")].filter((b) => b.offsetParent !== null).length };
    });
    check(c.exp === "true" && c.kids === 4, `${tag} tapping agent skills must show its 4 categories, got ${JSON.stringify(c)}`);
    await page.evaluate(() => document.getElementById("skills-learning").scrollIntoView({ block: "center" }));
    await settle(page);
    await visitorPress(page, "#skills-learning", true);
    const k = await page.evaluate(() => {
      const row = document.getElementById("skills-learning"), panel = row.nextElementSibling;
      return { isPanel: !!panel?.matches("[data-panel]"), hidden: panel?.hidden, items: panel ? [...panel.querySelectorAll("dt")].length : 0, gap: panel ? Math.abs(panel.getBoundingClientRect().top - row.getBoundingClientRect().bottom) : null };
    });
    evidence["skills-mobile-tap"] = { c, k };
    check(k.isPanel && !k.hidden && k.items === 4 && k.gap <= 2, `${tag} tapping a category must open its 4-skill list inline under its row, got ${JSON.stringify(k)}`);
  }

  check(consoleErrors.length === 0, `0 console errors, got ${JSON.stringify(consoleErrors)}`);
  evidence.consoleErrors = consoleErrors;
} catch (e) {
  crashed = e.stack || String(e);
} finally {
  await releaseTab(browser, page);
}

const evidencePath = writeEvidence(outDir, { checks: C.checks, evidence });
process.exit(report(C, crashed, evidencePath));
