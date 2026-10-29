# The Journey Church

Rebuild of thejourneychurchsemo.com, matched to the existing Church Co design, deployable from Git to Render as a Node web service.

---

## Deploy to Render

| Field | Value |
|---|---|
| Runtime | **Node** |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Branch | `main` |
| Root Directory | *(blank)* |

`render.yaml` sets all of it if you deploy via **New -> Blueprint**.

`render.yaml`, `package.json`, `server.js`, and `index.html` must sit at the **repo root**. Run `ls` to confirm before pushing.

```bash
git init && git add . && git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/journey-church.git
git push -u origin main
```

Run locally with `npm install && npm start` at http://localhost:10000.

### The free plan sleeps

A free Render web service spins down after about 15 minutes idle, and the next visitor waits roughly 50 seconds. Either set `plan: starter` in `render.yaml` for $7/mo, or point a free uptime pinger at the site every 10 minutes.

---

## If Render tries to run `pip install -r requirements.txt`

That means the service was created with the **Python** runtime. Render locks a service's runtime at creation, so pushing Node code to it will never fix the error.

**Fix:** delete the service and create a new one. Settings -> bottom of page -> Delete Service. Then **New -> Blueprint**, which reads `render.yaml` and sets Node automatically.

Check the top of any build log to see which runtime a service is actually using. It names the language on the first few lines.

### Bulletproof fallback: Docker

If auto-detection keeps guessing wrong, the included `Dockerfile` removes all guessing. Rename `render.docker.yaml` to `render.yaml`, commit, push, and deploy via Blueprint. Or create the service manually with Runtime set to **Docker** and leave every other field blank.

---

## Before you go live

Both forms post to Web3Forms, which is free to 250 submissions a month and needs no server.

1. Get an access key at web3forms.com with the church email
2. Paste it into `assets/js/site.js`, line 12
3. Commit and push

Until then the forms show a clear message instead of failing silently.

---

## Design system

Colours and type were sampled from the live site, not invented. Everything lives in the `:root` block at the top of `assets/css/site.css`:

```css
--olive:#3A4522;      /* page header bands, olive sections, accordions */
--ink:#0F172A;        /* all text, card borders                        */
--amber:#F7B83C;      /* CTA buttons, accent words on dark             */
--amber-text:#BE8400; /* accent words on white (contrast-safe)         */
--black:#110D0D;      /* footer                                        */
```

Typeface is **Inter**, the same family the live site loads, self-hosted as a 32 KB variable font.

**Why two ambers.** The brand gold on white measures 1.77:1, below the accessibility floor. Dark sections use the full-strength `--amber`; white sections use `--amber-text`, which reads as the same gold and passes. The swap is automatic, so just use `class="amber"` and the right one applies.

---

## Editing content

| To change | Edit |
|---|---|
| Homepage | `index.html` |
| Pastors | `our-pastors/index.html` |
| Beliefs | `what-we-believe/index.html` |
| Launch team | `serve-with-us/index.html` |
| Contact | `connect/index.html` |
| Giving | `give/index.html` |
| Colours | `assets/css/site.css`, `:root` block |
| Nav and footer | Each page has its own copy. Change all seven. |

### Ministry cards

Five cards appear on both the homepage and the serve page, in the `.cards` block. Each is a `<figure>`-style `<article class="card">` with an image and a label. Swap `src`, `alt`, `width`, and `height` to change one.

Two need real photos: **Community Outreach** currently uses a volunteer shot, and **Sports** uses the band shell wide shot. The originals on the live site are a different outreach photo and an aerial of the Jackson football stadium. Drop those into `assets/img/` as `card-outreach.webp` and `card-sports.webp` and they replace automatically.

### Welcome video

The homepage embeds YouTube video `xCGj8ZgsawA` through youtube-nocookie.com. To change it, replace the ID in the `.video` iframe in `index.html`.

---

## What is in here

```
server.js                Express: routing, redirects, gzip, 404
package.json             Dependencies and npm start
index.html               Homepage
our-pastors/             Brandon and Whitney
what-we-believe/         Statement of faith, 9 beliefs
serve-with-us/           Ministries and launch team form
connect/                 Contact form
give/                    Reach Network and mail
404.html

assets/css/site.css      All styling. Tokens at the top.
assets/css/fonts.css     Inter font-face
assets/fonts/            inter-var.woff2, 32K
assets/js/site.js        Nav, form handling
assets/img/              Photos, logos, favicons

render.yaml              Render blueprint (Node runtime)
render.docker.yaml       Alternative blueprint (Docker runtime)
Dockerfile               Explicit runtime, if auto-detect misfires
robots.txt / sitemap.xml
```

---

## URL redirects

`server.js` 301s the URLs Google indexed from the Church Co site:

| Old | New |
|---|---|
| `/our-mission--beliefs` | `/what-we-believe/` |
| `/members-portal` | `/connect/` |
| `/form/contact` | `/connect/` |
| `/form/launch-team-form` | `/serve-with-us/` |

---

## Technical notes

**Self-hosted.** No Church Co CDN, no Google Fonts request. Inter is subset to Latin at 32 KB.

**Server.** Express with gzip. HTML revalidates every request so edits appear immediately, fonts cache a year, images and CSS cache a week. Source files are blocked from being served.

**Accessibility.** Verified at 320, 390, 768, and 1440 px: no horizontal overflow, zero WCAG AA contrast failures, every tap target at least 44 px, visible keyboard focus, skip link, correct heading order, alt text on every image, and `prefers-reduced-motion` respected.

**No browser storage.** Nothing is stored client side.
