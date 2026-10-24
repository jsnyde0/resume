import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { projects, statusGroups, partsOf, formatRange } from '../src/data/projects.ts';

const routePath = join('dist', 'projects', 'index.html');
assert.ok(existsSync(routePath), `Missing built route: ${routePath}`);
const html = readFileSync(routePath, 'utf8');

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const tags = (re) => [...html.matchAll(re)].map((m) => m[0]);

// --- Page title and h1 (locked shared string) ---
assert.match(html, /<title>Building \| Jonatan Snyders<\/title>/, 'Page title must be "Building | Jonatan Snyders"');
assert.match(html, /<h1[^>]*>Building<\/h1>/, 'On-page h1 must be "Building"');

// --- Two status groups, labelled Now / Past ---
const heads = [...html.matchAll(/<h2[^>]*class="[^"]*\bgroup-head\b[^"]*"[^>]*>([^<]*)</g)].map((m) => m[1].trim());
assert.deepEqual(heads, statusGroups.map((g) => g.label), 'Groups must be exactly Now, Past in order');
assert.deepEqual(statusGroups.map((g) => g.label), ['Now', 'Past']);

// --- Every project renders one row with id = slug and a detail panel it controls ---
const rows = tags(/<button\b[^>]*\bdata-slug="[^"]*"[^>]*>/g);
assert.equal(rows.length, projects.length, `Expected ${projects.length} rows, found ${rows.length}`);
for (const p of projects) {
  const row = rows.find((r) => attr(r, 'id') === p.slug);
  assert.ok(row, `No row with id="${p.slug}"`);
  assert.equal(attr(row, 'data-slug'), p.slug, `Row ${p.slug}: data-slug must equal id`);
  const panels = tags(new RegExp(`<article\\b[^>]*\\bdata-panel="${p.slug}"[^>]*>`, 'g'));
  assert.equal(panels.length, 1, `Expected one detail panel for ${p.slug}, found ${panels.length}`);
  assert.equal(attr(row, 'aria-controls'), attr(panels[0], 'id'), `Row ${p.slug}: aria-controls must name its panel`);
  assert.ok(html.includes(formatRange(p)), `Missing date range "${formatRange(p)}" for ${p.slug}`);
}

// --- Factory harmonica: collapsed by default, controls a hidden list of its 7 part rows ---
assert.equal(partsOf('factory').length, 7, 'Factory must have 7 parts');
const factoryRow = rows.find((r) => attr(r, 'id') === 'factory');
assert.equal(attr(factoryRow, 'aria-expanded'), 'false', 'Factory row must start aria-expanded="false"');
const subId = attr(factoryRow, 'data-fold');
assert.ok(subId, 'Factory row must name its parts list (data-fold)');
const subList = html.match(new RegExp(`<ul\\b[^>]*\\bid="${subId}"[^>]*>([\\s\\S]*?)</ul>`));
assert.ok(subList, `No parts list id="${subId}"`);
assert.equal([...subList[1].matchAll(/<button\b[^>]*\bdata-slug=/g)].length, 7, 'Parts list must hold 7 part rows');
assert.match(subList[0].slice(0, subList[0].indexOf('>') + 1), /\bhidden\b/, 'Parts list must start hidden');
assert.match(html, /setAttribute\(['"]aria-expanded['"]/, 'Script must flip aria-expanded');
assert.equal(rows.filter((r) => attr(r, 'data-fold')).length, 1, 'Only the factory is a harmonica');

// --- Top bar: Resume / Projects / README / Factory, Projects current ---
const nav = html.match(/<nav\b[^>]*aria-label="Site"[^>]*>([\s\S]*?)<\/nav>/);
assert.ok(nav, 'Missing site nav');
const navLinks = [...nav[1].matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
assert.deepEqual(
  navLinks.map((a) => [attr(a, 'href'), a.replace(/<[^>]+>/g, '').trim()]),
  [['/resume/', 'Resume'], ['/projects/', 'Projects'], ['/readme/', 'README'], ['/factory/', 'Factory']],
);
const current = navLinks.filter((a) => attr(a, 'aria-current') === 'page');
assert.equal(current.length, 1, 'Exactly one nav link may be aria-current="page"');
assert.equal(attr(current[0], 'href'), '/projects/', 'Projects must be the current page');
assert.match(html, /<a\b[^>]*href="\/"[^>]*>[\s\S]*?Jonatan Snyders/, 'Missing home link with name');

// --- Footer: GitHub + LinkedIn + copyright ---
const footer = html.match(/<footer\b[\s\S]*?<\/footer>/);
assert.ok(footer, 'Missing footer');
assert.match(footer[0], /href="https:\/\/github\.com\/jsnyde0\/?"/, 'Footer: missing GitHub link');
assert.match(footer[0], /href="https:\/\/www\.linkedin\.com\/in\/jonatan-snyders\/?"/, 'Footer: missing LinkedIn link');
assert.match(footer[0], new RegExp(`© ${new Date().getFullYear()} Jonatan Snyders`), 'Footer: missing "© <year> Jonatan Snyders"');

// --- Project links render (in the panels) ---
for (const p of projects) for (const l of p.links ?? []) {
  assert.ok(html.includes(`href="${l.href}"`), `Missing link ${l.href} for ${p.slug}`);
}

// --- Third-party tools that belong ONLY to /factory must NOT appear ---
for (const name of ['TelePi', 'herdr', 'cmux', 'agent_mail', 'cass']) {
  assert.equal(html.includes(name), false, `Third-party tool must not appear on /projects: ${name}`);
}

// --- Other built pages exist ---
for (const route of ['resume', 'readme']) {
  assert.ok(existsSync(join('dist', route, 'index.html')), `Missing built route: dist/${route}/index.html`);
}

// --- /resume file tree and panels stay in parity ---
const resumeHtml = readFileSync(join('dist', 'resume', 'index.html'), 'utf8');
const attrValues = (a) =>
  [...resumeHtml.matchAll(new RegExp(`\\b${a}="([^"]*)"`, 'g'))].map((m) => m[1]).sort();
const treePaths = attrValues('data-path');
const panelPaths = attrValues('data-panel');
assert.ok(treePaths.length > 0, 'No tree entries (data-path) found in dist/resume/index.html');
assert.deepEqual(treePaths, panelPaths, `Resume tree entries and panels differ (tree ${treePaths.length}, panels ${panelPaths.length})`);

console.log('projects page verification passed');
