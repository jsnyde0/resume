// PROTOTYPE (resume-t7j, round 2): shared copy for the merged spine "follow one task through the factory".
// All three round-2 variants (/factory/2a, /factory/2b, /factory/2c) read these beats so the human
// compares technique, not wording. Wording basis: docs/factory/story-basis-visitor.md (story-basis.md wins).
// SHORTCUT: draft copy, lightly cut from the visitor basis; production copy gets a dedicated editing pass.

export interface Beat {
  key: string;
  /** What happens to the one task in this beat — the thread that connects the scenes. */
  task: string;
  kicker: string;
  title: string;
  body: string[];
  credit?: { text: string; name: string; href: string };
}

export const intro = {
  title: 'How I build',
  lede: 'A factory of AI agents that runs on a small computer at home. Follow one task through it.',
};

export const beats: Beat[] = [
  {
    key: 'map',
    task: 'not yet a task: one patch of fog on the map',
    kicker: '01 · The map',
    title: 'Every project is part clear ground, part fog.',
    body: [
      'Some parts I can describe precisely. Others I can’t yet. That’s fog, and it sits right next to the clear ground.',
      'I clear fog and build at the same time. It’s a loop, not a planning phase.',
    ],
    credit: { text: 'The map and the fog come from', name: 'Matt Pocock’s wayfinder', href: 'https://github.com/mattpocock/skills' },
  },
  {
    key: 'clear',
    task: 'the fog patch is cleared by whoever can answer it',
    kicker: '02 · Clearing fog',
    title: 'Ask who can answer the question.',
    body: [
      'Talking it through → a brainstorm.',
      'The real system → a spike: a quick test against reality.',
      'Seeing it run and reacting → a prototype. Like this page was.',
    ],
  },
  {
    key: 'target',
    task: 'the cleared patch becomes a task card with a check attached',
    kicker: '03 · A task with a check',
    title: 'Every task says how to check it’s done.',
    body: [
      'Once fog clears, it becomes a task with a precise definition of done.',
      'That check is what lets an agent work without anyone watching.',
    ],
  },
  {
    key: 'handoff',
    task: 'a brain hands the task to the right agent, with how to work',
    kicker: '04 · Brains hire agents',
    title: 'A brain splits the work and hands it down.',
    body: [
      'More to decide → a sub-brain. Time to build → a driver. One clear job → a worker.',
      'Each one is told how to work: build, brainstorm, spike or prototype.',
    ],
  },
  {
    key: 'climb',
    task: 'a worker in a sandbox hill-climbs on the task: try, check, fix',
    kicker: '05 · Hill-climbing',
    title: 'Try, check, fix, repeat.',
    body: [
      'Some agents get a sandbox: a locked room with only what the job needs.',
      'They use small tools that each do one thing well. My browser tool costs an agent about 30× less context than the popular alternative.',
    ],
    // SHORTCUT: Zechner link points at his site root; production links his "what if you don't need MCP" post (exact URL unconfirmed).
    credit: { text: 'CLIs over heavy integrations, after', name: 'Mario Zechner', href: 'https://mariozechner.at/' },
  },
  {
    key: 'paper',
    task: 'the result goes on paper; mail up, a doorbell, the parent stamps it',
    kicker: '06 · On paper',
    title: 'Nobody approves their own work.',
    body: [
      'Tasks, decisions, mail and lessons are all written down, not kept in an agent’s head.',
      'The worker leaves mail, rings a doorbell, and its parent checks and signs off.',
    ],
  },
  {
    key: 'blackout',
    task: 'the power cuts; the task survives because it was on paper',
    kicker: '07 · The power cuts',
    title: 'Then the lights go out.',
    body: [
      'Agents can die at any moment. A fresh one reads the paper and picks up where the last one stopped.',
      'After a power cut the workspace reopens and the agents resume by themselves.',
    ],
  },
  {
    key: 'home',
    task: 'zoom out: the task is one of many, running on a box at home',
    kicker: '08 · Always on',
    title: 'It runs while I sleep.',
    body: [
      'The agents live on a small computer at home. I connect from my laptop or phone, close the lid, and they keep working.',
      'A heartbeat checks on each brain. Claude Code and pi agents share the same tools and mail.',
    ],
  },
  {
    key: 'close',
    task: 'the task is shipped; the map has a little less fog',
    kicker: '09 · Judgment, not checklists',
    title: 'Context and decisions, not rigid procedures.',
    body: ['So the system gets better as the models do.'],
  },
];

// SHORTCUT: credits list is the 2026-10-15 draft; links for Emanuel, Huntley and superpowers still to confirm.
export const credits = [
  { name: 'Matt Pocock', href: 'https://github.com/mattpocock/skills' },
  { name: 'Mario Zechner', href: 'https://mariozechner.at/' },
  { name: 'Jeffrey Emanuel', href: 'https://github.com/Dicklesworthstone' },
  { name: 'Geoffrey Huntley', href: 'https://ghuntley.com/' },
  { name: 'superpowers', href: 'https://github.com/obra/superpowers' },
];
