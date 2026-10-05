# Deploy to Cloudflare Pages

This repo is an Astro static site, served in production at https://www.jonatansnyders.com from the Cloudflare Pages project `jonatansnyders-resume`.

## Project facts

- Cloudflare account: `jonatan.snyders@gmail.com` (account id `7037734937d430a15fd16d9e2dec3016`)
- Pages project: `jonatansnyders-resume`, production branch `main`
- Deploy source: Wrangler direct upload. The project has no Git integration, so pushing to GitHub deploys nothing.
- Domains: `jonatansnyders-resume.pages.dev`, `jonatansnyders.com`, `www.jonatansnyders.com`
- GitHub repo: `jsnyde0/resume`
- Node.js: `22.12.0` or newer (`package.json` declares `>=22.12.0`)
- Build output directory: `dist/`

## Deploy

```sh
npm install
npm run build
npx wrangler pages deploy dist --project-name jonatansnyders-resume --branch main
```

`--branch main` publishes to production (both custom domains). Any other branch name gives a preview URL only.

Do not deploy to an existing unrelated Pages project.

## Custom domains and DNS

Cut over 2026-10-05 (bead `resume-bwu`).

- Registrar: easyhost.be (`my.easyhost.be` → Domeinnamen → jonatansnyders.com). Nameservers there point at Cloudflare: `hunts.ns.cloudflare.com`, `love.ns.cloudflare.com`. DNSSEC is off.
- DNS is managed in the Cloudflare zone `jonatansnyders.com` (zone id `29992eb15208e5e7465503af944ee6db`).
- Both custom domains are bound in Pages → `jonatansnyders-resume` → Custom domains.

| Record | Value | Proxy |
| --- | --- | --- |
| CNAME `jonatansnyders.com` | `jonatansnyders-resume.pages.dev` | Proxied |
| CNAME `www` | `jonatansnyders-resume.pages.dev` | Proxied |
| MX | `10 mx.mailprotect.be`, `50 mx.backup.mailprotect.be` | DNS only |
| TXT | `v=spf1 mx a include:_spf.relay.mailprotect.be ~all` | DNS only |
| CNAME `mail` / `autodiscover` / `autoconfig` | `pop3` / `autodiscover` / `autoconfig` `.mailprotect.be` | DNS only |
| SRV `_imaps._tcp` / `_pop3s._tcp` / `_submission._tcp` | `imap` 993 / `pop` 995 / `smtp-auth` 587 `.mailprotect.be` | DNS only |

Mail is hosted at easyhost (mailprotect.be); keep every mail record DNS only.

**Canonical host is `www`.** The Cloudflare Redirect Rule "Redirect root to www" matches `http.host eq "jonatansnyders.com"` and sends a 301 to `concat("https://www.jonatansnyders.com", http.request.uri.path)`, preserving the query string. Plain HTTP on either host is redirected to HTTPS.

## Rollback to the old Django site (Render)

Pre-cutover state, as served by easyhost's nameservers `ns1`/`ns2`/`ns3.easyhost.be`:

- Apex A `216.24.57.16` and `216.24.57.18` (Render), plus a stray A `217.21.190.175` (easyhost web server, HTTP only — do not restore it).
- `www` CNAME `resume-j9w5.onrender.com` (Render serves the apex → www 301 itself).
- `ftp` A `217.21.190.175` (deleted at cutover; unused).
- DNSSEC was on, with DS `22265 13 2 FB544A05570ED26BE614AFCAF80301C3E1E9897A52B0029DA689C5B247413594`.

To put the old site back while keeping Cloudflare DNS:

1. In the Cloudflare zone, replace the apex CNAME with the two Render A records and point `www` back to `resume-j9w5.onrender.com`, all **DNS only**.
2. Disable or delete the "Redirect root to www" rule.
3. Optionally remove both custom domains from the Pages project.

To leave Cloudflare entirely: easyhost → jonatansnyders.com → Nameservers → choose "Easyhost nameservers" and save. The easyhost zone still holds the pre-cutover records. Re-enable DNSSEC at easyhost only after the nameserver change has settled.

## Verification checklist

- `npm run build` exits 0 locally.
- `https://www.jonatansnyders.com/` returns 200 with `/_astro/` assets, and `/resume/`, `/readme/`, `/projects/`, `/factory/` return 200.
- `https://jonatansnyders.com/<path>?q` returns 301 to `https://www.jonatansnyders.com/<path>?q`.
- `dig MX jonatansnyders.com` still returns the mailprotect.be servers.
