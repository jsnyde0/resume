#!/usr/bin/env node
// drive-identity.mjs — D1 identity check for live routes (resume-soe.12 Verification target Signal 3).
//
// Usage: scripts/drive identity [route ...]     (default: /resume/)
//
// Per route, at 1440x900 and 390x844, on the served build:
//   - computed background-color of html, body and the page's outermost full-bleed container
//     (first laid-out element child of body) is #151513;
//   - every visible h1/h2 resolves to "Schibsted Grotesk" first, the face is loaded
//     (document.fonts.check), it came from a same-origin /fonts/*.woff2, and nothing was fetched
//     from fonts.googleapis.com / fonts.gstatic.com;
//   - every hex colour in the CSS the page actually loaded (linked same-origin sheets + inline
//     <style>) is declared in src/styles/tokens.css. A hex anywhere else is an untokenized colour.

import {
  LABEL, URL_BASE, checker, evidenceDir, load, openTab, releaseTab, report, setLayout, writeEvidence,
} from "./lib.mjs";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const GROUND = "rgb(21, 21, 19)"; // #151513, --id-ground
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/resume/"];
const LAYOUTS = [[1440, 900], [390, 844]];

const hexes = (s) => new Set((s.match(/#[0-9a-f]{3,8}\b/gi) ?? []).map((h) => h.toLowerCase()));
const tokenHexes = hexes(readFileSync(join(REPO, "src/styles/tokens.css"), "utf8"));

const outDir = evidenceDir("identity");
const C = checker();
const { check } = C;
const results = [];
let crashed = null, browser, page;

try {
  console.log(`==> routes   ${routes.join(" ")}   (tab label ${LABEL})`);
  console.log(`==> evidence ${outDir}`);
  ({ browser, page } = await openTab(routes[0]));

  for (const route of routes) {
    for (const [w, h] of LAYOUTS) {
      const tag = `[${route} ${w}]`;
      await setLayout(page, w, h);
      await page.goto("about:blank");
      await load(page, route);
      const r = await page.evaluate(async () => {
        const bg = (e) => (e ? getComputedStyle(e).backgroundColor : null);
        const outer = [...document.body.children].find((e) => !["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(e.tagName) && e.offsetParent !== null);
        const heads = [...document.querySelectorAll("h1, h2")].filter((e) => e.offsetParent !== null || getComputedStyle(e).position === "fixed");
        const res = performance.getEntriesByType("resource").map((e) => e.name);
        // Raw source text, not CSSOM: Chrome re-serializes hex as rgb() in cssText, which would
        // make the hex check vacuous.
        const css = [...document.querySelectorAll("style")].map((s) => s.textContent);
        for (const l of document.querySelectorAll('link[rel="stylesheet"]')) css.push(await (await fetch(l.href)).text());
        return {
          html: bg(document.documentElement),
          body: bg(document.body),
          outer: { tag: outer?.tagName.toLowerCase(), cls: outer?.className, bg: bg(outer), width: outer?.getBoundingClientRect().width, vw: document.documentElement.clientWidth },
          headings: heads.map((e) => ({ tag: e.tagName.toLowerCase(), text: e.textContent.trim().slice(0, 30), family: getComputedStyle(e).fontFamily })),
          faceLoaded: document.fonts.check('900 1em "Schibsted Grotesk"'),
          fontFiles: res.filter((n) => /\.woff2?(\?|$)/.test(n)),
          remoteFont: res.filter((n) => /fonts\.(googleapis|gstatic)\.com/.test(n)),
          origin: location.origin,
          sheets: css.length,
          css: css.join("\n"),
        };
      });
      const pageHex = [...hexes(r.css)];
      const offToken = pageHex.filter((x) => !tokenHexes.has(x));
      results.push({ route, width: w, ...r, css: undefined, pageHex, offToken });

      check(r.html === GROUND, `${tag} html background should be ${GROUND}, got ${r.html}`);
      check(r.body === GROUND, `${tag} body background should be ${GROUND}, got ${r.body}`);
      check(r.outer.bg === GROUND && Math.abs(r.outer.width - r.outer.vw) < 1,
        `${tag} outermost container <${r.outer.tag} class="${r.outer.cls}"> should be full-bleed on ${GROUND}, got ${r.outer.bg} at ${r.outer.width}/${r.outer.vw}px`);
      check(r.headings.length > 0, `${tag} no visible h1/h2 to check`);
      const bad = r.headings.filter((x) => !/^"?Schibsted Grotesk"?\s*(,|$)/.test(x.family));
      check(bad.length === 0, `${tag} headings not on Schibsted Grotesk: ${JSON.stringify(bad)}`);
      check(r.faceLoaded, `${tag} Schibsted Grotesk 900 is not loaded`);
      check(r.fontFiles.length > 0 && r.fontFiles.every((f) => f.startsWith(`${r.origin}/fonts/`)),
        `${tag} font files should all be same-origin /fonts/: ${JSON.stringify(r.fontFiles)}`);
      check(r.remoteFont.length === 0, `${tag} fetched remote fonts: ${JSON.stringify(r.remoteFont)}`);
      check(offToken.length === 0, `${tag} hex colours in page CSS not declared in tokens.css: ${JSON.stringify(offToken)}`);
      console.log(`${tag} html ${r.html}, outer <${r.outer.tag}.${r.outer.cls}> ${r.outer.bg}; ${r.headings.length} headings; fonts ${r.fontFiles.length} same-origin; ${pageHex.length} hexes in page CSS, ${offToken.length} outside tokens.css`);
    }
  }
} catch (e) {
  crashed = e && e.message ? e.message : String(e);
} finally {
  await releaseTab(browser, page);
  const failed = C.failures();
  const evidencePath = writeEvidence(outDir, {
    feature: "D1 identity: ground, self-hosted heading face, no untokenized hex",
    routes,
    ranAt: new Date().toISOString(),
    tokenHexes: [...tokenHexes],
    results,
    checksRun: C.checks.length,
    checks: C.checks,
    crashed,
    failures: failed,
    result: crashed || failed.length ? "fail" : "pass",
  });
  process.exit(report(C, crashed, evidencePath));
}
