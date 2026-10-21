// PROTOTYPE (resume-soe.12) — visual-identity directions explored under /directions/<x>/.
// Each direction is a self-contained page pair (homepage + /resume slice) with its own
// chrome and CSS; nothing here is wired into the live pages. The human picks via brain.
// SHORTCUT: registry lives beside the switcher, not in src/data — single-consumer, deleted with the losers.

export interface Direction {
  key: string;
  name: string;
  /** One-line pitch, read cold by the human on the hub page. */
  pitch: string;
}

export const directions: Direction[] = [
  { key: 'a', name: 'Broadsheet', pitch: 'Paper-white editorial brutalism: giant black type, hard rules, one signal colour.' },
  { key: 'b', name: 'Runway', pitch: 'Fashion-cover cinema: full-bleed photo, towering condensed caps, dark and glossy.' },
  { key: 'c', name: 'Sticker Sheet', pitch: 'Saturated colour blocks, cut-out shapes, rotated stickers, playful and loud.' },
  { key: 'd', name: 'Dread', pitch: 'Existential minimalism: near-black, grain, one thin oversized line, radical emptiness.' },
  // Round 2 (2026-10-20): no borrowed-format costume; strong personality played straight; brand colours = lime shirt + pink clogs from the photo.
  { key: 'e', name: 'Dread, played straight', pitch: 'D without the film props: dark, the tagline as hero, lime and pink from the photo carried through the whole site.' },
  { key: 'f', name: 'Poster', pitch: 'Flat full-bleed lime field, huge black grotesque, pink as the hit colour. Loud, simple, no ornament.' },
  { key: 'g', name: 'Big Type', pitch: 'Light page where the tagline is the interface: giant words, lime and pink highlights, type that moves.' },
  { key: 'h', name: 'Cut-out', pitch: 'The photo is the layout: you, big and cropped, with type and colour blocks built around the body.' },
  // Round 3 (2026-10-20): F and H reworked; outfit must pop off the ground; resume = the repo explorer reworked; hi-res cut-out + more photos.
  { key: 'f2', name: 'Poster, on black', pitch: 'F on black: lime type, the outfit pops. Resume is the repo explorer rebuilt in the poster language.' },
  { key: 'h2', name: 'Cut-out, refined', pitch: 'H refined with a sharp hi-res cut-out and no lime behind the shirt. Resume is the repo explorer rebuilt around the body.' },
  // Round 4 (2026-10-20): F2 is the chosen direction; variations on it. Axes: name/photo composition on desktop + a mobile-first resume explorer.
  { key: 'f3', name: 'F2 · side by side', pitch: 'Name and figure never overlap: name stacked tall on one side, you full height on the other. Mobile resume: list, then tap into a file, back button.' },
  { key: 'f4', name: 'F2 · standing on the name', pitch: 'The name is the floor: your clogs stand on top of the letters. Mobile resume: compact accordion, files open inline.' },
  { key: 'f5', name: 'F2 · through the name', pitch: 'You stand centred, the name runs huge behind you at hip height, the body cuts through it. Mobile resume: sticky section tabs.' },
  // Round 5 (2026-10-21, final): F3 layout, tagline at top, figure physically connected to tagline + name. Resume = F4 accordion in all.
  { key: 'f6', name: 'F3 · touch', pitch: 'F3 tightened: your fingertip touches the tagline, your front clog lands on top of the name.' },
  { key: 'f7', name: 'F3 · mirrored', pitch: 'Photo flipped: you stand right and reach left to the tagline in the top-left corner, standing on the name.' },
  { key: 'f8', name: 'F3 · annotated', pitch: 'F3 plus thin lime leader lines: hand to tagline, clog to name.' },
];

export type DirectionPage = 'home' | 'resume';

export function directionHref(key: string, page: DirectionPage): string {
  return page === 'home' ? `/directions/${key}/` : `/directions/${key}/resume/`;
}
