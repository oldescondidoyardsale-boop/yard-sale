# Old Escondido Community Yard Sale — oldescondidoyardsale.com

The event landing page. Plain HTML and CSS — **no build step, no npm install, no
framework.** Vercel serves these files exactly as they are.

Saturday **October 10, 2026**, 7:30 AM – 1:00 PM, Old Escondido Historic
District, Escondido CA. Hosted by Andrea Zeman Homes.

---

## Files

| File | What it is |
| --- | --- |
| `index.html` | **Registration page.** Live from launch until ~48 hrs before the sale. |
| `map.html` | **Map page.** The page's second life — live map, printed-map pickup, sale-day info. |
| `thanks.html` | Confirmation. Where the form lands after a successful submit. |
| `site.css` | The only stylesheet. Resets, hero animation keyframes, hover/focus states. |
| `google-apps-script.gs` | Paste into your Google Sheet's Apps Script editor to receive registrations. Not served to the web. |
| `assets/` | Logo, illustration sprites, district map, social card, favicon. |
| `vercel.json` | Caching + security headers. `cleanUrls` is on, so `/map` works as well as `/map.html`. |
| `robots.txt`, `sitemap.xml` | Search basics. `thanks.html` is excluded. |

---

## Before you go live

### 1. The form is wired ✅

The form already posts to your live Apps Script endpoint:

```
https://script.google.com/macros/s/AKfycbwwpIX7oPf6U93-4WOFD0KkwFLqd-kNed6H09ef09gc9xbn3ZTkZRQQka0o5XcAY7PG/exec
```

It appears twice in `index.html` (`action` and `data-endpoint`) and both are set.

**Test it once before you share the link:** open the page, fill the form, submit.
You should land on `thanks.html`, a row should appear in the Sheet, and an email
should arrive at `GarageSaleOldEscondido@gmail.com`.

#### Columns you get

| Registered at | First name | Last name | Street address | Email | Mostly selling | Wants event news | Needs a yard sign | Asked about selling their home |
|---|---|---|---|---|---|---|---|---|

That Sheet is what you build the map from — **File → Download → CSV** feeds most
mapping tools (BatchGeo, Google My Maps) directly.

#### Turning the email off

In `google-apps-script.gs`, change the notification line to an empty string and
redeploy:

```js
const NOTIFY_EMAIL = '';
```

#### If you change the script later

**Deploy → Manage deployments → pencil icon → Version: New version → Deploy.**
Editing the code alone does nothing to the live endpoint until you redeploy. Done
this way the URL stays the same, so you never touch `index.html` again. Only
*Deploy → New deployment* mints a different URL — avoid that.

#### Troubleshooting

| Symptom | Cause |
| --- | --- |
| No row, no email | *Who has access* wasn't set to **Anyone**. Manage deployments → edit → fix → new version. |
| Lands on a Google page instead of `thanks.html` | Only `action` got the URL, not `data-endpoint`. Both need it. |
| Rows appear but no email | Gmail's daily send quota, or `NOTIFY_EMAIL` is empty. Rows are never lost to a mail failure. |
| Sheet stays empty on test | Open the `/exec` URL directly in a browser — it should say *"registration endpoint is live"*. If it errors, redeploy. |

The submit uses `fetch`; if a browser somehow can't run it, the form falls back
to a plain HTML POST to the same endpoint, so the row still gets written.

#### Setting this up again from scratch

If you ever need a fresh Sheet: create one at [sheets.new](https://sheets.new),
open **Extensions → Apps Script**, paste in all of `google-apps-script.gs`, then
**Deploy → New deployment → Web app**, *Execute as* **Me**, *Who has access*
**Anyone**. Copy the `/exec` URL into both places in `index.html`.

#### Prefer email-only instead of a Sheet?

[Formspree](https://formspree.io) is a drop-in alternative: sign up, create a
form, and put its endpoint in the `action` attribute (delete the `data-endpoint`
attribute so the script stops intercepting). Free for 50 submissions a month.

### 2. Check the placeholder facts

These were written from the event playbook and may need confirming:

- **Map pickup point** — "Grape Day Park, Broadway entrance, 6:30–8:30 AM"
  appears in `index.html` and `map.html`
- **Registration deadline** — Monday, October 5
- **Sponsor row** in the footer is text only; no partner logo files were supplied

---

## Deploy to GitHub + Vercel

### Step 1 — put it on GitHub

```bash
cd site
git init
git add .
git commit -m "Old Escondido Community Yard Sale — event page"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/oldescondido-yardsale.git
git push -u origin main
```

(Create the empty repo on github.com first — no README, no .gitignore, since
this folder already has one.)

### Step 2 — connect Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub
2. **Import** the repo you just pushed
3. Framework preset: **Other**. Build command: **leave empty**. Output
   directory: **leave empty**
4. **Deploy**

You get a `something.vercel.app` URL immediately. Every `git push` to `main`
redeploys automatically.

> **If you put this folder at the root of a larger repo,** set Vercel's *Root
> Directory* to `site` in Project Settings → General.

### Step 3 — attach the domain

1. Vercel project → **Settings → Domains → Add**
2. Enter `oldescondidoyardsale.com`, then add `www.oldescondidoyardsale.com` too
   (Vercel will offer to redirect one to the other — accept)
3. Vercel shows the DNS records to create. At your domain registrar:

   | Type | Name | Value |
   | --- | --- | --- |
   | `A` | `@` | `76.76.21.21` |
   | `CNAME` | `www` | `cname.vercel-dns.com` |

   *(Use whatever Vercel's own panel shows — it is authoritative if it differs.)*

4. Wait for DNS to propagate — usually minutes, up to a few hours. HTTPS is
   issued automatically.

---

## Swapping to the map on October 8

The printed QR codes all point at one URL, so the page **swaps** rather than
moving. Two ways:

**Simplest** — rename the files and push:

```bash
mv index.html register.html
mv map.html index.html
git commit -am "Switch to map state"
git push
```

**Reversible** — add a redirect to `vercel.json` instead, so nothing is renamed:

```json
"redirects": [
  { "source": "/", "destination": "/map.html", "permanent": false }
]
```

Set `"permanent": false` — a permanent redirect gets cached by browsers and is
painful to undo.

Either way the QR codes keep working. Don't reprint anything.

---

## Local preview

Just open `index.html` in a browser — everything is relative, it works from the
file system.

For a closer match to production (clean URLs, correct headers):

```bash
npx vercel dev
```

---

## Notes for whoever maintains this

- **Fonts** load from Google Fonts: **Poppins** (display, UI, body) and **Prata**
  (the date line). Prata has no italic on purpose — the accent must never read as
  a script face.
- **The illustration is composed from individual sprites**, not one flat image.
  That's what lets the trees sway, the bunting swing and the bicycle ride across
  — and it stays sharp at any screen width. Positions are all percentages, so it
  scales without cropping.
- **All motion stops** for anyone whose device asks for reduced motion.
- The **"just here to shop?"** bar is hidden above the fold on purpose and slides
  up after the first screen. Above the fold it was unreadable over the pale sky
  and it competed with the one button that matters.
- **No navigation bar** — the page has one job.
- The host's logo appears in exactly **two** places: the top bar and the footer.
  This is a community event page, not a real-estate page. Please keep it that way.
- The **live map** currently shows the district map image with sample pins. When
  BatchGeo or Google My Maps is set up, replace the `<img>` inside
  `map.html`'s map frame with the embed `<iframe>`.
