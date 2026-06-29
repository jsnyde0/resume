import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const routePath = join('dist', 'projects', 'index.html');
const inventoryPath = join('docs', 'projects-source-inventory.md');

assert.ok(existsSync(routePath), `Missing built route: ${routePath}`);
assert.ok(existsSync(inventoryPath), `Missing inventory doc: ${inventoryPath}`);

const html = readFileSync(routePath, 'utf8');
const inventory = readFileSync(inventoryPath, 'utf8');

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

// --- Legacy project titles must NOT appear ---
const legacyTitles = [
  'Just Show Up',
  'eBayes',
  'Async Data Pipeline',
  'Object Detection API',
  'TopBottomBabes',
  'Getting Tasks Done',
];
for (const title of legacyTitles) {
  assert.equal(html.includes(title), false, `Legacy project title still present: ${title}`);
}

// --- No legacy image assets referenced ---
const legacyAssets = [
  '/img/just_show_up.png',
  '/img/ebayes-1.png',
  '/img/async-data-pipeline.png',
  '/img/yolo-api-apples-and-oranges.jpg',
  '/img/topbottombabes-1.png',
  '/img/getting_tasks_done-home.png',
];
for (const asset of legacyAssets) {
  assert.equal(html.includes(asset), false, `Legacy image asset still referenced in HTML: ${asset}`);
}

// --- No carousel markup ---
assert.equal(html.includes('data-carousel-root'), false, 'Carousel markup still present (data-carousel-root)');
assert.equal(html.includes('data-carousel-slide'), false, 'Carousel markup still present (data-carousel-slide)');

// --- No forbidden template patterns ---
for (const pattern of ['{%', '{#', '<c-', 'hx-', 'django-cotton="', '{% include', '{% extends']) {
  assert.equal(html.includes(pattern), false, `Built HTML still contains forbidden pattern: ${pattern}`);
}

// --- Inventory doc still has its 5 required section headers ---
for (const note of [
  '## Source templates reviewed',
  '## Shared chrome',
  '## Projects page mapping',
  '## Desktop/mobile preview checks',
  '## Tolerated visual deviations',
]) {
  assert.match(inventory, new RegExp(note.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Missing inventory section: ${note}`);
}

console.log('projects page verification passed');
