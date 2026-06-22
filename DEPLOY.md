# Deploy to Cloudflare Pages

This repo is an Astro static site. The migration branch is intended to deploy as a Cloudflare Pages preview before any production cutover.

## Prerequisites

- Cloudflare account: `jonatan.snyders@gmail.com`
- Cloudflare Pages project: `jonatansnyders-resume`
- Preview domain: `jonatansnyders-resume.pages.dev`
- GitHub repo: `jsnyde0/resume`
- Branch: `feat_astro_migration`
- Node.js: `22.12.0` or newer (`package.json` declares `>=22.12.0`)
- Local sanity check passes:

```sh
npm install
npm run build
```

The build output directory is `dist/`.

## Preferred path: Cloudflare Pages Git integration

In the Cloudflare dashboard:

1. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select the GitHub repo `jsnyde0/resume`.
3. Select the branch `feat_astro_migration` for the migration preview.
4. Use these build settings:

| Setting | Value |
| --- | --- |
| Framework preset | `Astro` |
| Install command | `npm install` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `22.12.0` or newer |

If Cloudflare exposes environment variables instead of a Node-version field, set:

| Variable | Value |
| --- | --- |
| `NODE_VERSION` | `22.12.0` |

5. Save and deploy.
6. Confirm the deployment produces a `*.pages.dev` preview URL and that `/` serves the landing page.

## CLI fallback: Wrangler direct deploy

Use this when the dashboard Git integration is not available or when you need a one-off preview from the current checkout.

```sh
npm install
npm run build
npx wrangler pages deploy dist \
  --project-name jonatansnyders-resume \
  --branch feat_astro_migration
```

Do not deploy to an existing unrelated Pages project. This repo's Pages project is `jonatansnyders-resume` in the `jonatan.snyders@gmail.com` Cloudflare account.

## Verification checklist

- `npm run build` exits 0 locally.
- Cloudflare Pages build exits 0.
- The deployment has a `*.pages.dev` preview URL.
- Opening the preview URL serves the Astro landing page.
- The preview uses the migration branch (`feat_astro_migration`) and the `dist/` output directory.
