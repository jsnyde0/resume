export type ProjectTag = 'built' | 'company' | 'in-progress';

export interface ProjectLink {
  label: string;
  href: string;
  external?: boolean; // true = new tab + rel=noopener; false/undefined = same tab
}

export interface ProjectEntry {
  slug: string;
  title: string;
  description: string;
  tag: ProjectTag;           // shown as a small chip
  technologies?: string[];   // optional tech badges
  image?: { src: string; alt: string };
  links: ProjectLink[];
}

export const projectsIntro = {
  title: 'Building',
  description:
    "Things I've built — products, tools, and research software, from a sandboxing CLI to a cited academic toolbox and a location-intelligence platform.",
};

export const projectEntries: ProjectEntry[] = [
  {
    slug: 'rip-cage',
    title: 'rip-cage',
    tag: 'built',
    technologies: ['Docker'],
    description:
      'A CLI that wraps your project in a Docker container with a command-intercepting safety stack, so you can run coding agents with --dangerously-skip-permissions and keep the blast radius small.',
    links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/rip-cage', external: true }],
  },
  {
    slug: 'switch-berlin',
    title: 'switch-berlin',
    tag: 'built',
    technologies: ['Django', 'HTMX', 'React', 'LLM'],
    description:
      "A trust-first, organizer-centric events aggregator for Berlin's queer & alternative scene — Django + HTMX with a React island and LLM-powered scraping and ingestion.",
    links: [
      { label: 'switch.berlin', href: 'https://switch.berlin', external: true },
      { label: 'GitHub', href: 'https://github.com/jsnyde0/switch-berlin', external: true },
    ],
  },
  {
    slug: 'harness',
    title: 'harness',
    tag: 'built',
    technologies: ['Claude Code', 'pi', 'Codex'],
    description:
      'A clone-and-adapt agentic-engineering substrate — workflow & methodology skills, hooks, subagent roles, and ADRs that install into Claude Code, pi, and Codex from one script. A public slice of the system behind my factory.',
    links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/harness', external: true }],
  },
  {
    slug: 'meshmonk',
    title: 'meshmonk',
    tag: 'built',
    technologies: ['C++20', 'Python'],
    image: { src: '/img/meshmonk-logo-white.png', alt: 'MeshMonk' },
    description:
      'The open-source 3D mesh-registration toolbox I built, used in KU Leuven craniofacial research and widely cited. In 2026 I rewrote it Python-first (C++20, clean API, Python bindings, PyPI).',
    links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/meshmonk', external: true }],
  },
  {
    slug: 'mapular',
    title: 'Mapular',
    tag: 'company',
    description:
      'Location-intelligence software for retail expansion — 20M+ competitive data points combined with demographics and travel-time catchments to analyze markets, score candidate sites, and produce ranked, decision-ready shortlists, no GIS expertise needed.',
    links: [{ label: 'mapular.com', href: 'https://mapular.com/solutions/site-selection', external: true }],
  },
  {
    slug: 'self-driving-factory',
    title: 'self-driving factory',
    tag: 'in-progress',
    description: "The agentic software factory I'm building — the system behind how I work.",
    links: [{ label: 'See the breakdown →', href: '/factory/', external: false }],
  },
];
