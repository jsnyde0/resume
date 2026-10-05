// MANUAL, VISUAL-ONLY CHECK — intentionally NOT wired into package.json or the gate.
// Serves dist/ on :4173, drives headless Chrome on :9222, and reads computed styles on
// /resume/ at two widths. It is non-hermetic (needs Chrome and free ports), so it can never
// be a dispatch gate. Behaviour of /resume/ is covered by the verify-resume skill's drive.
// Run by hand after `npm run build`: node scripts/verify-resume-layout.mjs
// It fails fast if the server or Chrome exits, and every wait is time-bounded.
// KNOWN STALE: the 390px `.resume-item-card` column assertion predates the GitHub-browser
// rewrite (88cc6e9) and fails while the page renders fine; see bead resume-r93.
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let finished = false;
const distDir = path.join(root, 'dist');
const htmlPath = path.join(distDir, 'resume', 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error(`FAIL missing built file: ${htmlPath}`);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
if (!html.includes('ghv-shell')) {
  console.error('FAIL source-faithfulness: expected "ghv-shell" (GitHub browser) in built HTML');
  process.exit(1);
}

// Refuse to start if either port is taken: a stray server would serve stale files, and a
// browser already on :9222 (e.g. a debug-enabled personal Chrome) would be driven instead.
for (const url of ['http://127.0.0.1:4173/', 'http://127.0.0.1:9222/json/version']) {
  const taken = await fetch(url, { signal: AbortSignal.timeout(1000) }).then(() => true, () => false);
  if (taken) {
    console.error(`FAIL port already in use: ${url} answered before this script started anything`);
    process.exit(1);
  }
}

const server = spawn('python3', ['-m', 'http.server', '4173', '-d', 'dist'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
});

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--remote-debugging-port=9222',
  'about:blank',
], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
});

for (const [name, child] of [['python3 http.server on :4173', server], ['headless Chrome', chrome]]) {
  child.on('exit', (code, signal) => {
    if (finished) return;
    console.error(`FAIL ${name} exited early (code=${code}, signal=${signal})`);
    cleanup();
    process.exit(1);
  });
}

const cleanup = () => {
  if (!server.killed) server.kill('SIGTERM');
  if (!chrome.killed) chrome.kill('SIGTERM');
};

process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});

async function waitForOk(url, attempts = 50) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return response;
    } catch {}
    await delay(200);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function waitForJson(url, attempts = 50) {
  const response = await waitForOk(url, attempts);
  return response.json();
}

async function cdpSend(ws, method, params = {}) {
  const id = ++cdpSend.id;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener('message', onMessage);
      reject(new Error(`${method}: no CDP reply within 10s`));
    }, 10_000);
    const onMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id !== id) return;
      clearTimeout(timer);
      ws.removeEventListener('message', onMessage);
      if (data.error) reject(new Error(`${method}: ${JSON.stringify(data.error)}`));
      else resolve(data.result ?? {});
    };
    ws.addEventListener('message', onMessage);
  });
}
cdpSend.id = 0;

async function main() {
  await waitForOk('http://127.0.0.1:4173/');
  const targets = await waitForJson('http://127.0.0.1:9222/json/list');
  const pageTarget = targets.find((target) => target.type === 'page');
  if (!pageTarget?.webSocketDebuggerUrl) {
    throw new Error('No debuggable page target found');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  await cdpSend(ws, 'Page.enable');
  await cdpSend(ws, 'Runtime.enable');

  async function measure(width, expected) {
    await cdpSend(ws, 'Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await cdpSend(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/resume/' });
    await delay(500);
    const result = await cdpSend(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const card = document.querySelector('.resume-item-card');
        const resumeCard = document.querySelector('.resume-card');
        if (!card) return { error: 'missing .resume-item-card' };
        if (!resumeCard) return { error: 'missing .resume-card' };
        return {
          itemFlexDirection: getComputedStyle(card).flexDirection,
          cardBorderRadius: getComputedStyle(resumeCard).borderRadius,
        };
      })()`,
      returnByValue: true,
    });
    const value = result.result?.value;
    if (value?.error) throw new Error(value.error);
    if (value.itemFlexDirection !== expected) {
      throw new Error(`Expected ${expected} at width ${width}, got ${value.itemFlexDirection}`);
    }
    if (!value.cardBorderRadius || value.cardBorderRadius === '0px') {
      throw new Error(`Expected styled .resume-card at width ${width}, got borderRadius=${value.cardBorderRadius}`);
    }
    return value;
  }

  const mobile = await measure(390, 'column');
  const desktop = await measure(1200, 'row');

  console.log(JSON.stringify({ mobile, desktop }, null, 2));
  ws.close();
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exitCode = 1;
}).finally(async () => {
  finished = true;
  await delay(100);
  cleanup();
  process.exit();
});
