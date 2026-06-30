import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
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
      const response = await fetch(url);
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
    const onMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id !== id) return;
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
  await delay(100);
  cleanup();
});
