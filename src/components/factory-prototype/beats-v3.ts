// PROTOTYPE (resume-t7j, round 3): shared copy for the 2a-based spine
// "my device → the home box → a brain → recursive dispatch → … → close the lid".
// Read by /factory/3a and /factory/3b so the human compares how the recursion is drawn, not wording.
// Facts: docs/factory/story-basis.md (wins over this file). A brain plans and dispatches, never drives;
// it picks each child's method at dispatch; sub-brain when new decisions will arise, driver when they are written.
// SHORTCUT: draft copy; production copy gets a dedicated editing pass.

export interface Beat {
  key: string;
  /** What the camera and the pink task do in this beat — the thread that connects the scenes. */
  task: string;
  kicker: string;
  title: string;
  body: string[];
  credit?: { text: string; name: string; href: string };
}

export const intro = {
  title: 'How I build',
  lede: 'A factory of AI agents on a small computer at home. Follow one piece of work through it.',
};

export const beats: Beat[] = [
  {
    key: 'device',
    task: 'camera on my laptop; a line runs from it to a small box at home (SSH)',
    kicker: '01 · My desk',
    title: 'It starts on my laptop.',
    body: [
      'Or my phone. Either one is just a window: it connects over SSH to a small computer at home.',
      'That box is where everything below happens.',
    ],
  },
  {
    key: 'brain',
    task: 'camera follows the line into the home box; I talk to the brain; the project map appears, part clear, part fog',
    kicker: '02 · Talking to a brain',
    title: 'I talk to a brain about what’s needed.',
    body: [
      'Every project is part clear ground, part fog: things I can’t describe precisely yet.',
      'The brain is the planner. It never does the work itself; it decides who does.',
    ],
    credit: { text: 'The map and the fog come from', name: 'Matt Pocock’s wayfinder', href: 'https://github.com/mattpocock/skills' },
  },
  {
    key: 'dispatch',
    task: 'the brain draws a boundary around one foggy region (a scope) and hands it to a new sub-brain',
    kicker: '03 · Dispatch on a scope',
    title: 'It hands a piece of the map to another agent.',
    body: [
      'Every agent gets a scope: the part of the map it owns.',
      'More to decide → a sub-brain. Decisions already written → a driver. One clear job → a worker.',
    ],
  },
  {
    key: 'recurse',
    task: 'inside the scope the sub-brain does the same thing again: dispatches a driver that spikes, one that prototypes, one that builds; fog clears patch by patch',
    kicker: '04 · Same moves, one level down',
    title: 'Inside its scope, a brain does the same thing again.',
    body: [
      'It dispatches its own agents, each told how to work: a spike tests the real system, a prototype lets me react to something running, a build makes it real.',
      'A few small moves, composed at any depth. That’s how the fog clears.',
    ],
  },
  {
    key: 'target',
    task: 'a cleared patch condenses into the pink task card with a check attached',
    kicker: '05 · A task with a check',
    title: 'Every task says how to check it’s done.',
    body: [
      'Cleared fog becomes a task with a precise definition of done.',
      'That check is what lets an agent work without anyone watching.',
    ],
  },
  {
    key: 'climb',
    task: 'a worker takes the card into a sandbox and climbs the hill: try, check, fix',
    kicker: '06 · Hill-climbing',
    title: 'Try, check, fix, repeat.',
    body: [
      'Some agents get a sandbox: a locked room with only what the job needs.',
      'They use small tools that each do one thing well. My browser tool costs an agent about 30× less context than the popular alternative.',
    ],
    // SHORTCUT: Zechner link points at his site root; production links his "what if you don't need MCP" post (exact URL unconfirmed).
    credit: { text: 'CLIs over heavy integrations, after', name: 'Mario Zechner', href: 'https://mariozechner.at/' },
  },
  {
    key: 'stamp',
    task: 'the card travels back up the dispatch chain on paper; each parent stamps its child’s work',
    kicker: '07 · On paper, signed off',
    title: 'Nobody approves their own work.',
    body: [
      'Tasks, decisions, mail and lessons are all written down, not kept in an agent’s head.',
      'The worker leaves mail, rings a doorbell, and its parent checks and signs off. All the way up.',
    ],
  },
  {
    key: 'blackout',
    task: 'the power cuts; everything goes dark except the paper; then the agents come back and pick up from it',
    kicker: '08 · The power cuts',
    title: 'Then the lights go out.',
    body: [
      'Agents can die at any moment. A fresh one reads the paper and picks up where the last one stopped.',
      'After a power cut the box restarts the workspace and the agents resume by themselves.',
    ],
  },
  {
    key: 'lid',
    task: 'camera pulls back out of the box, along the line, to my laptop; the lid closes; the box keeps glowing',
    kicker: '09 · Close the lid',
    title: 'I close the laptop. The box keeps going.',
    body: [
      'A heartbeat checks on each brain on its own schedule. Silence means revive it.',
      'Context and decisions, not rigid checklists, so the system gets better as the models do.',
    ],
  },
];

export const creditsHeading = 'Built on ideas from';

// SHORTCUT: credits list is the 2026-10-15 draft; links for Emanuel, Huntley and superpowers still to confirm.
export const credits = [
  { name: 'Matt Pocock', href: 'https://github.com/mattpocock/skills' },
  { name: 'Mario Zechner', href: 'https://mariozechner.at/' },
  { name: 'Jeffrey Emanuel', href: 'https://github.com/Dicklesworthstone' },
  { name: 'Geoffrey Huntley', href: 'https://ghuntley.com/' },
  { name: 'superpowers', href: 'https://github.com/obra/superpowers' },
];
