export type ProjectStatus = 'now' | 'built';

export interface ProjectLink {
  label: string;
  href: string; // starts with "/" = internal (same tab); anything else opens in a new tab
}

export interface Project {
  slug: string; // row id and #slug deep link
  title: string;
  status: ProjectStatus;
  from: string; // YYYY-MM
  to?: string; // YYYY-MM; no `to` = ongoing
  early?: string; // earlier incarnation, e.g. "2016–2021"
  desc: string;
  stack?: string[];
  links?: ProjectLink[];
  parent?: string; // slug of the project this is a part of (one level)
}

export const projectsIntro = {
  title: 'Building',
  lede: "Things I've built and am building — products, tools, and research software, and the agent factory I run them with.",
};

export const statusGroups: { key: ProjectStatus; label: string }[] = [
  { key: 'now', label: 'Now' },
  { key: 'built', label: 'Past' },
];

export const projects: Project[] = [
  { slug: 'switch-berlin', title: 'switch-berlin', status: 'now', from: '2025-01',
    desc: "A trust-first, organizer-centric events aggregator for Berlin's queer & alternative scene — Django + HTMX with a React island and LLM-powered scraping and ingestion.",
    stack: ['Django', 'HTMX', 'React', 'PostgreSQL', 'pgvector', 'pydantic-ai'], links: [{ label: 'switch.berlin', href: 'https://switch.berlin' }] },
  { slug: 'mapular', title: 'Mapular', status: 'now', from: '2025-05',
    desc: 'Location-intelligence software for retail expansion — 20M+ competitive data points combined with demographics and travel-time catchments to analyze markets, score candidate sites, and produce ranked, decision-ready shortlists, no GIS expertise needed.',
    stack: ['React', 'TypeScript', 'DuckDB', 'deck.gl', 'Azure Functions', 'PostgreSQL'],
    links: [{ label: 'mapular.com', href: 'https://mapular.com/solutions/site-selection' }] },
  { slug: 'factory', title: 'self-driving factory', status: 'now', from: '2026-04',
    desc: "The agentic software factory I'm building — the system behind how I work.",
    stack: ['Claude Code', 'Pi', 'Beads', 'Python', 'TypeScript'],
    links: [{ label: 'See the breakdown →', href: '/factory/' }] },
  { slug: 'orchestration', parent: 'factory', title: 'orchestration', status: 'now', from: '2026-07',
    desc: 'A planner agent watches the issue graph and starts sessions; each session drives one task and pulls in helpers. Grants decide who may touch what.' },
  { slug: 'mail', parent: 'factory', title: 'mail', status: 'now', from: '2026-07',
    desc: 'Agents write to each other through a mailbox on disk: send, read, acknowledge. Nothing gets lost when a session dies.' },
  { slug: 'memory', parent: 'factory', title: 'tiered memory', status: 'now', from: '2026-07',
    desc: 'Raw logs, fading notes, sticky lessons, binding decisions. Items climb as they prove useful; old ones rot on schedule.' },
  { slug: 'cockpit', parent: 'factory', title: 'cockpit', status: 'now', from: '2026-06',
    desc: 'Every agent in its own terminal pane, one view over all of them; I can jump into any session.' },
  { slug: 'seats', parent: 'factory', title: 'seats', status: 'now', from: '2026-09',
    desc: 'One tool that places agents in panes, talks to them, and notices when one is stuck on a rate limit.' },
  { slug: 'pacemaker', parent: 'factory', title: 'pacemaker', status: 'now', from: '2026-09',
    desc: 'The one clock in the system. It sends pulses on a schedule; agents answer with a beat.' },
  { slug: 'verify', parent: 'factory', title: 'verifiable targets', status: 'now', from: '2026-08',
    desc: 'Each task says what done looks like and which checks prove it, so an agent can tell when it is finished.' },
  { slug: 'personal-agent', title: 'personal agent', status: 'now', from: '2026-04',
    desc: 'An always-on assistant I talk to over Telegram, running on my own host with a scheduler and its own sessions.',
    stack: ['Pi', 'TypeScript', 'Telegram', 'grammY', 'whisper.cpp'] },
  { slug: 'rip-cage', title: 'rip-cage', status: 'built', from: '2026-03', to: '2026-10',
    desc: 'A CLI that wraps your project in a Docker container with a command-intercepting safety stack, so you can run coding agents with --dangerously-skip-permissions and keep the blast radius small.',
    stack: ['microsandbox', 'Docker', 'Claude Code', 'Pi'], links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/rip-cage' }] },
  { slug: 'meshmonk', title: 'meshmonk', status: 'built', from: '2026-04', to: '2026-10', early: '2016–2021',
    desc: 'The open-source 3D mesh-registration toolbox I built, used in KU Leuven craniofacial research and widely cited. In 2026 I rewrote it Python-first (C++20, clean API, Python bindings, PyPI).',
    stack: ['C++20', 'Python', 'nanobind', 'CMake', 'NumPy', 'PyPI'], links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/meshmonk' }] },
  { slug: 'fetch-ladder', title: 'fetch-ladder', status: 'built', from: '2026-10', to: '2026-10',
    desc: 'A Python package that fetches a URL the way that site allows: it remembers which client works per host, climbs to the next when one fails, and paces requests.',
    stack: ['Python', 'httpx', 'curl_cffi', 'Jina', 'Firecrawl'], links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/fetch-ladder' }] },
  { slug: 'approval-agent', title: 'approval-agent', status: 'built', from: '2026-03', to: '2026-03',
    desc: 'A Claude Code hook that asks a fast model to triage shell commands too opaque to approve by rule.',
    stack: ['Python', 'Claude Code hooks', 'LiteLLM', 'Click'], links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/approval-agent' }] },
  { slug: 'humble-clay', title: 'humble-clay', status: 'built', from: '2025-03', to: '2025-05',
    desc: "A small API that runs prompts through LLMs in bulk — a humble take on Clay's AI agent.",
    stack: ['FastAPI', 'OpenRouter', 'Google Apps Script', 'Prefect'], links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/humble-clay' }] },
  { slug: 'event-gulper', title: 'event-gulper', status: 'built', from: '2025-02', to: '2026-06',
    desc: 'The agentic event scraper that came before switch-berlin.', stack: ['Python', 'Prefect', 'PostgreSQL', 'OpenAI', 'pydantic-ai'],
    links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/event-gulper' }] },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const year = (ym: string) => ym.slice(0, 4);
const month = (ym: string) => MONTHS[Number(ym.slice(5)) - 1];

/** One format everywhere: "Oct 2026", "Mar–Oct 2026", "Dec 2025–Mar 2026", ongoing "since Apr 2026". */
export function formatRange(p: Pick<Project, 'from' | 'to'>): string {
  const { from, to } = p;
  if (!to) return `since ${month(from)} ${year(from)}`;
  if (to === from) return `${month(from)} ${year(from)}`;
  if (year(from) === year(to)) return `${month(from)}–${month(to)} ${year(to)}`;
  return `${month(from)} ${year(from)}–${month(to)} ${year(to)}`;
}

export const topLevel = (status: ProjectStatus) => projects.filter((p) => p.status === status && !p.parent);
export const partsOf = (slug: string) => projects.filter((p) => p.parent === slug);
