import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const routePath = join('dist', 'projects', 'index.html');

assert.ok(existsSync(routePath), `Missing built route: ${routePath}`);

const html = readFileSync(routePath, 'utf8');

// --- Page title uses 'Building' (locked shared string) ---
assert.match(html, /Building \| Jonatan Snyders/, 'Page title must use "Building | Jonatan Snyders"');
assert.match(html, /<h1[^>]*>Building<\/h1>/, 'On-page h1 must be "Building"');

// --- All 6 own-build entry titles are present ---
const expectedTitles = [
  'rip-cage',
  'switch-berlin',
  'harness',
  'meshmonk',
  'Mapular',
  'self-driving factory',
];
for (const title of expectedTitles) {
  assert.match(html, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Missing entry title: ${title}`);
}

// --- Tag chips present (all three variants) ---
assert.match(html, /\bbuilt\b/, 'Missing "built" tag chip');
assert.match(html, /\bcompany\b/, 'Missing "company" tag chip');
assert.match(html, /in progress/, 'Missing "in progress" tag chip');

// --- Required links present ---
assert.match(html, /https:\/\/github\.com\/jsnyde0\/rip-cage/, 'Missing rip-cage GitHub link');
assert.match(html, /https:\/\/github\.com\/jsnyde0\/switch-berlin/, 'Missing switch-berlin GitHub link');
assert.match(html, /https:\/\/switch\.berlin/, 'Missing switch.berlin link');
assert.match(html, /https:\/\/github\.com\/jsnyde0\/harness/, 'Missing harness GitHub link');
assert.match(html, /https:\/\/github\.com\/jsnyde0\/meshmonk/, 'Missing meshmonk GitHub link');
assert.match(html, /https:\/\/mapular\.com\/solutions\/site-selection/, 'Missing mapular.com link');
assert.match(html, /\/factory\//, 'Missing /factory/ internal link');

// --- meshmonk logo image referenced ---
assert.match(html, /meshmonk-logo-white\.png/, 'Missing meshmonk logo image');

// --- Third-party tools that belong ONLY to /factory must NOT appear ---
const forbiddenThirdParty = ['TelePi', 'herdr', 'cmux', 'agent_mail', 'cass'];
for (const name of forbiddenThirdParty) {
  assert.equal(html.includes(name), false, `Third-party tool must not appear on /projects: ${name}`);
}

// --- Other built pages exist ---
for (const route of ['resume', 'readme']) {
  assert.ok(existsSync(join('dist', route, 'index.html')), `Missing built route: dist/${route}/index.html`);
}

// --- /resume file tree and panels stay in parity ---
const resumeHtml = readFileSync(join('dist', 'resume', 'index.html'), 'utf8');
const attrValues = (attr) =>
  [...resumeHtml.matchAll(new RegExp(`\\b${attr}="([^"]*)"`, 'g'))].map((m) => m[1]).sort();
const treePaths = attrValues('data-path');
const panelPaths = attrValues('data-panel');
assert.ok(treePaths.length > 0, 'No tree entries (data-path) found in dist/resume/index.html');
assert.deepEqual(
  treePaths,
  panelPaths,
  `Resume tree entries and panels differ (tree ${treePaths.length}, panels ${panelPaths.length})`,
);

console.log('projects page verification passed');
