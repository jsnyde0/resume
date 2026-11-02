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
  rewritten?: string; // later rewrite, e.g. "2026"
  desc: string;
  stack?: string[];
  links?: ProjectLink[];
  parent?: string; // slug of the project this is a part of (one level)
  partsNoun?: string; // count label noun on a parent row: "7 parts" by default, "4 skills" with 'skills'
  items?: { name: string; desc: string; note?: string }[]; // listed in the pane as a definition list (e.g. a category's skills)
}

export const projectsIntro = {
  title: 'Building',
  lede: 'Products, tools and research software — and the agent factory that builds them.',
};

export const statusGroups: { key: ProjectStatus; label: string }[] = [
  { key: 'now', label: 'Now' },
  { key: 'built', label: 'Past' },
];

export const projects: Project[] = [
  { slug: 'switch-berlin', title: 'switch-berlin', status: 'now', from: '2025-01',
    desc: "An events guide for Berlin's queer, kink and conscious scene. It collects events from public sources, uses an LLM to check each one fits, and lists them under their organizers, who can claim their own page.",
    stack: ['Django', 'HTMX', 'React', 'PostgreSQL', 'pydantic-ai'], links: [{ label: 'switch.berlin', href: 'https://switch.berlin' }] },
  { slug: 'mapular', title: 'Mapular', status: 'now', from: '2025-05',
    desc: "Mapular makes MapTables, a map-and-table tool that helps retailers pick new store locations from competitor, demographic and travel-time data. I'm one of two people building the platform, and I did the marketing analytics.",
    stack: ['React', 'TypeScript', 'DuckDB', 'Azure Functions', 'PostgreSQL'],
    links: [{ label: 'mapular.com', href: 'https://mapular.com/solutions/site-selection' }] },
  { slug: 'factory', title: 'self-driving factory', status: 'now', from: '2026-04',
    desc: "A system where AI agents plan, build and review my software while I'm away. Every task lives in a tracker, each agent gets written permission over a set of tasks, and they only pull me in when a decision needs a human.",
    stack: ['Claude Code', 'Pi', 'beads', 'Python'],
    links: [{ label: 'See the breakdown →', href: '/factory/' }] },
  { slug: 'orchestration', parent: 'factory', title: 'orchestration', status: 'now', from: '2026-07',
    desc: "Four roles share the work. A brain plans and hands out tasks. A driver pushes its set of tasks to done. A maintainer keeps a set tidy without doing the work. A worker finishes one task. Each holds a written grant saying which tasks are theirs." },
  { slug: 'mail', parent: 'factory', title: 'mail', status: 'now', from: '2026-07',
    desc: "How agents talk to each other: letters stored as files in git, addressed up the chain of whoever handed out the work. Send, read, acknowledge. Mail never wakes anyone; waking an agent is a separate, deliberate step." },
  { slug: 'memory', parent: 'factory', title: 'memory', status: 'now', from: '2026-07',
    desc: "Agents write down what they learn as small markdown notes, each tagged with how fast it goes stale. Decisions I've signed off on outrank things an agent merely noticed, and stale notes drop out of what a new session reads first." },
  { slug: 'cockpit', parent: 'factory', title: 'cockpit', status: 'now', from: '2026-06',
    desc: "Where I watch the factory. Every agent runs in its own labelled terminal pane, grouped in tabs by role and task, so I can see them all at once and step into any conversation." },
  { slug: 'seats', parent: 'factory', title: 'seats', status: 'now', from: '2026-09',
    desc: "The tool that runs an agent in a terminal pane and handles it from outside: wake it, wait for it, resume it, and read how much quota and context it has left. It spots an agent stuck on a rate limit. It never decides what to work on." },
  { slug: 'pacemaker', parent: 'factory', title: 'pacemaker', status: 'now', from: '2026-09',
    desc: "The one clock in the factory. On each tick it nudges any agent whose check-in time has come, and the agent answers by recording a beat. A nudge with no answer means that agent is dead. The clock checks nothing else." },
  { slug: 'verify', parent: 'factory', title: 'verifiable targets', status: 'now', from: '2026-08',
    desc: "Every task carries a check an agent can actually run, what passing looks like, and why that check matters. Agents work toward the check instead of guessing when they are done." },
  { slug: 'skills', title: 'agent skills', status: 'now', from: '2026-06', partsNoun: 'categories',
    desc: "The reusable instructions I give my coding agents: how to find a way forward, learn, explain themselves, and carry work through to done." },
  { slug: 'skills-wayfinding', parent: 'skills', title: 'wayfinding skills', status: 'now', from: '2026-06',
    desc: "Skills for working out what to build and how, from talking it through to throwaway code and reading the evidence.",
    items: [
      { name: 'brainstorm', desc: "Talks a fuzzy idea through with questions until it is clear, then writes the result into my task tracker as tasks with a design and a definition of done." },
      { name: 'prototype', desc: "Builds a few quick versions of an idea when only running code can show which one works. The winner becomes a reviewed design." },
      { name: 'spike', desc: "Runs small throwaway experiments against the real system to find out how it behaves. The results are saved exactly as they came back." },
      { name: 'research', desc: "Answers a question that reading can settle. It checks docs, papers and source code, then writes one file with cited sources." },
    ] },
  { slug: 'skills-learning', parent: 'skills', title: 'learning skills', status: 'now', from: '2026-10',
    desc: "Skills that turn the agent into a tutor for my own learning projects, so I do the thinking and the agent coaches.",
    items: [
      { name: 'learn-chart', desc: "Breaks a learning project into an ordered list of pieces, then breaks each piece into small parts. It offers two or three options and a recommendation." },
      { name: 'learn-mission', desc: "Interviews me about why I am learning something and writes the answer into one mission file. It keeps the project pointed at my actual goal." },
      { name: 'learn-tutor', desc: "Acts as a tutor for one piece of a learning project. It quizzes me, probes my answers and pushes back, at a help level I choose, but never writes the solution." },
      { name: 'learn-assistant', desc: "A coding helper that does only the small thing I ask, like autocomplete for one function. It never designs or adds extras, so I stay the one learning." },
    ] },
  { slug: 'skills-plain', parent: 'skills', title: 'making the models make sense', status: 'now', from: '2026-06',
    desc: "Skills that make the agent explain things plainly, so I can pick up a decision or a status update in seconds.",
    items: [
      { name: 'guide', desc: "Walks me through one decision so I can follow it without context: the situation, the options, the key tradeoff, and a recommendation." },
      { name: 'tldr', desc: "Catches me up after I have been away: headlines, where things stand, next steps, and each open decision explained so it stands alone." },
      { name: 'Cold Reader', desc: "Makes every agent reply lead with the outcome in short plain sentences, for someone reading in ten seconds.", note: 'output style, not a skill' },
    ] },
  { slug: 'skills-substrate', parent: 'skills', title: 'working substrate', status: 'now', from: '2026-06',
    desc: "Skills that manage the work itself: splitting tasks, finishing them, reviewing, and keeping memory and decisions across sessions.",
    items: [
      { name: 'decompose', desc: "Splits a task that is too big into smaller tasks. Together, their definitions of done add up to the parent's." },
      { name: 'send-it', desc: "Drives one task or a whole group of tasks to done. It picks which of my other skills to use as it goes, with no fixed pipeline." },
      { name: 'adversarial-review', desc: "Has a fresh agent with no prior context critique my own design, plan or code change, to catch what I missed." },
      { name: 'recall', desc: "Looks through saved notes and past decisions before work starts, so the agent does not repeat old mistakes or contradict earlier choices." },
      { name: 'note', desc: "Saves one lesson learned mid-work into long-term memory. It marks how long the lesson should be trusted." },
      { name: 'retro', desc: "Looks back on finished work and proposes what to keep, drop or fix: new notes, retired old ones, and updates to the skills themselves." },
      { name: 'promote', desc: "Turns an important decision into a written decision record, or updates an existing one. Changes to firm decisions need my explicit OK." },
      { name: 'clear-resume', desc: "Lets the agent write a handoff, wipe its own context and carry on in a fresh session, with no manual reset from me." },
    ] },
  { slug: 'personal-agent',title: 'personal agent', status: 'now', from: '2026-04',
    desc: "An always-on assistant I message on Telegram, running on my own machine. Voice notes are transcribed locally. One command starts a coding session on any of my projects, and I can check progress, see the changes and stop it from the chat.",
    stack: ['TypeScript', 'Pi', 'grammY', 'Telegram', 'whisper.cpp'] },
  { slug: 'learning', title: 'learning', status: 'now', from: '2026-10',
    desc: "My plan for learning to engineer with coding agents. An AI tutor holds back answers and I make the design calls. The first project is a small coding agent of my own, to see its loop, tools, permissions and context from the inside.",
    stack: ['Claude Code', 'beads', 'agent skills'] },
  { slug: 'rip-cage', title: 'rip-cage', status: 'now', from: '2026-03',
    desc: "A microVM sandbox for running coding agents like Claude Code with permissions switched off. Each agent gets its own small virtual machine, the network is closed unless allowed, and my credentials never enter it. A CLI sets it up and launches it.",
    stack: ['microsandbox', 'libkrun', 'microVM', 'Claude Code', 'Pi'], links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/rip-cage' }] },
  { slug: 'fetch-ladder', title: 'fetch-ladder', status: 'built', from: '2026-10', to: '2026-10',
    desc: "A Python package that fetches a web page in whatever way each site allows. It remembers which client works for each site, tries the next one when blocked, and paces its requests.",
    stack: ['Python', 'httpx', 'curl_cffi', 'Jina', 'Firecrawl'], links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/fetch-ladder' }] },
  { slug: 'event-gulper', title: 'event-gulper', status: 'built', from: '2025-02', to: '2026-06',
    desc: "My first try at a Berlin events scraper: AI agents read event websites and turn them into structured listings on a schedule. It only got one source working, so I started over as switch-berlin.", stack: ['Python', 'Prefect', 'PostgreSQL', 'pydantic-ai', 'FastAPI'],
    links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/event-gulper' }] },
  { slug: 'approval-agent', title: 'approval-agent', status: 'built', from: '2026-03', to: '2026-03',
    desc: "A Claude Code hook for the shell commands simple rules can't judge, like running a script or deleting files. A fast model reads the command and the script, then approves it or hands the call to me, so I stop clicking approve on safe ones.",
    stack: ['Python', 'Claude Code hooks', 'LiteLLM', 'Gemini Flash'], links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/approval-agent' }] },
  { slug: 'humble-clay', title: 'humble-clay', status: 'built', from: '2025-03', to: '2025-05',
    desc: "A small API plus a Google Sheets add-on that runs an LLM prompt over every row of a spreadsheet. A lightweight take on Clay's AI enrichment.",
    stack: ['FastAPI', 'OpenRouter', 'Google Apps Script', 'Jina'], links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/humble-clay' }] },
  { slug: 'ebayes', title: 'ebayes', status: 'built', from: '2024-08', to: '2024-10',
    desc: "A web app where an online shop uploads its sales and ad spend, sees each channel plotted against sales, and fits a Bayesian marketing-mix model. Later, at Mapular, I built a fuller model on real data: ad carry-over and saturation, effects that change over time, budget optimisation, and a Google Meridian comparison.",
    stack: ['Python', 'PyMC-Marketing', 'Meridian', 'Django', 'Plotly'], links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/ebayes' }] },
  { slug: 'meshmonk', title: 'meshmonk', status: 'built', from: '2016-10', to: '2019-06', rewritten: '2026',
    desc: "An open-source toolbox I built at KU Leuven for fitting one 3D surface mesh onto another, used in research from facial genetics to dental and surgical planning. Its 2019 paper has over 160 citations. In 2026 I rewrote it Python-first: a C++20 library with Python bindings, on PyPI.",
    stack: ['C++20', 'Python', 'nanobind', 'CMake', 'PyPI'], links: [{ label: 'GitHub', href: 'https://github.com/jsnyde0/meshmonk' }, { label: 'Paper (Sci Rep 2019)', href: 'https://doi.org/10.1038/s41598-019-42533-y' }] },
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
