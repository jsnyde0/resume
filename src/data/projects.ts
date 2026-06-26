export type ProjectKind = 'built' | 'build-on';

export interface ProjectEntry {
  slug: string;
  title: string;
  description: string;
  kind: ProjectKind;
  href?: string;
  author?: string; // credit for build-on entries
}

export const projectsIntro = {
  title: 'Building',
  description:
    'Things I have built and tools I build on — a reference list of repos and composed tools that back the work.',
};

export const projectEntries: ProjectEntry[] = [
  {
    slug: 'rip-cage',
    title: 'rip-cage',
    description:
      'A tool I built and ship publicly (Homebrew tap): wraps a project in a container and intercepts every shell command to limit the blast radius — the cage my always-on agents run inside. Composes with iron-proxy so agents never hold real credentials.',
    kind: 'built',
    href: 'https://github.com/jsnyde0/rip-cage',
  },
  {
    slug: 'pi',
    title: 'pi',
    description: 'The coding agent my whole harness wraps.',
    kind: 'build-on',
    href: 'https://github.com/badlogic/pi-mono',
    author: 'badlogic',
  },
  {
    slug: 'herdr',
    title: 'herdr',
    description:
      'A headless agent-supervisor: a live roster of every session — working, blocked, done — that I can attach to and steer.',
    kind: 'build-on',
    href: 'https://github.com/ogulcancelik/herdr',
    author: 'Ogulcan Celik',
  },
  {
    slug: 'telepi',
    title: 'TelePi',
    description: 'Drives my Pi agent from Telegram: voice prompts, screenshots, session handback.',
    kind: 'build-on',
    href: 'https://github.com/benedict2310/TelePi',
    author: 'Benedict Bleimschein',
  },
  {
    slug: 'cass-cm',
    title: 'cass / cm',
    description:
      'Full-text search and a memory layer over my past agent sessions, so the system recalls what it has already done.',
    kind: 'build-on',
    href: 'https://github.com/Dicklesworthstone/coding_agent_session_search',
    author: 'Jeffrey Emanuel',
  },
  {
    slug: 'cmux',
    title: 'cmux',
    description: 'The cockpit I watch the factory from on the Mac.',
    kind: 'build-on',
    href: 'https://github.com/manaflow-ai/cmux',
    author: 'Manaflow',
  },
  {
    slug: 'agent-mail',
    title: 'agent_mail',
    description:
      "File-reservation rails so parallel agents don't collide — adopting it now, not yet load-bearing.",
    kind: 'build-on',
    href: 'https://github.com/Dicklesworthstone/mcp_agent_mail',
    author: 'Jeffrey Emanuel',
  },
];
