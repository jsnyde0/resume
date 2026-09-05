# Recipe — add a drive for the next feature

Prescriptive on purpose: this project's drives all have the same fixed shape, and the value of writing them down is that the next one does not have to be redesigned.

## 1. Write the feature file first

`references/<feature>.md`, four sections: what it is, how to reach it, how to drive it, what observable end state proves it works. Writing this first is what stops a drive from asserting whatever happened to be easy to assert.

Name the observables **before** opening the engine. If you cannot say what should change, you are not ready to write the drive.

## 2. Read the real selectors out of the source

Open the page under `src/pages/` and read the actual attribute and id names out of its inline script. Never invent a selector, and never trust one quoted in a document — including this one. Selectors move; a drive built on a stale selector fails as though the feature broke, which is the most expensive kind of false alarm.

Where markup is generated from data (the file tree is), **discover the values from the live DOM** instead of hardcoding a list.

## 3. Write the drive as capture → act → capture

```
capture the state  →  perform the real user action  →  wait for the change  →  capture again
```

- **Wait on the change itself**, never a fixed sleep. `wait.js --fn='<expression that becomes true>'` is the tool. A sleep is either slow or flaky and usually both.
- **Act the way a visitor acts** — click the element. Do not call the page's internal function; that tests the function, not the feature.
- **Assert every observable the behaviour moves, and make them agree with each other.** Four half-checks that each pass independently are not one real check.
- **Assert the before-state differed.** Without it, a drive on a page where nothing happened still passes.

## 4. Print the population, not just a verdict

Print how many elements were discovered, which ones, and the observed values before and after. A run that found nothing and asserted nothing exits 0 exactly like a real one; the printed population is the only thing that tells them apart.

## 5. Wire it into `scripts/drive`

Add a `case` branch. Add the row to `references/README.md`. Both, or the drive exists and nobody can find it.

## 6. Run it, and run it against a break

Run it green. Then **break the feature on purpose** — comment out the click handler — and confirm the drive goes red. A drive that has never been seen to fail has not been shown to check anything.
