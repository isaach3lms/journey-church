# The Journey Church

Static website for The Journey Church, Jackson, Missouri. Built to deploy on Render from Git.

No build step. No framework. No dependencies. Push to Git, Render publishes the folder.

---

## Deploy to Render

**First time**

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/journey-church.git
git push -u origin main
```

Then in Render: **New → Static Site → connect the repo**.

| Setting | Value |
|---|---|
| Build command | *(leave blank)* |
| Publish directory | `.` |
| Branch | `main` |

Render also reads `render.yaml` automatically if you deploy via **New → Blueprint**, which applies the redirects and cache headers below without any manual setup. Blueprint is the better path.

**Every change after that**

```bash
git add .
git commit -m "What changed"
git push
```

Render redeploys in about 30 seconds.

---

## Before you go live

### 1. Connect the forms (required)

Render static sites cannot process form submissions. Both forms post to Web3Forms, which is free up to 250 submissions per month and needs no account or server.

1. Go to web3forms.com
2. Enter the church email address, get an access key
3. Open `assets/js/site.js`, line 12
4. Replace `PASTE-YOUR-WEB3FORMS-ACCESS-KEY-HERE` with the key
5. Commit and push

Until that key is in, both forms display a clear message instead of failing silently. Submissions arrive as email to whatever address you registered.

Forms affected: the homepage signup, the launch team form on `/serve-with-us/`, and the contact form on `/connect/`.

### 2. Point the domain

In Render: Settings → Custom Domains → add `thejourneychurchsemo.com` and `www.thejourneychurchsemo.com`. Render gives you DNS records. Update them at your registrar, wait for the SSL certificate to issue, then cancel The Church Co.

Do not cancel Church Co before the domain resolves to Render. All images now live in this repo, so nothing breaks when the old host goes away, but the DNS cutover should come first.

---

## Editing content

| To change | Edit |
|---|---|
| Homepage | `index.html` |
| Pastors page | `our-pastors/index.html` |
| Statement of faith | `what-we-believe/index.html` |
| Launch team page | `serve-with-us/index.html` |
| Contact page | `connect/index.html` |
| Giving page | `give/index.html` |
| Homepage gallery | `index.html`, the `.gallery` block at Marker 04 |
| Brand colors | `assets/css/site.css`, the `:root` block at the top |
| Nav and footer | Each page has its own copy. Change all six. |

Text lives directly in the HTML. Find the sentence, change it, commit, push.

### Brand colors

All colors derive from the church badge and sit in one place at the top of `assets/css/site.css`:

```css
--timber:#14200C;   /* deepest olive, dark backgrounds  */
--olive:#3A4922;    /* badge olive                      */
--sand:#F3EEE1;     /* paper                            */
--blaze:#FAB93B;    /* badge amber                      */
--blaze-deep:#8C5A0C; /* amber on light backgrounds     */
```

Change those five values and the whole site follows. `--blaze-deep` exists because the badge amber does not have enough contrast on the sand background for small text, so light surfaces use the deeper bronze instead.

### Adding a photo

Drop the file in `assets/img/`, then reference it as `/assets/img/filename.webp`. Always include an `alt` attribute describing the image.

### Swapping a gallery photo

The homepage gallery at Marker 04 holds seven photos. Each is a `<figure>` inside `.gallery`. To change one, replace the `src`, `alt`, `width`, and `height`. The first figure carries `class="wide"` and should stay a landscape image; the rest are portrait and get cropped to 3:4.

Photos should be exported as `.webp`: about 1400px wide for the landscape shot, 900px for portraits, quality 80.

### Spare images

`hero-path.webp` (downtown Jackson community dinner), `badge.png`, and `wordmark.png` sit in `assets/img/` unused. The badge and wordmark are the dark-ink versions for light backgrounds if you ever need them.

---

## What is in here

```
index.html               Homepage
our-pastors/             Brandon and Whitney
what-we-believe/         Statement of faith, 9 beliefs
serve-with-us/           Launch team signup
connect/                 Contact form
give/                    Reach Network and mail
404.html                 Not found

assets/css/site.css      All styling. Tokens at the top.
assets/css/fonts.css     Self-hosted font declarations
assets/fonts/            5 woff2 files, Latin subset, 376K total
assets/js/site.js        Nav, scroll markers, form handling
assets/img/              All photos, logo variants, favicons

render.yaml              Render blueprint: redirects, cache headers
robots.txt               Search engine directives
sitemap.xml              Page index for Google
```

---

## URL redirects

`render.yaml` preserves the URLs Google already indexed from the Church Co site:

| Old | New |
|---|---|
| `/our-mission--beliefs` | `/what-we-believe` |
| `/members-portal` | `/connect` |
| `/form/contact` | `/connect` |
| `/form/launch-team-form` | `/serve-with-us` |

---

## Technical notes

**Fonts are self-hosted.** Bricolage Grotesque (headings), Newsreader (body), Space Mono (labels and coordinates). No request to Google, faster load, no third-party tracking. Subset to Latin with common punctuation, 376K total, with the two critical faces preloaded.

**Images are self-hosted.** Nothing loads from The Church Co's CDN. Photos from the band shell gathering were converted to WebP and sized for their display slot. Total image payload is about 2.1 MB across the whole site, and no single page loads more than roughly 900 KB of it.

**Accessibility.** Verified with automated checks at 320px, 390px, 768px, and 1440px:

- No horizontal overflow on any page at any width
- All text meets WCAG AA contrast (4.5:1 body, 3:1 large)
- Every tap target at least 44px tall on mobile
- Visible keyboard focus, skip-to-content link
- `prefers-reduced-motion` respected
- Proper heading order, alt text on every image

**Browser storage is not used.** Nothing is stored client side.

---

## If you want a visual editor later

Right now editing means committing to Git. That is fine for six pages of stable content. Once you launch and start posting sermons or events weekly, add Decap CMS on top of this same repo. It gives a login page and a WYSIWYG editor that writes commits behind the scenes. No hosting change, no rebuild.
