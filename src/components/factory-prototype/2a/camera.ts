// PROTOTYPE (resume-t7j round 2, variant 2a): scroll progress -> interpolated camera/task state on the SVG world.
// SHORTCUT: task and fog interpolate on straight lines with the camera easing (no curved paths); reduced-motion shows one static overview (t=N); portrait/landscape picked by aspect only, no resize re-tuning of copy-column height.
import { keys, flat, FOG_CENTERS } from './keyframes';

const track = document.getElementById('track') as HTMLElement;
const stage = document.getElementById('stage') as HTMLElement;
const svg = document.getElementById('world-svg') as unknown as SVGSVGElement;
const world = document.getElementById('world') as unknown as SVGGElement;
const taskG = document.getElementById('task') as unknown as SVGGElement;
const taskRect = document.getElementById('task-rect') as unknown as SVGRectElement;
const taskChk = document.getElementById('task-chk') as unknown as SVGPathElement;
const glow1 = document.getElementById('glow1') as unknown as SVGCircleElement;
const glow2 = document.getElementById('glow2') as unknown as SVGCircleElement;
const darkRect = document.getElementById('dark') as unknown as SVGRectElement;
const dots = document.getElementById('dots') as unknown as SVGGElement;
const fogs = Array.from(document.querySelectorAll<SVGGElement>('.fog'));
const col = document.getElementById('col') as HTMLElement;
const copies = Array.from(document.querySelectorAll<HTMLElement>('[data-txt]'));

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const N = keys.length - 1;

const smooth = (x: number) => x * x * (3 - 2 * x);
/** camera hold at each end of a segment, then a smooth move */
const ease = (u: number) => smooth(Math.min(1, Math.max(0, (u - 0.2) / 0.6)));
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function stateAt(t: number, portrait: boolean) {
  t = Math.min(N, Math.max(0, t));
  const i = Math.min(N - 1, Math.floor(t));
  const u = t - i;
  const v = ease(u);
  const a = flat(keys[i], portrait);
  const b = flat(keys[i + 1], portrait);
  const s = a.map((x, k) => x + (b[k] - x) * v);
  // copy opacity per block
  const ta = keys[i].txt;
  const tb = keys[i + 1].txt;
  const op = new Map<string | number, number>();
  if (ta === tb) op.set(ta, 1);
  else {
    op.set(ta, clamp01(1 - (u - 0.3) / 0.17));
    op.set(tb, clamp01((u - 0.53) / 0.17));
  }
  return { s, op };
}

function render() {
  const vw = svg.clientWidth;
  const vh = svg.clientHeight;
  const portrait = !reduce && vw < vh * 0.9;
  let t: number;
  if (reduce) t = N; // static overview (whole map, task shipped)
  else {
    const range = Math.max(1, track.offsetHeight - stage.offsetHeight);
    const p = clamp01(-track.getBoundingClientRect().top / range);
    t = p * N;
  }
  const { s, op } = stateAt(t, portrait);
  const [cx, cy, w, tx, ty, tw, th, tr, chk, glow, dark, dotsO, ...fog] = s;
  const fx = reduce ? 0.5 : portrait ? 0.5 : 0.71;
  const fy = reduce ? 0.5 : portrait ? 0.77 : 0.5;
  const sc = vw / w;
  world.setAttribute('transform', `translate(${vw * fx - cx * sc} ${vh * fy - cy * sc}) scale(${sc})`);

  taskG.setAttribute('transform', `translate(${tx} ${ty})`);
  taskRect.setAttribute('x', String(-tw / 2));
  taskRect.setAttribute('y', String(-th / 2));
  taskRect.setAttribute('width', String(tw));
  taskRect.setAttribute('height', String(th));
  taskRect.setAttribute('rx', String(Math.min(tr, tw / 2, th / 2)));
  const m = Math.min(tw, th);
  taskChk.setAttribute('d', `M${-0.26 * m} ${0.02 * m} L${-0.07 * m} ${0.22 * m} L${0.28 * m} ${-0.2 * m}`);
  taskChk.setAttribute('stroke-width', String(m * 0.09));
  taskChk.setAttribute('stroke-dashoffset', String(1 - clamp01(chk)));
  taskChk.setAttribute('opacity', chk > 0.01 ? '1' : '0');
  const gr = Math.max(tw, th);
  glow1.setAttribute('r', String(gr * 0.8));
  glow2.setAttribute('r', String(gr * 1.3));
  glow1.setAttribute('opacity', String(glow));
  glow2.setAttribute('opacity', String(0.5 * glow));
  darkRect.setAttribute('opacity', String(dark));
  dots.setAttribute('opacity', String(dotsO));
  fogs.forEach((g, i) => {
    const a = fog[i];
    const [fcx, fcy] = FOG_CENTERS[i];
    g.setAttribute('transform', `translate(${fcx} ${fcy}) scale(${0.7 + 0.3 * a})`);
    g.setAttribute('opacity', String(a));
  });
  col.style.opacity = reduce ? '0' : String(1 - (op.get('intro') ?? 0));
  copies.forEach((el) => {
    const k = el.dataset.txt === 'intro' ? 'intro' : Number(el.dataset.txt);
    const o = reduce ? 1 : (op.get(k) ?? 0);
    el.style.opacity = String(o);
    el.style.visibility = o < 0.02 ? 'hidden' : 'visible';
    el.style.transform = reduce ? '' : `translateY(${(1 - o) * 14}px)`;
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
// world is drawn with the real font; re-render once fonts settle so SVG labels size right
document.fonts?.ready.then(render);
