# README source-to-Astro inventory

## Source templates reviewed
- `templates/readme_md.html`
- `templates/partials/pages/readme_md.html`
- `templates/layouts/default.html`
- `templates/components/navbar.html`
- `templates/components/footer.html`
- `templates/cotton/resume_card.html`
- Rendered Django `/readme/` page from local `manage.py runserver` (`http://127.0.0.1:8008/readme/`)
- `src/layouts/BaseLayout.astro`

## Shared chrome
- Django chrome links the brand/home anchor plus Resume, README, and Side Projects nav items via HTMX anchors in `templates/components/navbar.html`.
- Astro source of truth is `src/layouts/BaseLayout.astro`; it already includes `/resume/`, `/readme/`, and `/projects/` links, so no shared chrome rewrite was needed for this bead.
- Django footer contains an empty home anchor plus copyright text and LinkedIn/GitHub links.
- Astro footer in `src/layouts/BaseLayout.astro` preserves the visible copyright/social structure and destinations, but replaces the empty focusable home anchor with an inert spacer so the static footer has no invisible keyboard target.

## Page mapping
- `templates/readme_md.html` page shell -> `src/pages/readme.astro` rendered inside `src/layouts/BaseLayout.astro`.
- `#readme-md-content` max-width wrapper -> `.readme-page` in `src/pages/readme.astro`.
- `README` page heading -> `.readme-page__title` in `src/pages/readme.astro`.
- Each Django `<c-resume-card>` section (`Quirks`, `What I Value`, `How I can help you`, `How you can help me`) -> `ResumeCard` instances in `src/pages/readme.astro`.
- Each Django bulleted list item -> literal Astro list content in the matching section, preserving wording and order.
- Django `.link` anchors for `boring technology` and `interruptible` -> `.readme-link` anchors in `src/pages/readme.astro` with the same href targets and new-tab behavior.
- Responsive list typography intent from `[&_li]:text-sm sm:[&_li]:text-base` -> `.readme-list li` CSS with mobile base size and larger `sm` breakpoint text in `src/pages/readme.astro`.

## No runtime Django/HTMX dependency
- Astro page is plain `.astro` markup plus CSS.
- No `{% %}` template tags, HTMX attributes, Django includes, or runtime template dependencies were introduced in `src/pages/readme.astro`.

## Tolerated visual deviations
- Tailwind utility classes from the Django partial were translated into local Astro CSS, so class names differ while spacing, typography scale, and max-width intent are preserved.
- The empty Django footer home anchor is replaced by an inert spacer in Astro to preserve layout without shipping an invisible focusable control.
- DaisyUI/cotton card chrome (`templates/cotton/resume_card.html`) is represented with the existing Astro `ResumeCard` component from the resume migration; the exact class names and shadow implementation differ, while the dark rounded-card structure and section-title hierarchy are preserved.
- External links add `rel="noreferrer"` alongside `target="_blank"` for static-site safety; destination and behavior remain equivalent.
- Visual validation compared the rendered Django page and the built Astro page in local previews at desktop width and a 390px mobile viewport. The check showed matching route, section headings/order, four-card structure, nav/footer chrome, mobile no-overflow behavior, and preserved list/link styling.

## Visual check record
- Rendered Django local preview (`http://127.0.0.1:8008/readme/`) and Astro local preview (`http://127.0.0.1:4323/readme/`) both served `/readme/` with nav text `Jonatan Snyders`, `Resume`, `README`, `Side Projects`; footer text `© Copyright 2024. All Rights Reserved.`; and headings `README`, `Quirks`, `What I Value`, `How I can help you`, `How you can help me`.
- Astro desktop local preview (`http://127.0.0.1:4323/readme/`, 1920px viewport): `README` route loaded with shared navbar links (`/resume/`, `/readme/`, `/projects/`), page heading, card styling, external README links, and footer copyright/social chrome visible.
- Astro mobile local preview (`http://127.0.0.1:4323/readme/`, 390px viewport): hamburger menu displayed, desktop nav collapsed, all four README cards rendered in order, list text wrapped without horizontal overflow, and footer/social links remained reachable.
