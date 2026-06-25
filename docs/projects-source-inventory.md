# Projects source-to-Astro inventory

## Source templates reviewed
- `templates/projects.html`
- `templates/partials/pages/projects.html`
- `templates/cotton/carousel_frame.html`
- `templates/cotton/carousel_item.html`
- `templates/layouts/default.html`
- `templates/components/navbar.html`
- `templates/components/footer.html`
- `a_core/views.py`
- `a_core/urls.py`
- `staticfiles/img/just_show_up.png`
- `staticfiles/img/ebayes-1.png`
- `staticfiles/img/ebayes-2.png`
- `staticfiles/img/ebayes-3.png`
- `staticfiles/img/ebayes-4.png`
- `staticfiles/img/async-data-pipeline.png`
- `staticfiles/img/yolo-api-apples-and-oranges.jpg`
- `staticfiles/img/topbottombabes-1.png`
- `staticfiles/img/topbottombabes-2.png`
- `staticfiles/img/topbottombabes-3.png`
- `staticfiles/img/topbottombabes-4.png`
- `staticfiles/img/topbottombabes-5.png`
- `staticfiles/img/getting_tasks_done-home.png`
- `staticfiles/img/getting_tasks_done-subtask.png`

## Shared chrome
- Django route is `a_core/urls.py -> view_projects` and renders `templates/projects.html`, which extends `templates/layouts/default.html`.
- Django navbar in `templates/components/navbar.html` links to Home, Resume, README, and Side Projects via HTMX.
- Astro source of truth is `src/layouts/BaseLayout.astro`; it already included `/resume/`, `/readme/`, and `/projects/`, so this bead reused the existing shared shell rather than re-implementing page-local chrome.
- Django footer in `templates/components/footer.html` contains only copyright plus LinkedIn and GitHub links.
- Astro footer in `src/layouts/BaseLayout.astro` preserves that same structure and destinations.

## Projects page mapping
- `templates/projects.html` page shell -> `src/pages/projects.astro` rendered inside `src/layouts/BaseLayout.astro`.
- Intro section (`#projects`, "Web Development", intro paragraph) -> `projectsIntro` in `src/data/projects.ts` rendered by `src/pages/projects.astro`.
- Repeated project sections -> `projectEntries` in `src/data/projects.ts` rendered by `src/components/projects/ProjectCard.astro`.
- Django `c-carousel-frame` / `c-carousel-item` behavior -> `src/components/projects/ProjectsCarousel.astro` plus the inline script in `src/pages/projects.astro` using small vanilla-JS prev/next + dot navigation with wraparound.
- Alternating desktop gallery/content order from `lg:flex` vs `lg:flex-row-reverse` -> `project.reverseOnDesktop` in `src/data/projects.ts` interpreted by `src/components/projects/ProjectCard.astro`.
- Card body structure (`description`, `Technology`, `Key Learnings`, optional Source Code action) -> `src/components/projects/ProjectCard.astro`.
- Source images under Django static paths -> copied to Astro-served `public/img/*` and referenced from `src/data/projects.ts`.

### Section-by-section inventory
- **Just Show Up**
  - Source title/description/tech/learning/link from `templates/partials/pages/projects.html` -> `projectEntries[0]`.
  - Source image `staticfiles/img/just_show_up.png` -> `public/img/just_show_up.png` -> carousel image in `ProjectsCarousel.astro`.
  - Source Code link preserved: `https://github.com/jsnyde0/just-show-up/`.
  - Layout parity: reversed gallery/content on desktop, stacked on mobile.
- **eBayes**
  - Source title/description/tech/learning/link from `templates/partials/pages/projects.html` -> `projectEntries[1]`.
  - Source images `staticfiles/img/ebayes-1.png` through `ebayes-4.png` -> matching `public/img/` files -> multi-slide carousel.
  - Source Code link preserved: `https://github.com/jsnyde0/ebayes/`.
  - Interactive affordance preserved: carousel can move across four screenshots and wraps at the ends.
- **Async Data Pipeline**
  - Source title/description/tech/learning from `templates/partials/pages/projects.html` -> `projectEntries[2]`.
  - Source image `staticfiles/img/async-data-pipeline.png` -> `public/img/async-data-pipeline.png`.
  - Source had no active Source Code link; Astro also renders no action button.
  - Layout parity: reversed gallery/content on desktop, stacked on mobile.
- **Object Detection API**
  - Source title/description/tech/learning/link from `templates/partials/pages/projects.html` -> `projectEntries[3]`.
  - Source image `staticfiles/img/yolo-api-apples-and-oranges.jpg` -> `public/img/yolo-api-apples-and-oranges.jpg`.
  - Source Code link preserved: `https://github.com/jsnyde0/yolo_api/`.
- **TopBottomBabes**
  - Source title/description/tech/learning/link from `templates/partials/pages/projects.html` -> `projectEntries[4]`.
  - Source images `staticfiles/img/topbottombabes-1.png` through `topbottombabes-5.png` -> matching `public/img/` files -> multi-slide carousel.
  - Source Code link preserved: `https://github.com/jsnyde0/topbottombabes/`.
  - Interactive affordance preserved: carousel can move across five screenshots and wraps at the ends.
  - Layout parity: reversed gallery/content on desktop, stacked on mobile.
- **Getting Tasks Done**
  - Source title/description/tech/learning/link from `templates/partials/pages/projects.html` -> `projectEntries[5]`.
  - Source images `staticfiles/img/getting_tasks_done-home.png` and `getting_tasks_done-subtask.png` -> matching `public/img/` files -> two-slide carousel.
  - Source Code link preserved: `https://github.com/jsnyde0/get-todos-done/`.
  - Interactive affordance preserved: carousel can move across two screenshots and wraps at the ends.

## Assets reviewed and Astro-served paths
- `staticfiles/img/just_show_up.png` -> `/img/just_show_up.png`
- `staticfiles/img/ebayes-1.png` -> `/img/ebayes-1.png`
- `staticfiles/img/ebayes-2.png` -> `/img/ebayes-2.png`
- `staticfiles/img/ebayes-3.png` -> `/img/ebayes-3.png`
- `staticfiles/img/ebayes-4.png` -> `/img/ebayes-4.png`
- `staticfiles/img/async-data-pipeline.png` -> `/img/async-data-pipeline.png`
- `staticfiles/img/yolo-api-apples-and-oranges.jpg` -> `/img/yolo-api-apples-and-oranges.jpg`
- `staticfiles/img/topbottombabes-1.png` -> `/img/topbottombabes-1.png`
- `staticfiles/img/topbottombabes-2.png` -> `/img/topbottombabes-2.png`
- `staticfiles/img/topbottombabes-3.png` -> `/img/topbottombabes-3.png`
- `staticfiles/img/topbottombabes-4.png` -> `/img/topbottombabes-4.png`
- `staticfiles/img/topbottombabes-5.png` -> `/img/topbottombabes-5.png`
- `staticfiles/img/getting_tasks_done-home.png` -> `/img/getting_tasks_done-home.png`
- `staticfiles/img/getting_tasks_done-subtask.png` -> `/img/getting_tasks_done-subtask.png`

## No runtime Django/HTMX dependency
- Astro route is plain `.astro` plus local data/components: `src/pages/projects.astro`, `src/data/projects.ts`, `src/components/projects/ProjectCard.astro`, and `src/components/projects/ProjectsCarousel.astro`.
- Generated route must not contain Django template tags, Cotton tags, or HTMX attributes; this is checked by `scripts/verify-projects-page.mjs` against `dist/projects/index.html`.
- No server-only `a_core` code is imported by the Astro route.

## Desktop/mobile preview checks
- Preview route checked at `http://127.0.0.1:4321/projects/` after `npm run build` + `npm run preview -- --host 127.0.0.1 --port 4321`.
- Desktop-width check note: the page renders as a centered intro followed by six project blocks; at the large-screen breakpoint each block becomes a two-column layout and the same alternating left/right gallery order from Django is preserved.
- Mobile-width check note: below the large-screen breakpoint each project collapses to a single-column stack with the screenshot carousel above the information card, matching the source structure intent.
- Interactive check note: multi-image projects expose prev/next controls and dots; single-image projects keep the same framed screenshot presentation with disabled nav buttons rather than removing the affordance.
- Content check note: all source project titles, descriptions, technology chips, key learnings, source links, and image alts were carried over verbatim.

## Tolerated visual deviations
- Django Tailwind/DaisyUI utility styling was translated into local Astro CSS, so exact spacing/shadow/button tokens differ slightly while structure, grouping, and dark-theme intent are preserved.
- Carousel navigation uses lightweight vanilla JS plus dot indicators instead of the original Cotton helper script; user-visible behavior remains the same for the current page surface.
- Single-image carousels show disabled nav buttons instead of active wraparound controls; this keeps the source visual framing without implying additional hidden slides.
- No browser screenshot artifact was generated in-repo during this pass; the inventory records the preview checks and responsive behavior notes instead.
