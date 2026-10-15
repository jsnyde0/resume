# Deploy to Cloudflare Pages

This repo is an Astro static site, served in production at https://www.jonatansnyders.com from the Cloudflare Pages project `jonatansnyders-resume`.

## Project facts

- Cloudflare account: `jonatan.snyders@gmail.com` (account id `7037734937d430a15fd16d9e2dec3016`)
- Pages project: `jonatansnyders-resume`, production branch `main`
- Deploy source: Wrangler direct upload from GitHub Actions (`.github/workflows/deploy.yml`). The project has no Cloudflare Git integration; a direct-upload project cannot get one.
- Domains: `jonatansnyders-resume.pages.dev`, `jonatansnyders.com`, `www.jonatansnyders.com`
- GitHub repo: `jsnyde0/resume`
- Node.js: `22.12.0` or newer (`package.json` declares `>=22.12.0`)
- Build output directory: `dist/`

## Deploy

Push to GitHub. The `Deploy to Cloudflare Pages` workflow (`.github/workflows/deploy.yml`) runs `npm ci`, `npm run gate`, then `wrangler pages deploy dist`:

- Push to `main` publishes to production (both custom domains).
- Push to any other branch publishes a preview URL only.

Watch a run: `gh run list --workflow deploy.yml -L 1`.

Repo secrets the workflow needs (`gh secret list --repo jsnyde0/resume`):

- `CLOUDFLARE_API_TOKEN` — custom token `github-actions-pages-deploy`, permission Account / Cloudflare Pages / Edit, scoped to this account only. Rotate it in dash.cloudflare.com → My Profile → API Tokens, then `gh secret set CLOUDFLARE_API_TOKEN --repo jsnyde0/resume`.
- `CLOUDFLARE_ACCOUNT_ID` — the account id above.

### Manual fallback

Use when Actions is down or for a deploy from a local checkout:

```sh
npm install
npm run build
npx wrangler pages deploy dist --project-name jonatansnyders-resume --branch main
```

`--branch main` publishes to production. Any other branch name gives a preview URL only.

Do not deploy to an existing unrelated Pages project.

## Custom domains and DNS

Cut over 2026-10-05 (bead `resume-bwu`).

- Registrar: Cloudflare Registrar (transferred from easyhost.be / Combell, completed 2026-10-11, bead `resume-bcg`). Nameservers `hunts.ns.cloudflare.com`, `love.ns.cloudflare.com`; Cloudflare Registrar requires Cloudflare nameservers. DNSSEC is on: Cloudflare signs the zone and publishes DS `2371 13 2 7B614B76…` at .com itself. easyhost no longer holds the domain (its panel reports no access to it since the transfer), so nothing renews there.
- DNS is managed in the Cloudflare zone `jonatansnyders.com` (zone id `29992eb15208e5e7465503af944ee6db`).
- Both custom domains are bound in Pages → `jonatansnyders-resume` → Custom domains.

| Record | Value | Proxy |
| --- | --- | --- |
| CNAME `jonatansnyders.com` | `jonatansnyders-resume.pages.dev` | Proxied |
| CNAME `www` | `jonatansnyders-resume.pages.dev` | Proxied |
| MX | `9 route1`, `15 route3`, `95 route2` `.mx.cloudflare.net` | DNS only (managed by Email Routing) |
| TXT | `v=spf1 include:_spf.mx.cloudflare.net ~all` | DNS only (managed by Email Routing) |
| TXT `cf2024-1._domainkey` | Cloudflare Email Routing DKIM key | DNS only (managed by Email Routing) |
| TXT `_dmarc` | `v=DMARC1; p=reject;` | DNS only |

**Mail is receive-only, via Cloudflare Email Routing** (decided 2026-10-06, bead `resume-bcg`; the easyhost mailbox never existed). Email Routing → Routing rules forwards `hi@jonatansnyders.com` to `jonatan.snyders@gmail.com`; the catch-all is disabled (drop). Nothing sends as this domain, so DMARC rejects spoofed mail. The old easyhost mail records (MX/SPF/CNAME/SRV at `mailprotect.be`) were deleted 2026-10-06.

**Canonical host is `www`.** The Cloudflare Redirect Rule "Redirect root to www" matches `http.host eq "jonatansnyders.com"` and sends a 301 to `concat("https://www.jonatansnyders.com", http.request.uri.path)`, preserving the query string. Plain HTTP on either host is redirected to HTTPS.

## Rollback to the old Django site (Render)

Pre-cutover state, as served by easyhost's nameservers `ns1`/`ns2`/`ns3.easyhost.be`:

- Apex A `216.24.57.16` and `216.24.57.18` (Render), plus a stray A `217.21.190.175` (easyhost web server, HTTP only — do not restore it).
- `www` CNAME `resume-j9w5.onrender.com` (Render serves the apex → www 301 itself).
- `ftp` A `217.21.190.175` (deleted at cutover; unused).
- DNSSEC was on, with DS `22265 13 2 FB544A05570ED26BE614AFCAF80301C3E1E9897A52B0029DA689C5B247413594`.

The Django source lives at git tag `legacy-django` (`git checkout legacy-django`); it was removed from `main` after cutover. Render is suspended: to roll back, resume the Render service, which redeploys from that tag (set the service's branch/ref to `legacy-django`), then:

1. In the Cloudflare zone, replace the apex CNAME with the two Render A records and point `www` back to `resume-j9w5.onrender.com`, all **DNS only**.
2. Disable or delete the "Redirect root to www" rule.
3. Optionally remove both custom domains from the Pages project.

To leave Cloudflare entirely, transfer the domain out first: Cloudflare Registrar does not allow non-Cloudflare nameservers, and a new transfer is blocked for 60 days after 2026-10-11. Get the auth code in Cloudflare → Domain Registration → jonatansnyders.com, start the transfer at the new registrar, and recreate the records above in its DNS. Turn DNSSEC off in Cloudflare before the move and back on at the new host after it settles.

## Verification checklist

- `npm run build` exits 0 locally.
- `https://www.jonatansnyders.com/` returns 200 with `/_astro/` assets, and `/resume/`, `/readme/`, `/projects/`, `/factory/` return 200.
- `https://jonatansnyders.com/<path>?q` returns 301 to `https://www.jonatansnyders.com/<path>?q`.
- `dig MX jonatansnyders.com` returns the three `route*.mx.cloudflare.net` servers.
- `whois jonatansnyders.com` shows `Registrar: Cloudflare, Inc.` and `DNSSEC: signedDelegation`; a validating resolver sets the AD flag (`curl -s 'https://dns.google/resolve?name=jonatansnyders.com&type=A' | jq .AD` → `true`).
