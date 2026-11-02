// PROTOTYPE (resume-t7j round 3, variant 3a): scroll -> interpolated camera + named channels on the nested SVG world.
// Channels are driven by data-* attributes: data-ch (opacity), data-draw (stroke draw-on), data-pop (scale-in),
// data-fog (fog patch shrink+fade). Zoom is exponential; the pan follows zoom so a zoom target stays put on screen.
// SHORTCUT: task follows straight/polyline paths (no curves); reduced motion shows one static overview (last key);
// portrait vs landscape by aspect only, no re-tuning of copy-column height on resize.
import { keys, flatCam, CH_DEFAULT, type Ch } from './keyframes';

const $ = (id: string) => document.getElementById(id) as HTMLElement & SVGElement;
const track = $('track');
const stage = $('stage');
const svg = $('world-svg') as unknown as SVGSVGElement;
const world = $('world');
const taskG = $('task');
const taskRect = $('task-rect');
const taskChk = $('task-chk');
const glow1 = $('glow1');
const glow2 = $('glow2');
const veil = $('dark');
const lid = $('lid');
const col = $('col');
const copies = Array.from(document.querySelectorAll<HTMLElement>('[data-txt]'));

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const N = keys.length - 1;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const ease = (u: number) => smooth(clamp01((u - 0.15) / 0.7));
const remap = (v: number, off: number) => clamp01((v - off) / (1 - off));

// scroll length per segment (in viewport heights): reading segments (same copy block) are longer than transitions
const segLen = keys.slice(0, -1).map((k, i) => (k.txt === keys[i + 1].txt ? 0.9 : 0.7));
const cum = [0];
segLen.forEach((l) => cum.push(cum[cum.length - 1] + l));
const total = cum[cum.length - 1];
if (!reduce) track.style.height = `${(total + 1) * 100}svh`;

// stagger windows inside a segment so sequences read as sequences
const win: Record<string, [number, number]> = {
  d0: [0, 0.4], d1: [0.2, 0.6], d2: [0.4, 0.8], d3: [0.6, 1],
  f0: [0, 0.5], f1: [0.25, 0.75], f2: [0.5, 1],
};

type Bind = { el: SVGElement; kind: 'ch' | 'draw' | 'pop' | 'fog'; off: number };
const binds = new Map<string, Bind[]>();
for (const kind of ['ch', 'draw', 'pop', 'fog'] as const) {
  document.querySelectorAll<SVGElement>(`[data-${kind}]`).forEach((el) => {
    const name = el.getAttribute(`data-${kind}`)!;
    const off = Number(el.getAttribute('data-off') ?? 0);
    (binds.get(name) ?? binds.set(name, []).get(name)!).push({ el, kind, off });
  });
}

function pathPoint(pts: [number, number][], v: number): [number, number] {
  const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const sum = L.reduce((a, b) => a + b, 0) || 1;
  let d = v * sum;
  for (let i = 0; i < L.length; i++) {
    if (d <= L[i] || i === L.length - 1) {
      const f = L[i] ? Math.min(1, d / L[i]) : 1;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
    }
    d -= L[i];
  }
  return pts[pts.length - 1];
}

function apply(name: string, val: number) {
  for (const b of binds.get(name) ?? []) {
    const v = remap(val, b.off);
    if (b.kind === 'ch') b.el.setAttribute('opacity', String(v));
    else if (b.kind === 'draw') b.el.setAttribute('stroke-dashoffset', String(1 - v));
    else if (b.kind === 'pop') {
      b.el.setAttribute('transform', `scale(${Math.max(0.001, v)})`);
      b.el.setAttribute('opacity', String(v));
    } else {
      const cx = b.el.getAttribute('data-cx'), cy = b.el.getAttribute('data-cy');
      b.el.setAttribute('transform', `translate(${cx} ${cy}) scale(${0.7 + 0.3 * v})`);
      b.el.setAttribute('opacity', String(v));
    }
  }
}

function stateAt(t: number, portrait: boolean) {
  t = Math.min(N, Math.max(0, t));
  const i = Math.min(N - 1, Math.floor(t));
  const u = t - i;
  const v = ease(u);
  const A = keys[i], B = keys[i + 1];
  // camera: exponential zoom; the pan fraction tracks the zoom so a fixed zoom target stays fixed on screen
  const ca = flatCam(A, portrait), cb = flatCam(B, portrait);
  const w = ca[2] * Math.pow(cb[2] / ca[2], v);
  const ratio = Math.max(ca[2], cb[2]) / Math.min(ca[2], cb[2]);
  const g = ratio > 1.15 ? (ca[2] - w) / (ca[2] - cb[2]) : v;
  const cam = [ca[0] + (cb[0] - ca[0]) * g, ca[1] + (cb[1] - ca[1]) * g, w];
  // task
  const ta = A.task, tb = B.task;
  const pts: [number, number][] = [[ta.x, ta.y], ...(tb.via ?? []), [tb.x, tb.y]];
  const [x, y] = pathPoint(pts, v);
  const lerp = (a: number, b: number) => a + (b - a) * v;
  const task = { x, y, w: lerp(ta.w, tb.w), h: lerp(ta.h, tb.h), r: lerp(ta.r, tb.r), chk: lerp(ta.chk, tb.chk), glow: lerp(ta.glow, tb.glow) };
  // channels
  const ch = {} as Record<string, number>;
  for (const name of Object.keys(CH_DEFAULT) as (keyof Ch)[]) {
    const [s, e] = win[name] ?? [0, 1];
    const vv = clamp01((v - s) / (e - s));
    ch[name] = A.ch[name] + (B.ch[name] - A.ch[name]) * vv;
  }
  // copy: out then in, overlapped so something readable is always on screen
  const op = new Map<string | number, number>();
  if (A.txt === B.txt) op.set(A.txt, 1);
  else {
    op.set(A.txt, clamp01(1 - (u - 0.32) / 0.28));
    op.set(B.txt, clamp01((u - 0.4) / 0.28));
  }
  return { cam, task, ch, op };
}

function render() {
  const vw = svg.clientWidth, vh = svg.clientHeight;
  const portrait = !reduce && vw < vh * 0.9;
  let t: number;
  if (reduce) t = N;
  else {
    const range = Math.max(1, track.offsetHeight - stage.offsetHeight);
    const p = clamp01(-track.getBoundingClientRect().top / range);
    const s = p * total;
    let i = 0;
    while (i < segLen.length - 1 && cum[i + 1] <= s) i++;
    t = i + clamp01((s - cum[i]) / segLen[i]);
  }
  const { cam, task, ch, op } = stateAt(t, portrait);
  const [cx, cy, w0] = cam;
  const w = reduce ? 700 * (vw / vh) : w0; // SHORTCUT: reduced-motion overview framing is a fixed 700-unit-tall window
  const fx = reduce ? 0.5 : portrait ? 0.5 : 0.71;
  const fy = reduce ? 0.5 : portrait ? 0.7 : 0.5;
  const sc = vw / w;
  world.setAttribute('transform', `translate(${vw * fx - cx * sc} ${vh * fy - cy * sc}) scale(${sc})`);

  taskG.setAttribute('transform', `translate(${task.x} ${task.y})`);
  taskRect.setAttribute('x', String(-task.w / 2));
  taskRect.setAttribute('y', String(-task.h / 2));
  taskRect.setAttribute('width', String(task.w));
  taskRect.setAttribute('height', String(task.h));
  taskRect.setAttribute('rx', String(Math.min(task.r, task.w / 2, task.h / 2)));
  const m = Math.min(task.w, task.h);
  taskChk.setAttribute('d', `M${-0.26 * m} ${0.02 * m} L${-0.07 * m} ${0.22 * m} L${0.28 * m} ${-0.2 * m}`);
  taskChk.setAttribute('stroke-width', String(m * 0.09));
  taskChk.setAttribute('stroke-dashoffset', String(1 - clamp01(task.chk)));
  taskChk.setAttribute('opacity', task.chk > 0.01 ? '1' : '0');
  const gr = Math.max(task.w, task.h);
  glow1.setAttribute('r', String(gr * 0.8));
  glow2.setAttribute('r', String(gr * 1.3));
  glow1.setAttribute('stroke-width', String(gr * 0.045));
  glow2.setAttribute('stroke-width', String(gr * 0.02));
  glow1.setAttribute('opacity', String(task.glow));
  glow2.setAttribute('opacity', String(0.5 * task.glow));

  for (const name of Object.keys(ch)) apply(name, ch[name]);
  veil.setAttribute('opacity', String(ch.dark));
  lid.setAttribute('transform', `translate(0 392) scale(1 ${Math.max(0.04, ch.lid)}) translate(0 -392)`);

  col.style.opacity = reduce ? '0' : String(1 - (op.get('intro') ?? 0));
  copies.forEach((el) => {
    const k = el.dataset.txt === 'intro' ? 'intro' : Number(el.dataset.txt);
    const o = reduce ? 1 : (op.get(k) ?? 0);
    el.style.opacity = String(o);
    el.style.visibility = o < 0.02 ? 'hidden' : 'visible';
    el.style.transform = reduce ? '' : `translateY(${(1 - o) * 12}px)`;
  });
}

let queued = false;
const schedule = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    render();
  });
};
render();
if (!reduce) {
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
}
document.fonts?.ready.then(render);
