# How I build: visitor-plain basis for /factory (v3, 2026-10-15)

This is the wording basis for the public page. It is not final copy. The facts and citations are in [story-basis.md](story-basis.md), which wins if the two disagree.

## How I think

**1. Wayfinding: I'm always clearing the fog.**
- Every project has parts I can't describe precisely yet. That's fog, and it sits right next to ground that's already clear.
- I clear fog and build at the same time, all the time. It's a loop, not a planning phase.
- To clear a patch of fog, a brain asks **who can answer the question**, then sends the right agent:
  - **Talking it through** → a brainstorm.
  - **The real system** → a spike: a quick test against reality.
  - **Seeing it run and reacting to it** → a prototype.
- Once a patch is clear, it becomes a task with a precise definition of done.
- *The map, the fog and wayfinding come from [Matt Pocock's wayfinder](https://github.com/mattpocock/skills). The weather-map loop and the "who answers?" routing are my take on it.*

**2. Every task says how to check it's done.**
- A verifiable target lets an agent **hill-climb**: try, check, fix, repeat, with no one watching.

**3. The work lives on paper, not in the agents' heads.**
- Tasks, decisions, mail and lessons are all written down.
- An agent can crash and a fresh one picks up where it left off.

**4. Small tools that do one thing well.**
- The Unix way: small, well-scoped command-line tools that combine to do complex things.
- No heavy integrations. My browser tool costs an agent about **30× less context** than the popular alternative. *(Credit: Mario Zechner.)*
- No services to babysit.

**5. Works with any agent harness.**
- Claude Code agents and pi agents (my own harness) use the same tools, send each other mail, and start each other.

**6. Judgment, not checklists.**
- I give agents context and decisions instead of rigid procedures, so the system gets better as the models do.

## How the agents work together

- **Brains hire agents.**
  - A **brain** clears fog and splits the work.
  - It hands pieces to **sub-brains** when there's more to decide, to **drivers** when it's time to build, and to **workers** for single tasks.
  - It tells each one how to work: build, brainstorm, spike or prototype.
  - **Nobody approves their own work.** The parent checks it and signs it off.
- **Some get a sandbox.** A parent can put any child in a locked room, or let it work directly on the machine.
- **Mail plus a doorbell.** Agents leave mail that survives crashes, then ring a doorbell (a **wake**). A parent can say "**wake me when my child is done**".
- **Fresh minds.** When an agent's context fills up, it writes a note and starts fresh, or its parent does that for it.

## Always on

- The agents live on **a small computer at home**. I connect from my laptop or phone, close the lid, and they keep working.
- **A heartbeat** checks on each brain on its own schedule. Silence means revive it.
- **After a power cut, it comes back on its own.** The workspace reopens and the agents resume their sessions.

## Built on the shoulders of

Matt Pocock, Mario Zechner, Jeffrey Emanuel, Geoffrey Huntley, superpowers, and more to come.
