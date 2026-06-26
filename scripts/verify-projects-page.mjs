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

// --- New entry titles are present ---
const expectedTitles = ['rip-cage', 'TelePi', 'herdr', 'cass / cm'];
for (const title of expectedTitles) {
  assert.match(html, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Missing entry title: ${title}`);
}

// --- Real repo links are present for entries that have them ---
assert.match(html, /https:\/\/github\.com\/jsnyde0\/rip-cage/, 'Missing rip-cage repo link');
assert.match(html, /https:\/\/github\.com\/benedict2310\/TelePi/, 'Missing TelePi repo link');

// --- kind tags: at least one 'built' and at least one 'build on' are rendered ---
assert.match(html, /\bbuild on\b/, 'Missing "build on" kind tag');
assert.match(html, /\bbuilt\b/, 'Missing "built" kind tag');

// --- Author credits present for build-on entries ---
assert.match(html, /Benedict Bleimschein/, 'Missing author credit: Benedict Bleimschein');
assert.match(html, /Ogulcan Celik/, 'Missing author credit: Ogulcan Celik');

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

// --- No carousel markup left over ---
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
