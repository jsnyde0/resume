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
    description: 'Public sandboxing tool with a Homebrew tap for easy installation.',
    kind: 'built',
    href: 'https://github.com/jsnyde0/rip-cage',
  },
  {
    slug: 'telepi',
    title: 'TelePi',
    description: 'Part of my always-on agent infrastructure.',
    kind: 'build-on',
    href: 'https://github.com/benedict2310/TelePi',
    author: 'Benedict Bleimschein',
  },
  {
    slug: 'herdr',
    title: 'herdr',
    description: 'Helps wrangle multiple agent processes.',
    kind: 'build-on',
    author: 'Ogulcan Celik',
  },
  {
    slug: 'cass-cm',
    title: 'cass / cm',
    description: 'Conversation search and synthesis over agent sessions; used for compacting and querying session context.',
    kind: 'build-on',
  },
];
