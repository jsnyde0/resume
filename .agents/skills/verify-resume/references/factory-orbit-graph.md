# Factory orbit graph

## What it is

`/factory/` explains the author's agentic-engineering stack as a hand-built concentric orbit graph. Clicking a node selects it, highlights the nodes it connects to, and replaces a detail panel with that node's description. It is the most complex client-side behaviour on the site.

## How to reach it

Navigate to `/factory/`. Linked from the homepage as "what excites me". No login, no state.

## How to drive it with this project's harness

**Not yet mapped — this is the largest known gap in the feature map.** Filed as `dotpi-9a81`; cite that bead rather than filing a second one when the next maintenance pass finds this same hole.

The shape a drive should take, when it is written: navigate, wait for `#graph-scene`, capture which node carries `is-selected` and which carry `is-connected`, read the `#detail-panel` text, click a different node (`gn-orch`, an orbit chip, is a good target — it is off the core and has real neighbours), wait for the selection to move, and capture again.

**There are ten nodes, and only three of their ids appear literally in the source.** The core three are assigned directly in `src/pages/factory.astro` (`piBtn.id = 'gn-pi'` at :843, `gn-ripcage` at :867, `gn-host` at :891). The other seven are **built by concatenation** at :920 — `btn.id = 'gn-' + id` — over the `orbitIds` array at :793:

| Where | DOM ids |
|---|---|
| Core, literal in source | `gn-pi`, `gn-ripcage`, `gn-host` |
| Orbit, built by `'gn-' + id` | `gn-tracker`, `gn-memory`, `gn-cockpit`, `gn-orch`, `gn-verify`, `gn-selfdriving`, `gn-substrate` |

> **Hazard — the ids here are concatenated.** `grep gn-orch` returns nothing and that means nothing: the string never exists in the file. Read the construction site (`orbitIds` at :793 plus the `'gn-' + id` at :920) or read the live DOM. **Never conclude an id is absent from a literal grep.** This is not hypothetical — a maintenance pass on 2026-09-05 did exactly that, reported `gn-orch` as a non-existent id, and deleted a correct example from this file. The concatenation is why.

Discover the set from the live DOM rather than trusting the table above; it is written from the source today and the source is what moves.

## What observable end state proves it works

A node click should move three things together:

1. the clicked node gains `is-selected`, and it is the only node with it;
2. exactly the nodes joined to it by the page's own edge list gain `is-connected` — this is the assertion with real content, because it is the one that can be wrong in an interesting way;
3. `#detail-panel` content changes to that node's description.

The edge-set check is the point. Selection and panel-swap are easy to get right and easy to verify; whether the *correct neighbours* light up is the behaviour most likely to be subtly wrong, and the only one a screenshot would not reveal.

Do not write this drive against a hardcoded edge list copied out of the page — that asserts the page agrees with a copy of itself. Read the edge list from the page and check the highlighting against it, or the check is circular.
