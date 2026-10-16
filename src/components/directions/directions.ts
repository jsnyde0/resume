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
];

export type DirectionPage = 'home' | 'resume';

export function directionHref(key: string, page: DirectionPage): string {
  return page === 'home' ? `/directions/${key}/` : `/directions/${key}/resume/`;
}
