#!/usr/bin/env node
// compare.mjs — diff two screenshots-drive evidence dirs (see scripts/compare).
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const [a, b] = process.argv.slice(2).map((p) => resolve(p));
for (const d of [a, b]) if (!existsSync(d)) { console.error(`FAIL: no such dir ${d}`); process.exit(2); }
const bases = (d) => readdirSync(d).filter((f) => f.endsWith(".fingerprint.json")).map((f) => f.replace(".fingerprint.json", "")).sort();
const ba = bases(a), bb = bases(b);
const all = [...new Set([...ba, ...bb])].sort();
const read = (d, f) => readFileSync(join(d, f));
const MAX_SHOWN = 15;
let diffs = 0, pngDiffs = 0;

console.log(`baseline: ${a}\nafter   : ${b}\n`);
for (const base of all) {
  if (!ba.includes(base) || !bb.includes(base)) {
    console.log(`${base}: MISSING in ${ba.includes(base) ? "after" : "baseline"}`);
    diffs++; continue;
  }
  const pngEq = existsSync(join(a, base + ".png")) && existsSync(join(b, base + ".png")) &&
    read(a, base + ".png").equals(read(b, base + ".png"));
  if (!pngEq) pngDiffs++;
  const fa = JSON.parse(read(a, base + ".fingerprint.json")), fb = JSON.parse(read(b, base + ".fingerprint.json"));
  const lines = [];
  for (const k of Object.keys(fa)) {
    if (!(k in fb)) { lines.push(`  - removed ${k}`); continue; }
    const props = Object.keys(fa[k]).filter((p) => fa[k][p] !== fb[k][p]);
    if (props.length) lines.push(`  ~ ${k}\n` + props.map((p) => `      ${p}: ${fa[k][p]}  ->  ${fb[k][p]}`).join("\n"));
  }
  for (const k of Object.keys(fb)) if (!(k in fa)) lines.push(`  + added ${k}`);
  diffs += lines.length;
  console.log(`${base.padEnd(18)} png ${pngEq ? "equal" : "DIFFERS"}  fingerprint diffs: ${lines.length} (${Object.keys(fa).length} -> ${Object.keys(fb).length} elements)`);
  lines.slice(0, MAX_SHOWN).forEach((l) => console.log(l));
  if (lines.length > MAX_SHOWN) console.log(`  ... ${lines.length - MAX_SHOWN} more`);
}
console.log(`\nSUMMARY: pages=${all.length} fingerprint-diffs=${diffs} png-diffs=${pngDiffs}`);
if (all.length === 0) { console.log("COMPARE-RESULT: fail (no pages found)"); process.exit(1); }
const clean = diffs === 0 && pngDiffs === 0;
console.log(clean ? "COMPARE-RESULT: identical" : "COMPARE-RESULT: differences");
process.exit(clean ? 0 : 1);
