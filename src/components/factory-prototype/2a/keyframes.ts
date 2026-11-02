// PROTOTYPE (resume-t7j round 2, variant 2a): per-beat camera + task keyframes for the flat SVG world.
// Camera = [centreX, centreY, visibleWorldWidth] in world units (world is 3200x1800).
// SHORTCUT: all numbers hand-tuned by eye on 1440x900 and 390x844 only; production derives the camera from
// element bounds in the world, and tunes per aspect ratio.

export interface Key {
  /** which copy block is shown: 'intro' or beat index */
  txt: 'intro' | number;
  L: [number, number, number]; // landscape camera
  P: [number, number, number]; // portrait camera
  task: { x: number; y: number; w: number; h: number; r: number; chk: number; glow: number };
  dark: number;
  dots: number;
  /** fog remaining per patch P1..P5, 0..1 */
  fog: [number, number, number, number, number];
}

const circle = (x: number, y: number, d: number, chk = 0, glow = 0) => ({ x, y, w: d, h: d, r: d / 2, chk, glow });
const card = (x: number, y: number, w: number, h: number, chk = 1, glow = 0) => ({ x, y, w, h, r: 20, chk, glow });
const FOG: Key['fog'] = [1, 1, 1, 1, 1];

export const FOG_CENTERS: [number, number][] = [
  [520, 700],
  [900, 430],
  [330, 1260],
  [880, 1290],
  [860, 880],
];

export const keys: Key[] = [
  // 0 intro: whole world, task is a pink dot inside fog patch 1
  { txt: 'intro', L: [1000, 900, 3000], P: [640, 900, 1500], task: circle(520, 700, 110), dark: 0, dots: 0, fog: FOG },
  // 1 map
  { txt: 0, L: [640, 880, 2000], P: [600, 880, 1400], task: circle(520, 700, 110), dark: 0, dots: 0, fog: FOG },
  // 2 dive into the fog patch
  { txt: 1, L: [560, 700, 900], P: [520, 700, 700], task: circle(520, 700, 150), dark: 0, dots: 0, fog: FOG },
  // 3 cleared: card with a check
  { txt: 2, L: [660, 700, 1000], P: [560, 700, 650], task: card(520, 700, 280, 180), dark: 0, dots: 0, fog: [0, 1, 1, 1, 1] },
  // 4 brain hands it over
  { txt: 3, L: [1850, 520, 1500], P: [1800, 520, 800], task: card(1850, 560, 200, 130), dark: 0, dots: 0, fog: [0, 1, 1, 1, 1] },
  // 5 ...to the worker
  { txt: 3, L: [2300, 700, 1500], P: [2350, 680, 800], task: card(2300, 640, 180, 120), dark: 0, dots: 0, fog: [0, 1, 1, 1, 1] },
  // 6 climb start (inside sandbox, bottom step)
  { txt: 4, L: [2700, 1130, 1300], P: [2650, 1130, 800], task: circle(2410, 1305, 90, 0), dark: 0, dots: 0, fog: [0, 1, 1, 1, 1] },
  // 7 climb top, check passes
  { txt: 4, L: [2700, 1130, 1300], P: [2650, 1130, 800], task: circle(2830, 1005, 90, 1), dark: 0, dots: 0, fog: [0, 1, 1, 1, 1] },
  // 8 on the paper stack
  { txt: 5, L: [1960, 1180, 1000], P: [1960, 1200, 700], task: card(1960, 1180, 180, 120), dark: 0, dots: 0, fog: [0, 1, 1, 1, 1] },
  // 9 blackout, glowing
  { txt: 6, L: [1960, 1180, 1000], P: [1960, 1200, 650], task: card(1960, 1180, 180, 120, 1, 1), dark: 0.94, dots: 0, fog: [0, 1, 1, 1, 1] },
  // 10 zoom out to the home box, one dot among many
  { txt: 7, L: [2180, 900, 3100], P: [2200, 900, 2100], task: circle(1470, 900, 52), dark: 0, dots: 1, fog: [0, 1, 1, 1, 1] },
  // 11 shipped: back on the map, less fog
  { txt: 8, L: [1590, 900, 5300], P: [1590, 900, 3200], task: card(520, 700, 120, 120, 1), dark: 0, dots: 0.6, fog: [0, 0.8, 0, 1, 0.7] },
];

/** flatten for interpolation */
export function flat(k: Key, portrait: boolean): number[] {
  const c = portrait ? k.P : k.L;
  const t = k.task;
  return [...c, t.x, t.y, t.w, t.h, t.r, t.chk, t.glow, k.dark, k.dots, ...k.fog];
}
