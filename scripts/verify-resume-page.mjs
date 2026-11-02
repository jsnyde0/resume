// Static checks for /resume/ and the shared explorer layout (resume-soe.23.1 D1-D4).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const read = (p) => readFileSync(p, 'utf8');
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const resumePath = join('dist', 'resume', 'index.html');
assert.ok(existsSync(resumePath), `Missing built route: ${resumePath}`);
const html = read(resumePath);

// --- D1: one plain lime h1 "Resume", not interactive ---
const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
assert.equal(h1s.length, 1, 'Exactly one h1 on /resume/');
assert.equal(strip(h1s[0][1]), 'Resume', 'h1 text must be "Resume"');
assert.equal(/<(?:button|a)\b[^>]*>\s*<h1/.test(html), false, 'h1 must not be wrapped in an interactive element');
assert.equal(/<h1\b[^>]*>\s*<(?:button|a)\b/.test(html), false, 'h1 must not contain an interactive element');

// --- Explorer region ---
const explorer = html.match(/<div\b[^>]*class="explorer"[^>]*>([\s\S]*)<\/main>/);
assert.ok(explorer, 'Missing .explorer');
const tree = html.match(/<nav\b[^>]*class="[^"]*\btree\b[^"]*"[^>]*>([\s\S]*?)<\/nav>/);
assert.ok(tree, 'Missing tree nav');
assert.equal(/README/i.test(strip(tree[1])), false, 'No "README" label in the explorer tree');
assert.equal(/README/.test(strip(explorer[1].replace(/<script[\s\S]*?<\/script>/g, ''))), false, 'No "README" text in the explorer or its panels');

// --- First row is about.md ---
const firstRow = tree[1].match(/<button\b[^>]*\bdata-path="([^"]*)"/);
assert.equal(firstRow?.[1], 'about.md', 'First explorer row must be about.md');

// --- h2 group heads, in order ---
const heads = [...tree[1].matchAll(/<h2\b[^>]*class="[^"]*\bgroup-head\b[^"]*"[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1]).replace(/\s*\d+$/, ''));
assert.deepEqual(heads, ['Experience', 'Achievements', 'Skills', 'Education'], 'h2 group heads');

// --- D2/D4: head, tree, pane are direct children of one explorer grid, in the shared layout ---
const layoutPath = join('src', 'components', 'site', 'ExplorerLayout.astro');
assert.ok(existsSync(layoutPath), `Missing shared layout ${layoutPath}`);
const layout = read(layoutPath);
for (const page of ['resume', 'projects']) {
  assert.match(read(join('src', 'pages', `${page}.astro`)), /import ExplorerLayout from '\.\.\/components\/site\/ExplorerLayout\.astro'/, `${page}.astro must import the shared ExplorerLayout`);
  assert.match(read(join('dist', page, 'index.html')), /class="[^"]*\bexplorer-page\b/, `${page} must render the shared explorer-page`);
}
const headAt = html.indexOf('class="head"');
const treeAt = html.indexOf('class="tree"');
const paneAt = html.indexOf('class="pane"');
assert.ok(headAt > 0 && headAt < treeAt && treeAt < paneAt, 'Order inside .explorer: head, tree, pane');

// Grid + pane rules are defined once, in the shared layout; pages must not redefine them.
for (const page of ['resume', 'projects']) {
  const src = read(join('src', 'pages', `${page}.astro`));
  assert.equal(/grid-template-columns:\s*minmax\(0,\s*5fr\)/.test(src), false, `${page}.astro must not define the explorer grid`);
  assert.equal(/\.pane\s*\{[^}]*position:\s*sticky/.test(src), false, `${page}.astro must not define the pane`);
}
assert.match(layout, /grid-template-columns:\s*minmax\(0,\s*5fr\)\s+minmax\(0,\s*7fr\)/, 'Shared layout defines the 5fr/7fr grid');
assert.match(layout, /\.pane\s*\{[^}]*position:\s*sticky/, 'Shared layout defines the sticky pane');

// --- No flattening, no prototype residue ---
for (const f of [layoutPath, join('src', 'pages', 'resume.astro'), join('src', 'pages', 'projects.astro')]) {
  const src = read(f);
  assert.equal(/display:\s*contents/.test(src), false, `${f}: no display: contents flattening`);
  assert.equal(/SHORTCUT/.test(src), false, `${f}: no SHORTCUT tags`);
  assert.equal(/proto-switcher|data-variant/.test(src), false, `${f}: no prototype switcher`);
}

console.log('resume page verification passed');
