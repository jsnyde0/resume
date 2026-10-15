# /factory story basis: technical (v3, 2026-10-15)

The **source of truth for the /factory rebuild** (bead `resume-t7j`). It records how the factory really works, with citations. The visitor-plain wording lives in [story-basis-visitor.md](story-basis-visitor.md). Where the two disagree, this file wins and the visitor file gets fixed.

Path abbreviations:
- `dp/` = `~/code/personal/dotpi`
- `cl/` = `~/.claude`

**Copy rules for the public page:**
- Use the internal names as they are: brain, driver, maintainer, worker, mail, wake, spike, bead.
- Explain each name in plain words.
- Never put CLI verbs (`seat reconcile`, `dispatch --reach`, and so on) in public copy.

## 1. Principles

### 1.1 Wayfinding: clearing the fog, continuously

**Credit (required, visible, linked).** These ideas come from Matt Pocock's `/wayfinder` skill, at [github.com/mattpocock/skills](https://github.com/mattpocock/skills) (`docs/engineering/wayfinder.md`):
- the map
- the destination
- the fog of war
- the fog test: "can you state the question precisely *now*?"
- the way being clear

**The human's own adaptations**, a split the human has confirmed:
- **Weather map.** Fog and clear ground sit side by side, region by region. There is no switch from all-fog to all-clear (`dp/agent/skills/brain/SKILL.md:19`). Fog-clearing and building run **at the same time, continuously**. Matt's flow is plan-then-build.
- **Pick the fog-clearer by who answers** (`cl/docs/decisions/ADR-016-*` D2, FLEXIBLE):

| Who answers | Fog-clearer | What it produces |
|---|---|---|
| talk | `/brainstorm` | converged decisions |
| the real system | `/spike` | captured observations, with versions pinned |
| the human's reaction to running code | `/prototype` | a runnable spec |

- **Brains dispatch the fog-clearers as agents.** Fog-clearing is the brain's highest-leverage activity (`dp/agent/skills/brain/references/posture.md:13-15`).
- **One convergence door, `/land-design`.** It takes the decisions and adds a design, acceptance criteria, a `## Verification target` and a review gate, then files the beads (`dp/agent/skills/land-design/SKILL.md:8`).

**What gets kept** (ADR-016 D3, revised 2026-10-02):
- Spike code is thrown away, and its observations are kept.
- A prototype is kept as a runnable spec, with a SHORTCUT ledger. The build is a TDD rewrite against it.

**Fog vocabulary** is in the dotpi glossary (`dp/docs/decisions/GLOSSARY.md`):
- Fog (line 228)
- the fog test (233)
- Destination (260)
- Tending (268)

### 1.2 Verifiable targets let agents hill-climb

- Every bead carries a `## Verification target`: a check the agent can run.
- An agent can then try, check and fix without a human watching.
- A bead with no target is refused at dispatch.
- Composition lives in `/verify` (`cl/` ADR-005 D7). The two-part acceptance is defined in ADR-006 D4.

### 1.3 The work lives in files, not in agents

- **Beads** hold the work: the contract, decision comments, and orchestration labels (`orchestrator`, `awaiting-stamp-from`, ...).
- **Mail** is maildir-in-git (`dp/` ADR-003 D14).
- **Memory** is markdown (`mem`).
- Agents can die at any time. A fresh agent reads the bead and continues, which dotpi calls exit-and-resume (ADR-003 D1).

### 1.4 Unix philosophy: small composable CLIs, no MCP

- About 12 core CLIs make up the factory: `mail`, `grants`, `seat`, `dispatch`, `pacemaker`, `timer`, `mem`, `recover`, `atlas-*`, `boot-bootstrap` and `host-hygiene`. Most are Python run through `uv`.
- None of them use MCP.
- CLIs over MCP, as the cross-harness default: `dp/` ADR-002 D5 (FLEXIBLE). The escape hatch is a tool that needs persistent two-way session state.
- Each tool must work on its own: ADR-005 D2.
- Output is plain text for agents, with `--json` for programs: ADR-005 D5 (FIRM).
- The simplification ladder: ADR-006:118.
- **Case study: browser automation.** It is seven small puppeteer-core scripts costing **under 500 discovery tokens**. A Playwright or DevTools MCP costs **13–18k** (`dp/agent/skills/browser-automation/SKILL.md:206-208`). The pattern is adapted from **Mario Zechner**'s "what if you don't need MCP" (SKILL.md:8), so credit him.
- **No daemons.** The only resident piece is the pacemaker's OS timer. The public wording is "no services to babysit". Do not say "all plain files": beads runs on Dolt, which is a database.

### 1.5 Works with any agent harness

- Today the harnesses are **Claude Code** (subsidised) and **pi** (the human's own harness). Codex was dropped on 2026-06-12.
- The seat runtime is chosen per grant (`--runtime`) and recorded, so a resume revives the agent on the same runtime (ADR-003 D11).
- Shared across harnesses: herdr panes, the grants registry, the maildir and bead labels.
- Per-harness: the clear command (`/clear` versus `/new`), and extensions (pi) paired with hooks (Claude Code).

### 1.6 Thick substrate, thin process

- The durable layer (beads, ADRs, memory) carries the weight. The process is composed by judgment (`cl/` ADR-012 D1, FIRM).
- The system gets better as the models do.

## 2. How agents work together

**Roles** (`dp/docs/atlas/verb-roles.md`, the role skills):
- **brain** plans, grants and rules on work, and never drives. Its children can be a sub-brain, a driver, a maintainer or a worker. The cue: use a driver when the decisions are already written down, and a sub-brain when new decisions will arise. The human can talk to a sub-brain directly.
- **The brain picks each child's method at dispatch** (`dispatch --method`; `dp/agent/skills/brain/SKILL.md:124`), for example "a driver that brainstorms".
- **driver** pushes beads to acceptance. It picks a method itself only for members that weren't pinned at dispatch. It can sub-grant workers (default `--method implement-tdd`).
- **maintainer** reviews drift and never actuates.
- **worker** drives one leaf and grants nobody.
- **subagents** are function-call delegation for bounded asks. A worker is actor delegation for work that discovers its own size. The test is ADR-003 D7.

**Stamping.** Nobody approves their own work.
- The worker writes a ship-record, sets `awaiting-stamp`, mails up and wakes its granter.
- The granter stamps the work and closes the bead.

**Caging per child.**
- The parent passes `dispatch --reach <exec prefix>` to cage a child. Leaving it out runs the child on the host.
- A caged dispatch runs entirely inside the cage. The host keeps only a pointer row.
- Caged seats skip permissions (rip-cage microVM, default-deny egress, credentials attached on the wire). Host seats run in auto mode.

**Mail plus wake.**
- A wake carries no content. It is one fixed sentence plus at most a one-line preamble (`dp/scripts/seatlib/wake.py:95`).
- Mail carries the content. It survives a busy, dead or recycled pane, a crash mid-read (read and ack are separate), and the seat changing hands (`up` resolves through grants).
- The pattern is to mail the letter, then ring the doorbell. Mail exists because a handback was once lost in a recycled pane.
- `seat await <child> --then-wake <me>` is a one-shot watcher on the host. It wakes the parent when the child stops working or dies.

**Fresh context.**
- `self-clear` is an agent clearing itself, after `/handoff`.
- `clear-continue` is the default way a parent refreshes a child at a seam.
- `compact-continue` is a parent compacting a child. A seat cannot compact itself.

## 3. Always on

**Remote access.**
- The human reaches a home mini-PC over **mosh/ssh**.
- **herdr is the cockpit**, and it works over that link.
- Close the laptop and the agents keep working. The dotpi docs don't cover the mosh setup; this is the human's account.

**Pacemaker.**
- It is the one clock, with a **per-seat rhythm** set in the grant's clock config (`dispatch --clock-rhythm 6h`).
- Live brains run at 2h, 6h and 24h. Workers stay off the clock.
- A seat proves it is alive with `pacemaker beat`. Unanswered pulses mark the seat dead.

**After a power cut.**
- herdr 0.9.4 restores its workspaces.
- It also resumes agent panes into their sessions (`[session] resume_agents_on_restore = true` by default). This needs current integrations, and on this host they are outdated (pi v8<v9, claude v8<v10). The fix was mailed to brain:dotpi.
- The systemd user unit `dotpi-boot-bootstrap` starts herdr if it is down and respawns the standing brain.
- `seat reconcile` revives the rest.

## 4. Credits (on the page)

- A section at the end of /factory, plus inline credit wherever an idea is used.
- Known so far: **Matt Pocock** (wayfinding), **Mario Zechner** (CLIs over MCP), **Jeffrey Emanuel**, **Geoffrey Huntley**, **superpowers**. More will come from the human.
- Whether there should be a standalone sources page is asked of brain:resume.

## 5. Prototype round

| Spine | Shape |
|---|---|
| A, "how I think" | Principle-led. Each principle is shown by one live mechanic. |
| B, "how the machine works" | One continuous scroll journey. |

- Both are hand-drawn and scroll-driven, with 3 scenes each.
- They live at `/factory/a` and `/factory/b`.
- The current `/factory` stays untouched until the human picks one.
