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

// --- D3: lede sits in the left column, under the h1, in the same head block as the title ---
const head = html.match(/<div\b[^>]*class="head"[^>]*>([\s\S]*?)<\/div>/);
assert.ok(head, 'Missing .head block');
assert.match(head[1], /<h1[^>]*>Building<\/h1>\s*<p[^>]*class="lede"/, 'Lede must directly follow the h1 inside .head');
assert.ok(html.indexOf('class="head"') < html.indexOf('class="tree"') && html.indexOf('class="tree"') < html.indexOf('class="pane"'), 'Order inside .explorer: head, tree, pane');
assert.equal(/<main\b[^>]*>\s*<div class="head"/.test(html), false, 'Head must be inside .explorer, not a full-width row above it');

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
assert.match(html, />\s*7 parts\s*</, 'Factory count label stays "7 parts"');

// --- Agent-skill categories: four harmonicas in Now, directly after factory, in this order ---
const SKILLS = {
  'skills-wayfinding': ['wayfinding skills', ['brainstorm', 'prototype', 'spike', 'research']],
  'skills-learning': ['learning skills', ['learn-chart', 'learn-mission', 'learn-tutor', 'learn-assistant']],
  'skills-plain': ['making the models make sense', ['guide', 'tldr', 'cold-reader']],
  'skills-substrate': ['working substrate', ['decompose', 'send-it', 'adversarial-review', 'recall', 'note', 'retro', 'promote', 'clear-resume']],
};
const nowSlugs = projects.filter((p) => p.status === 'now' && !p.parent).map((p) => p.slug);
const fi = nowSlugs.indexOf('factory');
assert.deepEqual(nowSlugs.slice(fi + 1, fi + 5), Object.keys(SKILLS), 'Four skill categories must follow factory in Now, in order');
const htmlOrder = Object.keys(SKILLS).map((s) => html.indexOf(`id="${s}"`));
assert.ok(htmlOrder.every((v, i) => v > (i ? htmlOrder[i - 1] : html.indexOf('id="factory"'))), 'Category rows render in order after factory');
for (const [slug, [title, kids]] of Object.entries(SKILLS)) {
  const cat = projects.find((p) => p.slug === slug);
  assert.ok(cat && cat.title === title, `Category ${slug} must be titled "${title}"`);
  assert.deepEqual(partsOf(slug).map((k) => k.slug.replace(/^skill-/, '')), kids, `${slug} children`);
  const row = rows.find((r) => attr(r, 'id') === slug);
  assert.ok(row, `No row for ${slug}`);
  assert.equal(attr(row, 'aria-expanded'), 'false', `${slug} must start aria-expanded="false"`);
  assert.equal(attr(row, 'aria-controls'), `panel-${slug}`, `${slug} aria-controls its panel`);
  const list = html.match(new RegExp(`<ul\\b[^>]*\\bid="${attr(row, 'data-fold')}"[^>]*>([\\s\\S]*?)</ul>`));
  assert.ok(list, `${slug} parts list`);
  assert.match(list[0].slice(0, list[0].indexOf('>') + 1), /\bhidden\b/, `${slug} parts list starts hidden`);
  const ids = [...list[1].matchAll(/<button\b[^>]*\bid="([^"]*)"/g)].map((m) => m[1]);
  assert.equal(ids.length, kids.length, `${slug} must hold ${kids.length} child rows`);
  assert.ok(html.includes(`${kids.length} skills`), `${slug} count label "${kids.length} skills"`);
  for (const k of kids) {
    const id = k === 'cold-reader' ? k : `skill-${k}`;
    assert.ok(ids.includes(id), `${slug} must contain row id="${id}"`);
    assert.ok(rows.some((r) => attr(r, 'id') === id), `Row id="${id}" renders`);
  }
}
assert.equal(rows.filter((r) => attr(r, 'data-fold')).length, 5, 'Factory plus four skill categories are the harmonicas');
assert.ok(html.includes('part of working substrate'), 'Pane meta names its parent generically');
assert.equal(html.includes('part of the factory'), false, 'No hardcoded "part of the factory"');

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
