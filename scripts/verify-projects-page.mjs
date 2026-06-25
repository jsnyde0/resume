import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const routePath = join('dist', 'projects', 'index.html');
const inventoryPath = join('docs', 'projects-source-inventory.md');

assert.ok(existsSync(routePath), `Missing built route: ${routePath}`);
assert.ok(existsSync(inventoryPath), `Missing inventory doc: ${inventoryPath}`);

const html = readFileSync(routePath, 'utf8');
const inventory = readFileSync(inventoryPath, 'utf8');

const expectedTitles = [
  'Web Development',
  'Just Show Up',
  'eBayes',
  'Async Data Pipeline',
  'Object Detection API',
  'TopBottomBabes',
  'Getting Tasks Done',
];

for (const title of expectedTitles) {
  assert.match(html, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

for (const pattern of ['{%', '{#', '<c-', 'hx-', 'django-cotton="', '{% include', '{% extends']) {
  assert.equal(html.includes(pattern), false, `Built HTML still contains forbidden pattern: ${pattern}`);
}

for (const asset of [
  '/img/just_show_up.png',
  '/img/ebayes-1.png',
  '/img/ebayes-2.png',
  '/img/ebayes-3.png',
  '/img/ebayes-4.png',
  '/img/async-data-pipeline.png',
  '/img/yolo-api-apples-and-oranges.jpg',
  '/img/topbottombabes-1.png',
  '/img/topbottombabes-2.png',
  '/img/topbottombabes-3.png',
  '/img/topbottombabes-4.png',
  '/img/topbottombabes-5.png',
  '/img/getting_tasks_done-home.png',
  '/img/getting_tasks_done-subtask.png',
]) {
  assert.match(html, new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.ok(existsSync(join('dist', asset.slice(1))), `Missing built asset: dist/${asset.slice(1)}`);
}

for (const note of [
  '## Source templates reviewed',
  '## Shared chrome',
  '## Projects page mapping',
  '## Desktop/mobile preview checks',
  '## Tolerated visual deviations',
]) {
  assert.match(inventory, new RegExp(note.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

console.log('projects page verification passed');
