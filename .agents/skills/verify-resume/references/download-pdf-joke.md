# Download-PDF joke

## What it is

A "Download PDF" button on `/resume/` that plays a loading animation and then, instead of downloading anything, admits it: the label flips to `oh, shit, erm...` and lands on `if you need this as a PDF, are we really a match?`. It is a deliberate joke about the audience the site is filtering for.

## How to reach it

Navigate to `/resume/`; the button is `#ghv-dl-btn` in the page header area.

## How to drive it with this project's harness

Not mapped yet. It is a good second drive: same page as the file tree, and it exercises a **timed** state machine rather than a synchronous one.

Shape: click `#ghv-dl-btn`, then assert the label passes through the intermediate state and reaches the final one. The timing is the hard part — assert on the label *text reaching a specific value*, never on a fixed sleep, or the drive becomes flaky for reasons that have nothing to do with the feature.

## What observable end state proves it works

The button's label ends at `if you need this as a PDF, are we really a match?` **and no file download was triggered**. The second half is the real assertion: the joke is that nothing downloads, so a drive that only checks the text would pass on a version that had accidentally started serving a real file.

Also worth asserting: the intermediate `oh, shit, erm...` state was actually observed. A drive that only sees the final state cannot tell the animation ran from the label having been wrong from the start.
