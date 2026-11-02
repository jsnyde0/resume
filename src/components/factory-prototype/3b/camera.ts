// PROTOTYPE (resume-t7j round 3, variant 3b): scroll progress -> T -> camera + every scripted SVG element.
// The SVG markup carries its own choreography as data attributes (data-in / data-out / data-draw / data-pulse),
// so adding an event is a markup edit, not a code edit.
// SHORTCUT: no resize re-tuning of the copy-column height; orientation picked by aspect only; reduced motion freezes one overview.
import { TOTAL, STATIC_T, CAM_LAND, CAM_PORT, TASK, VEIL, LID, LIT, sample } from './timeline';
import { LAPTOP } from './world';

const track = document.getElementById('track') as HTMLElement;
const stage = document.getElementById('stage') as HTMLElement;
const svg = document.getElementById('world-svg') as unknown as SVGSVGElement;
const world = document.getElementById('world') as unknown as SVGGElement;
const taskG = document.getElementById('task') as unknown as SVGGElement;
const taskRect = document.getElementById('task-rect') as unknown as SVGRectElement;
const taskChk = document.getElementById('task-chk') as unknown as SVGPathElement;
const stamps = document.getElementById('stamps') as unknown as SVGGElement;
const glow1 = document.getElementById('glow1') as unknown as SVGCircleElement;
const glow2 = document.getElementById('glow2') as unknown as SVGCircleElement;
const veil = document.getElementById('veil') as unknown as SVGRectElement;
const lid = document.getElementById('lid') as unknown as SVGGElement;
const frame = document.getElementById('box-frame') as unknown as SVGRectElement;
const col = document.getElementById('col') as HTMLElement;
const copies = Array.from(document.querySelectorAll<HTMLElement>('[data-txt]'));

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
};
const range = (s: string | undefined): [number, number] | null => {
  if (!s) return null;
  const [a, b] = s.split(',').map(Number);
  return [a, b];
};
const prog = (T: number, r: [number, number] | null) => (r ? smooth((T - r[0]) / (r[1] - r[0])) : 0);

interface Scripted {
  el: SVGElement;
  inR: [number, number] | null;
  outR: [number, number] | null;
  drawR: [number, number] | null;
  pulseR: [number, number] | null;
  along: SVGGeometryElement | null;
  len: number;
  pop: boolean;
  fog: boolean;
}
const scripted: Scripted[] = Array.from(document.querySelectorAll<SVGElement>('[data-in],[data-out],[data-draw],[data-pulse]')).map((el) => {
  const along = el.dataset.along ? (document.getElementById(el.dataset.along) as unknown as SVGGeometryElement) : null;
  return {
    el,
    inR: range(el.dataset.in),
    outR: range(el.dataset.out),
    drawR: range(el.dataset.draw),
    pulseR: range(el.dataset.pulse),
    along,
    len: along ? along.getTotalLength() : 0,
    pop: el.hasAttribute('data-pop'),
    fog: el.hasAttribute('data-fog'),
  };
});

let lastLive = false;

function applyScripted(T: number) {
  for (const s of scripted) {
    const el = s.el as SVGElement & { style: CSSStyleDeclaration };
    if (s.pulseR) {
      const p = (T - s.pulseR[0]) / (s.pulseR[1] - s.pulseR[0]);
      if (p <= 0 || p >= 1 || !s.along) {
        el.style.opacity = '0';
        continue;
      }
      const pt = s.along.getPointAtLength(s.len * smooth(p));
      el.setAttribute('cx', String(pt.x));
      el.setAttribute('cy', String(pt.y));
      el.style.opacity = '1';
      continue;
    }
    const pin = s.inR ? prog(T, s.inR) : 1;
    const pout = prog(T, s.outR);
    if (s.drawR) {
      const p = prog(T, s.drawR);
      el.style.strokeDashoffset = String(1 - p);
      el.style.opacity = p > 0.001 ? '1' : '0';
      continue;
    }
    const o = pin * (1 - pout);
    el.style.opacity = String(o);
    if (s.fog) el.style.transform = `scale(${(0.7 + 0.3 * pin) * (1 + 0.18 * pout)})`;
    else if (s.pop) el.style.transform = `scale(${0.6 + 0.4 * pin})`;
  }
}

function render() {
  const vw = svg.clientWidth;
  const vh = svg.clientHeight;
  const portrait = !reduce && vw < vh * 0.9;
  let T: number;
  if (reduce) T = STATIC_T;
  else {
    const span = Math.max(1, track.offsetHeight - stage.offsetHeight);
    T = clamp01(-track.getBoundingClientRect().top / span) * TOTAL;
  }

  // camera
  if (reduce) {
    const sc = Math.min(vw / 4100, vh / 4000);
    world.setAttribute('transform', `translate(${vw / 2 - 1950 * sc} ${vh / 2 - 550 * sc}) scale(${sc})`);
  } else {
    const [cx, cy, Wp] = sample(portrait ? CAM_PORT : CAM_LAND, T);
    const sc = (portrait ? vw : vw * 0.58) / Wp;
    const fx = portrait ? 0.5 : 0.71;
    const fy = portrait ? 0.7 : 0.5;
    world.setAttribute('transform', `translate(${vw * fx - cx * sc} ${vh * fy - cy * sc}) scale(${sc})`);
  }

  applyScripted(T);

  // task
  const [tx, ty, tw, th, tr, chk, glow] = sample(TASK, T);
  taskG.setAttribute('transform', `translate(${tx} ${ty})`);
  taskRect.setAttribute('x', String(-tw / 2));
  taskRect.setAttribute('y', String(-th / 2));
  taskRect.setAttribute('width', String(tw));
  taskRect.setAttribute('height', String(th));
  taskRect.setAttribute('rx', String(Math.min(tr, tw / 2, th / 2)));
  const m = Math.min(tw, th);
  const yo = -0.12 * th;
  taskChk.setAttribute('d', `M${-0.26 * m} ${yo + 0.02 * m} L${-0.07 * m} ${yo + 0.22 * m} L${0.28 * m} ${yo - 0.2 * m}`);
  taskChk.setAttribute('stroke-width', String(m * 0.09));
  taskChk.setAttribute('stroke-dashoffset', String(1 - clamp01(chk)));
  taskChk.setAttribute('opacity', chk > 0.01 ? '1' : '0');
  stamps.setAttribute('transform', `scale(${tw / 280})`);
  const gr = Math.max(tw, th);
  glow1.setAttribute('r', String(gr * 0.75));
  glow2.setAttribute('r', String(gr * 1.2));
  glow1.setAttribute('opacity', String(glow));
  glow2.setAttribute('opacity', String(0.5 * glow));

  // veil, lid, lit box
  veil.setAttribute('opacity', String(sample(VEIL, T)[0]));
  const closed = sample(LID, T)[0];
  const hy = LAPTOP.screenBottom;
  lid.setAttribute('transform', `translate(0 ${hy}) scale(1 ${1 - 0.94 * closed}) translate(0 ${-hy})`);
  const lit = sample(LIT, T)[0];
  frame.style.stroke = lit > 0.5 ? 'var(--id-lime)' : 'var(--id-paper-2)';
  const live = !reduce && lit > 0.95;
  if (live !== lastLive) {
    svg.classList.toggle('live', live);
    lastLive = live;
  }

  // SHORTCUT: the copy crossfade is a short linear 50/50 overlap, so two blocks briefly ghost over each other (~0.1 of a beat); production should offset or sequence them.
  // copy: block j owns [a,b); linear crossfade (in + out sum to 1) over a short window so copy never blanks
  col.style.opacity = reduce ? '0' : String(1 - (T < 1 ? 1 - smooth((T - 0.92) / 0.16) : 0));
  copies.forEach((el) => {
    const j = el.dataset.txt === 'intro' ? 0 : Number(el.dataset.txt) + 1;
    const a = j;
    const b = j + 1;
    const fin = j === 0 ? 1 : clamp01((T - (a - 0.05)) / 0.1);
    const fout = j === TOTAL - 1 ? 1 : 1 - clamp01((T - (b - 0.05)) / 0.1);
    const o = reduce ? 1 : fin * fout;
    el.style.opacity = String(o);
    el.style.visibility = o < 0.02 ? 'hidden' : 'visible';
    el.style.transform = reduce ? '' : `translateY(${(1 - fin) * 14 - (1 - fout) * 14}px)`;
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
