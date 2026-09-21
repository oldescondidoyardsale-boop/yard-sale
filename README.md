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
| `FORM-FIX-READ-ME.md` | **Start here.** Why the form wasn't saving, and the one-minute fix. |
| `assets/` | Logo, illustration sprites, district map, social card, favicon. All in one flat folder — no sub-folders. |
| `vercel.json` | Caching + security headers. `cleanUrls` is on, so `/map` works as well as `/map.html`. |
| `robots.txt`, `sitemap.xml` | Search basics. `thanks.html` is excluded. |

---

## Before you go live

### 1. The form — ⚠️ read `FORM-FIX-READ-ME.md` first

I tested your endpoint on **14 August 2026** and it returned a **Google sign-in
page**, which means no registration has ever reached the Sheet. The one-minute
fix is in **[`FORM-FIX-READ-ME.md`](FORM-FIX-READ-ME.md)** — do that before you
share the link.

So the form now writes to **two** destinations on every submission:

| Destination | Setup needed | Role |
| --- | --- | --- |
| **Netlify Forms** | None — works on deploy | The capture that cannot fail |
| **Google Sheet** via Apps Script | The fix above | Your working spreadsheet |

The page only waits for Netlify, so a broken Sheet feed can never cost you a
registration. Submissions appear in the Netlify dashboard under **Forms →
registration**, and you can have them emailed to you — see `FORM-FIX-READ-ME.md`.

The Sheet endpoint lives on the form's `data-sheet-endpoint` attribute in
`index.html`:

```
https://script.google.com/macros/s/AKfycbwwpIX7oPf6U93-4WOFD0KkwFLqd-kNed6H09ef09gc9xbn3ZTkZRQQka0o5XcAY7PG/exec
```

Both POSTs go through `fetch`, which keeps the visitor on your site and works
inside the Instagram and Facebook in-app browsers.

**Test it once before you share the link**, and confirm the row really lands in
the Sheet — see *The Sheet is empty* below if it doesn't.

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

#### The Sheet is empty — read this first

If you submitted the form, landed on `thanks.html`, and **nothing appeared in the
Sheet**, the endpoint is rejecting the request. Landing on the thank-you page is
**not** proof it saved. Check in this order:

**1. Is the endpoint actually live?**
Paste your `/exec` URL straight into a browser address bar:

```
https://script.google.com/macros/s/AKfycbwwpIX7oPf6U93-4WOFD0KkwFLqd-kNed6H09ef09gc9xbn3ZTkZRQQka0o5XcAY7PG/exec
```

- ✅ *"Old Escondido Yard Sale registration endpoint is live"* → endpoint is fine,
  go to step 3
- ❌ A **Google sign-in page** → *Who has access* is wrong. This is the usual
  cause. Fix: **Deploy → Manage deployments → pencil → Who has access: Anyone →
  Version: New version → Deploy.** It must be **Anyone**, not *Anyone with a
  Google account*.
- ❌ *"Script function not found: doGet"* → the code didn't save, or only part of
  it was pasted. Re-paste all of `google-apps-script.gs`, save, redeploy as a new
  version.

**2. Did you deploy after pasting the code?**
Saving in the Apps Script editor does nothing to the live URL. You must do
**Deploy → Manage deployments → pencil → Version: New version → Deploy** every
time you change the script.

**3. Run it once by hand.**
In the Apps Script editor, pick `setup` from the function dropdown and press
**Run**. That creates the `Registrations` tab with its headers. If the headers
appear, the script and the Sheet are connected properly and the problem is the
deployment settings from step 1.

**4. Check the execution log.**
Apps Script left sidebar → **Executions**. Every real submission shows up here.
- No rows at all → the request never reached Google (step 1)
- Rows marked *Failed* → open one to see the error

#### Other issues

| Symptom | Cause |
| --- | --- |
| Rows appear but no email | Gmail's daily send quota, or `NOTIFY_EMAIL` is empty. Rows are never lost to a mail failure. |
| Images missing / broken icons | The `assets` folder didn't upload. Every image lives directly in `assets/` — no sub-folders — so drag the **whole `site` folder** in, not the files inside it. |
| Lands on a Google page instead of `thanks.html` | JavaScript is blocked. The registration is still saved; only the redirect is lost. |

#### Setting this up again from scratch

If you ever need a fresh Sheet: create one at [sheets.new](https://sheets.new),
open **Extensions → Apps Script**, paste in all of `google-apps-script.gs`, then
**Deploy → New deployment → Web app**, *Execute as* **Me**, *Who has access*
**Anyone**. Copy the `/exec` URL into the form's `data-sheet-endpoint` in
`index.html`.

#### Prefer email-only instead of a Sheet?

You already have this — Netlify Forms can email every submission. See
`FORM-FIX-READ-ME.md`. [Formspree](https://formspree.io) is another option if you
ever move off Netlify.

### 2. Check the placeholder facts

These were written from the event playbook and may need confirming:

- **Map pickup point** — "Top of 6th Ave, 6:30–8:30 AM" (confirmed).
  Appears in `map.html` only (removed from `index.html` at your request)
- **Map go-live date** — Thursday, October 8 (two days before the sale). Stated in
  the "On the day" section on `index.html` and in the shop bar. Change both if
  the date moves.
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
