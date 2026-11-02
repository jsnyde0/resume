// PROTOTYPE (resume-t7j round 3, variant 3b): the whole story as keyframe tracks over T in [0,10].
// Beat k (1..9) owns T in [k, k+1); the intro owns [0,1). Camera moves sit around the integer boundaries,
// the middle of each unit holds the camera while scripted events (data-* attrs in the SVG) play.
import { LEAF, S, B, BUS_Y, LEAF_Y, W2, PAPER_REST, stepCard } from './world';

export const TOTAL = 10;
/** reduced motion: the state we freeze on (tree fully grown, card half way up the chain) */
export const STATIC_T = 7.62;

type Track = number[][];

/** camera: [T, cx, cy, Wp] where Wp is the world width visible in the "panel" (the part of the screen not under copy) */
// landscape: copy column on the left (42vw), world panel on the right
export const CAM_LAND: Track = [
  [0, 1130, -900, 1900],
  [1.0, 1130, -900, 1900],
  [1.85, 1130, -860, 1700],
  [2.05, 1130, -350, 2000],
  [2.35, 2200, 800, 3300],
  [3.95, 2200, 820, 3300],
  [4.1, 2100, 1250, 3500],
  [4.95, 2100, 1270, 3500],
  [5.05, 2000, 1500, 3400],
  [5.95, 2000, 1550, 3400],
  [6.1, 560, 2140, 1500],
  [6.95, 560, 2140, 1500],
  [7.1, 700, 1900, 1900],
  [7.3, 800, 1250, 2100],
  [7.6, 1000, 800, 2200],
  [7.85, 1000, 620, 2300],
  [8.05, 430, 430, 1800],
  [9.0, 430, 430, 1800],
  [9.35, 1130, -420, 2500],
  [9.9, 1950, 550, 4500],
  [10, 1950, 550, 4500],
];

// portrait: copy block on top, world panel is a roughly square strip at the bottom
export const CAM_PORT: Track = [
  [0, 1130, -950, 1800],
  [1.0, 1130, -950, 1800],
  [1.85, 1130, -900, 1600],
  [2.05, 1130, -300, 1800],
  [2.35, 1950, 800, 3500],
  [3.0, 1950, 800, 3500],
  [3.15, 1800, 640, 2700],
  [3.9, 1800, 660, 2700],
  [4.05, 1100, 1000, 2100],
  [4.45, 1100, 1000, 2100],
  [4.7, 2600, 1150, 2200],
  [5.0, 2600, 1250, 2200],
  [5.65, 2700, 1350, 1900],
  [5.75, 2700, 1350, 1900],
  [5.98, 700, 1750, 1800],
  [6.1, 600, 2150, 1500],
  [6.95, 600, 2150, 1500],
  [7.1, 650, 1900, 1500],
  [7.3, 800, 1250, 1700],
  [7.6, 1050, 800, 1900],
  [7.85, 1050, 560, 2000],
  [8.05, 430, 430, 1700],
  [9.0, 430, 430, 1700],
  [9.35, 1130, -450, 2000],
  [9.9, 1950, 550, 4200],
  [10, 1950, 550, 4200],
];

/** the task: [T, x, y, w, h, radius, check, glow] */
// SHORTCUT: each waypoint segment is eased separately, so the card brakes at every corner; production needs one path-following ease per route.
// SHORTCUT: all T values, camera keys and the 4 patch/lane positions are hand-tuned for 1440x900 and 390x844 only; no layout math for other aspect ratios.
const D0 = stepCard(0);
const D4 = stepCard(4);
const card = (t: number, x: number, y: number, chk = 1, w = 280, h = 190): number[] => [t, x, y, w, h, 18, chk, 1];
export const TASK: Track = [
  // a text cursor on the laptop prompt
  [0, 1060, -990, 40, 76, 0, 0, 0],
  [1.95, 1060, -990, 40, 76, 0, 0, 0],
  // leaves the laptop down the SSH line, arrives at the brain
  [2.1, B[0], -560, 56, 56, 28, 0, 0],
  [2.36, B[0], B[1], 56, 56, 28, 0, 0],
  [3.25, B[0], B[1], 56, 56, 28, 0, 0],
  // rides the first dispatch to the sub-brain
  [3.55, S[0], S[1], 56, 56, 28, 0, 0],
  [4.2, S[0], S[1], 56, 56, 28, 0, 0],
  // and the second dispatch to the build driver
  [4.3, S[0], BUS_Y, 56, 56, 28, 0, 0],
  [4.4, LEAF.build.x, BUS_Y, 56, 56, 28, 0, 0],
  [4.5, LEAF.build.x, LEAF_Y, 56, 56, 28, 0, 0],
  [5.0, LEAF.build.x, LEAF_Y, 56, 56, 28, 0, 0],
  // along the driver's link to its patch
  [5.1, LEAF.build.x, LEAF.build.lane, 56, 56, 28, 0, 0],
  [5.25, 2300, LEAF.build.lane, 56, 56, 28, 0, 0],
  [5.38, LEAF.build.patch[0], LEAF.build.patch[1], 56, 56, 28, 0, 0],
  // the cleared patch condenses into the card; its check draws
  [5.55, LEAF.build.patch[0], LEAF.build.patch[1], 280, 190, 18, 0, 1],
  [5.8, LEAF.build.patch[0], LEAF.build.patch[1], 280, 190, 18, 1, 1],
  // back down the link, down the tree to the worker
  [5.9, 2300, LEAF.build.lane, 280, 190, 18, 1, 1],
  [6.0, LEAF.build.x, LEAF.build.lane, 280, 190, 18, 1, 1],
  [6.08, W2[0], W2[1], 280, 190, 18, 1, 1],
  // into the sandbox: the check is erased, then climbs: try, check, fix
  [6.2, 560, 2040, 150, 105, 10, 0, 0.3],
  [6.3, D0[0], D0[1], 150, 105, 10, 0, 0.3],
  [6.4, ...stepCard(1), 150, 105, 10, 0, 0.3],
  [6.5, ...stepCard(2), 150, 105, 10, 0, 0.3],
  [6.58, ...stepCard(1), 150, 105, 10, 0, 0.3],
  [6.68, ...stepCard(2), 150, 105, 10, 0, 0.3],
  [6.78, ...stepCard(3), 150, 105, 10, 0, 0.3],
  [6.9, D4[0], D4[1], 150, 105, 10, 0, 0.3],
  [7.0, D4[0], D4[1], 150, 105, 10, 1, 1],
  // back UP the same edges, one stamp per level: worker, driver, sub-brain, brain
  [7.12, 560, 2040, 150, 105, 10, 1, 1],
  card(7.2, W2[0], W2[1]),
  card(7.45, LEAF.build.x, LEAF_Y),
  card(7.58, LEAF.build.x, BUS_Y),
  card(7.66, S[0], BUS_Y),
  card(7.72, S[0], S[1]),
  card(7.9, B[0], B[1]),
  // filed on paper
  [8.05, PAPER_REST[0], PAPER_REST[1], 250, 170, 14, 1, 1],
  [10, PAPER_REST[0], PAPER_REST[1], 250, 170, 14, 1, 1],
];

/** one stamp per level on the way up (worker, driver, sub-brain, brain) */
export const STAMP_T = [7.22, 7.47, 7.74, 7.92];

export const VEIL: Track = [[0, 0], [8.1, 0], [8.3, 1], [8.65, 1], [8.9, 0], [10, 0]];
/** 0 open, 1 closed */
export const LID: Track = [[0, 0], [9.35, 0], [9.7, 1], [10, 1]];
/** the home box lit and heartbeating */
export const LIT: Track = [[0, 0], [9.4, 0], [9.8, 1], [10, 1]];

const smooth = (x: number) => x * x * (3 - 2 * x);
export function sample(track: Track, t: number): number[] {
  if (t <= track[0][0]) return track[0].slice(1);
  const last = track[track.length - 1];
  if (t >= last[0]) return last.slice(1);
  let i = 0;
  while (track[i + 1][0] < t) i++;
  const a = track[i];
  const b = track[i + 1];
  const u = b[0] === a[0] ? 1 : smooth((t - a[0]) / (b[0] - a[0]));
  return a.slice(1).map((v, k) => v + (b[k + 1] - v) * u);
}
