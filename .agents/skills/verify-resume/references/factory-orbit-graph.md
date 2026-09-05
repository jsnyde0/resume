# Factory orbit graph

## What it is

`/factory/` explains the author's agentic-engineering stack as a hand-built concentric orbit graph. Clicking a node selects it, highlights the nodes it connects to, and replaces a detail panel with that node's description. It is the most complex client-side behaviour on the site.

## How to reach it

Navigate to `/factory/`. Linked from the homepage as "what excites me". No login, no state.

## How to drive it with this project's harness

**Not yet mapped — this is the largest known gap in the feature map.**

The shape a drive should take, when it is written: navigate, wait for `#graph-scene`, capture which node carries `is-selected` and which carry `is-connected`, read the `#detail-panel` text, click a different node (ids look like `gn-pi`, `gn-orch`), wait for the selection to move, and capture again.

## What observable end state proves it works

A node click should move three things together:

1. the clicked node gains `is-selected`, and it is the only node with it;
2. exactly the nodes joined to it by the page's own edge list gain `is-connected` — this is the assertion with real content, because it is the one that can be wrong in an interesting way;
3. `#detail-panel` content changes to that node's description.

The edge-set check is the point. Selection and panel-swap are easy to get right and easy to verify; whether the *correct neighbours* light up is the behaviour most likely to be subtly wrong, and the only one a screenshot would not reveal.

Do not write this drive against a hardcoded edge list copied out of the page — that asserts the page agrees with a copy of itself. Read the edge list from the page and check the highlighting against it, or the check is circular.
