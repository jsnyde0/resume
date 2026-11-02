// PROTOTYPE (resume-t7j round 3, variant 3b): world geometry shared by the page markup, timeline and camera.
// One flat SVG world. Laptop above the box, an SSH line drops into the box to the brain.
// Inside: dispatch TREE on the left, project MAP on the right, thin links tree node -> owned map region.

export const BOX = { x: 0, y: 0, w: 3900, h: 2500 };
export const LAPTOP = { cx: 1130, screenTop: -1225, screenBottom: -575, w: 1100, baseW: 1340 };

export type Pt = [number, number];

/** the brain and the sub-brain use the same mark */
export const B: Pt = [1130, 300];
export const S: Pt = [1130, 720];
export const NODE_R = 85;
export const BUS_Y = 940;
export const LEAF_Y = 1150;
export const LEAF_W = 340;
export const LEAF_H = 140;

export const MAP = { x: 2300, y: 200, w: 1450, h: 2100 };
export const SCOPE_A = { x: 2420, y: 300, w: 1210, h: 1520 };
export const PORT_X = MAP.x;

export interface Leaf {
  id: string;
  role: string;
  method: string;
  x: number;
  lane: number;
  patch: Pt;
  /** time it is dispatched, time window in which it finishes (its fog clears) */
  dispatchT: number;
  doneT: [number, number];
  blob: number;
}

// Left to right. Lanes descend toward the left so link lines never cross each other.
export const LEAVES: Leaf[] = [
  { id: 'build', role: 'DRIVER', method: 'BUILD', x: 560, lane: 1650, patch: [2800, 1580], dispatchT: 4.05, doneT: [5.05, 5.35], blob: 0 },
  { id: 'proto', role: 'DRIVER', method: 'PROTOTYPE', x: 940, lane: 1530, patch: [3050, 1240], dispatchT: 4.15, doneT: [4.62, 4.84], blob: 1 },
  { id: 'spike', role: 'DRIVER', method: 'SPIKE', x: 1320, lane: 1410, patch: [2800, 900], dispatchT: 4.25, doneT: [4.52, 4.74], blob: 2 },
  { id: 'work', role: 'WORKER', method: 'ONE JOB', x: 1700, lane: 1290, patch: [2950, 560], dispatchT: 4.35, doneT: [4.72, 4.94], blob: 3 },
];
export const LEAF = Object.fromEntries(LEAVES.map((l) => [l.id, l])) as Record<string, Leaf>;

export const W2: Pt = [560, 1860];
export const W2_DISPATCH_T = 5.75;
export const SANDBOX = { x: 160, y: 1980, w: 800, h: 460 };
export const STEP_W = 120;
export const STEP_X0 = 320;
export const GROUND_Y = 2420;
export const stepTop = (i: number) => GROUND_Y - 55 * (i + 1);
export const stepCard = (i: number): Pt => [STEP_X0 + STEP_W * i + 60, stepTop(i) - 52];

export const PAPER = { x: 150, y: 230, w: 380, h: 300 };
export const PAPER_REST: Pt = [PAPER.x + 170, PAPER.y + 160];

export const P5: Pt = [3050, 2060];

export const patchEdge = (from: Pt, c: Pt, r = 175): Pt => {
  const dx = c[0] - from[0];
  const dy = c[1] - from[1];
  const d = Math.hypot(dx, dy);
  return [Math.round(c[0] - (dx / d) * r), Math.round(c[1] - (dy / d) * r)];
};

export const edgePath = (to: Pt, toTop: number) => `M${S[0]} ${S[1] + NODE_R} L${S[0]} ${BUS_Y} L${to[0]} ${BUS_Y} L${to[0]} ${toTop}`;
export const lanePath = (l: Leaf) => {
  const e = patchEdge([PORT_X, l.lane], l.patch);
  return `M${l.x} ${LEAF_Y + LEAF_H / 2} L${l.x} ${l.lane} L${PORT_X} ${l.lane} L${e[0]} ${e[1]}`;
};
