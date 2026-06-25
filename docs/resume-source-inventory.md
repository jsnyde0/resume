# Resume source-to-Astro inventory

## Source templates reviewed
- `templates/resume.html`
- `templates/partials/pages/resume.html`
- `templates/cotton/resume_card.html`
- `templates/cotton/resume_item_card.html`
- `templates/layouts/default.html`
- `templates/components/navbar.html`
- `templates/components/footer.html`
- `a_core/views.py`
- `a_core/utils.py`

## Shared chrome
- Django navbar links to Home, Resume, README, Side Projects via HTMX.
- Astro source of truth: `src/layouts/BaseLayout.astro` already contained `/resume/`, `/readme/`, and `/projects/` links before this bead; no shared-link change was needed.
- Django footer contains copyright + LinkedIn/GitHub social links only.
- Astro keeps the same footer structure; no page-link footer was introduced because the source footer has none.

## Resume page mapping
- Page shell `templates/resume.html` + default layout -> `src/pages/resume.astro` inside `src/layouts/BaseLayout.astro`.
- Intro card with avatar hover swap, identity badges, six intro paragraphs, skill badges, and the CV affordance -> first `ResumeCard` block in `src/pages/resume.astro`.
- Skills card title/tooltip and view selector -> second `ResumeCard` block in `src/pages/resume.astro`.
- `a_core/utils.py` skills tree data -> `src/data/resume.ts` (`skillsTree`).
- Achievement cards -> `src/data/resume.ts` (`achievements`) rendered through `src/components/resume/ResumeItemCard.astro`.
- Work Experience cards -> `src/data/resume.ts` (`workExperience`) rendered through `src/components/resume/ResumeItemCard.astro`.
- Education cards -> `src/data/resume.ts` (`education`) rendered through `src/components/resume/ResumeItemCard.astro`.
- Cotton `resume_card` wrapper styling -> `src/components/resume/ResumeCard.astro` with component-local `.resume-card*` styles so Astro scoping applies to the rendered card markup.
- Cotton `resume_item_card` icon / meta / body structure -> `src/components/resume/ResumeItemCard.astro` with component-local `.resume-item-card*` / badge / link styles so mobile and desktop layout rules apply to the rendered item cards.

## CV/download behavior
- Django `download_cv` redirects back to `/resume/` with a warning saying the PDF is not available yet.
- No CV/PDF asset exists in `static/`, `staticfiles/`, `public/`, or repo root.
- Astro keeps a static "Download CV" control that opens the same honest tooltip instead of inventing a file.

## Tolerated visual deviations
- The Django Plotly sunburst and custom collapsible-tree runtime were replaced with two static client-side views sourced from the same skills content: a grouped chip overview labeled `Sunburst Chart` and a details/summary tree. Content parity is preserved, but the exact Plotly rendering is intentionally not replicated.
- Tooltip styling is recreated with lightweight CSS instead of DaisyUI/Alpine primitives.
- The Astro mobile menu implementation remains the existing slice-1 version; resume work uses that shared chrome unchanged.

## Follow-up / gap
- If a real downloadable CV/PDF is later added, wire `/resume/` to that asset and replace the tooltip-only affordance.
