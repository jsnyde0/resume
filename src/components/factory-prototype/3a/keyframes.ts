// PROTOTYPE (resume-t7j round 3, variant 3a): "scopes as nested territory". The world is nested coordinate systems:
// W (laptop + SSH line + box exterior) > B (box interior, scale SB) > S (a scope region on the map, scale SS inside B).
// Zooming "into" a scope is literally zooming into a smaller copy of the map. Same mark, same dispatch, one level down.
// SHORTCUT: every number hand-tuned by eye at 1440x900 and 390x844 only; production derives cameras from element bounds.

export const BX = 600, BY = 620, SB = 0.07; // box interior origin in world units, interior->world scale
export const RX = 1230, RY = 1160, SS = 0.4; // scope region origin in box units, region->box scale
export const MAPX = 150, MAPY = 760; // project map origin in box units

type Lv = 'W' | 'B' | 'S';
const LV = {
  W: { ox: 0, oy: 0, s: 1 },
  B: { ox: BX, oy: BY, s: SB },
  S: { ox: BX + SB * RX, oy: BY + SB * RY, s: SB * SS },
};
export type Cam = [number, number, number];
export type Pt = [number, number];
const P = (lv: Lv, x: number, y: number): Pt => [LV[lv].ox + LV[lv].s * x, LV[lv].oy + LV[lv].s * y];

/** camera framing content of width W (level units) centred on (cx,cy): landscape leaves the left 42% to the copy column */
const view = (lv: Lv, cx: number, cy: number, W: number) => {
  const [ax, ay] = P(lv, cx, cy);
  const w = LV[lv].s * W;
  return { L: [ax, ay, w / 0.58] as Cam, P: [ax, ay, w * 1.05] as Cam };
};

export interface Task { x: number; y: number; w: number; h: number; r: number; chk: number; glow: number; via?: Pt[] }
const tk = (lv: Lv, x: number, y: number, w: number, h = w, o: { r?: number; chk?: number; glow?: number; via?: Pt[] } = {}): Task => {
  const [ax, ay] = P(lv, x, y);
  const s = LV[lv].s;
  return { x: ax, y: ay, w: w * s, h: h * s, r: (o.r ?? w / 2) * s, chk: o.chk ?? 0, glow: o.glow ?? 0, via: o.via };
};

export const CH_DEFAULT = {
  lid: 1, scr: 1, labs: 1, ssh1: 0, ssh2: 0, map: 0, fogT: 0, brain: 0, sline: 0, sout: 0, smark: 0, sfog: 0, sub: 0,
  d0: 0, d1: 0, d2: 0, d3: 0, f0: 0, f1: 0, f2: 0, f3: 0, w2: 0, stamp1: 0, stamp2: 0, dark: 0, hb: 0, boxlit: 0,
};
export type Ch = typeof CH_DEFAULT;

export interface Key { txt: 'intro' | number; L: Cam; P: Cam; task: Task; ch: Ch }
export const keys: Key[] = [];
let cur: Ch = { ...CH_DEFAULT };
const K = (txt: Key['txt'], v: { L: Cam; P: Cam }, task: Task, patch: Partial<Ch> = {}, pv?: { P: Cam }) => {
  cur = { ...cur, ...patch };
  keys.push({ txt, L: v.L, P: (pv ?? v).P, task, ch: { ...cur } });
};

const dot0 = tk('W', 330, 300, 40);
const atBrain = tk('B', 1200, 420, 100);
const atSub = tk('S', 1050, 230, 150);
const toSubVia: Pt[] = [P('B', 1200, 1100), P('B', 1650, 1100)];
const cardC = tk('S', 575, 1200, 520, 330, { r: 30, chk: 1 });
const cardPaper = tk('B', 3158, 1800, 300, 190, { r: 20, chk: 1 });

// 0 intro: laptop and box, task is a pink dot on the laptop screen (the request)
K('intro', view('W', 515, 470, 1450), dot0, {}, view('W', 515, 470, 820));
// beat 0 device: close on the laptop, then the SSH line draws to the box
K(0, view('W', 330, 300, 520), dot0);
K(0, view('W', 515, 500, 800), tk('W', 684, 403, 26, 26, { via: [[520, 403]] }), { ssh1: 1 });
// beat 1 brain: dive through the wall; map (clear + fog) appears; the line ends at the brain
K(1, view('W', 684, 580, 440), tk('W', 684, 620, 22), { labs: 0 });
K(1, view('B', 1200, 1180, 2500), atBrain, { ssh2: 1, brain: 1, map: 1, fogT: 1, sfog: 1 }, view('B', 1150, 900, 1700));
// beat 2 dispatch: the brain draws a boundary round one foggy region; an agent mark appears inside it
K(2, view('B', 1250, 1000, 2300), atBrain, {}, view('B', 1500, 1030, 1800));
K(2, view('B', 1250, 1000, 2300), tk('S', 1050, 230, 150, 150, { via: toSubVia }), { sline: 1, sout: 1, smark: 1 }, view('B', 1500, 1030, 1800));
// beat 3 recurse: zoom into the region; it is the map again; the sub-brain dispatches the same way
K(3, view('S', 1050, 750, 2150), atSub, { sfog: 0, sub: 1, f0: 1, f1: 1, f2: 1, f3: 1 }, view('S', 1050, 430, 1500));
K(3, view('S', 1050, 750, 2150), atSub, { d0: 1, d1: 1, d2: 1, d3: 1 }, view('S', 1050, 850, 2200));
K(3, view('S', 1050, 750, 2150), atSub, { f0: 0, f1: 0, f2: 0 }, view('S', 1050, 850, 2200));
// beat 4 target: one cleared patch condenses into the pink task card with a check
K(4, view('S', 575, 1200, 1000), tk('S', 575, 1200, 200, 200, { via: [P('S', 1050, 1200)] }), {}, view('S', 575, 1180, 900));
K(4, view('S', 575, 1200, 1000), cardC, {}, view('S', 575, 1180, 900));
// beat 5 climb: the card goes to the sandbox, up the hill
K(5, view('B', 3175, 780, 1500), tk('B', 2700, 1085, 90, 90, { via: [P('S', 1050, 1200), P('B', 2380, 1640), P('B', 2380, 1085)] }), { w2: 1 });
K(5, view('B', 3175, 780, 1500), tk('B', 3500, 485, 90, 90, { chk: 1 }));
// beat 6 stamp: back out through the nested boundaries, one stamp per level, onto the paper
K(6, view('S', 1525, 1200, 1100), tk('S', 1525, 1200, 420, 270, { r: 24, chk: 1, via: [P('B', 3500, 1405), P('B', 2380, 1405)] }), { f3: 0, stamp1: 1 }, view('S', 1525, 1150, 950));
K(6, view('B', 1650, 1460, 1300), tk('B', 1650, 1460, 200, 130, { r: 16, chk: 1 }), { stamp2: 1 });
K(6, view('B', 3000, 1750, 1700), cardPaper, {}, view('B', 2900, 1750, 1700));
// beat 7 blackout: everything dark except the paper and the task; then relight
K(7, view('B', 3150, 1800, 1150), { ...cardPaper, glow: 1 }, { dark: 0.94 });
K(7, view('B', 3150, 1800, 1150), cardPaper, { dark: 0 });
// beat 8 lid: pull out of the box along the line, close the laptop, the box keeps a heartbeat
K(8, view('W', 684, 640, 520), cardPaper, { labs: 1 });
K(8, view('W', 540, 500, 880), cardPaper, { lid: 0, scr: 0, hb: 1, boxlit: 1 }, view('W', 515, 470, 780));
K(8, view('W', 540, 500, 880), cardPaper, {}, view('W', 515, 470, 780));

export const flatCam = (k: Key, portrait: boolean) => (portrait ? k.P : k.L);
