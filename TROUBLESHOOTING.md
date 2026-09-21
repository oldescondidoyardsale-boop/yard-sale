# Why the live site is stale, and how to be certain

## Step 1 — is the new build actually deployed?

Every page now carries a build stamp on **line 2** of its HTML:

```html
<!-- BUILD 2026-09-21-b · printed maps: Top of 6th Ave · form: Sheet-primary -->
```

Open your live site and press **Ctrl+U** (Windows) or **Cmd+Option+U** (Mac) to
view the page source. Look at line 2.

- **You see `BUILD 2026-09-21-b`** → the new files ARE live. What you are looking
  at is a cached copy in your own browser. Skip to *Step 3*.
- **You see no build stamp, or an older one** → the deploy did not happen. Go to
  *Step 2*.

This takes five seconds and removes all guesswork. Do it before anything else.

## Step 2 — the deploy did not include your changes

Check these in order. One of them is always the cause.

### a) Did the commit actually contain the files?

```
git status
git add -A
git commit -m "Site update"
git push
```

If `git status` says *"nothing to commit, working tree clean"* **before** you
copied the new files in, then you never copied them in. Extract the zip over the
repo folder again, overwriting when asked.

### b) Is Netlify building the right folder?

Netlify → **Site configuration → Build & deploy → Build settings**

- **Publish directory** must point at the folder that contains `index.html`.
  If your repo looks like `repo/site/index.html`, the publish directory is
  `site` — **not** blank, and not `/`.
- **Build command** should be empty. There is nothing to build; these are plain
  files.

A wrong publish directory is the single most common cause of "I pushed but
nothing changed".

### c) Did the deploy succeed?

Netlify → **Deploys**. The newest entry must say **Published**, and its
timestamp must be after your push.

- **Failed** → click it and read the log.
- **No new deploy at all** → Netlify is not connected to the branch you pushed.
  Check **Build & deploy → Branches → Production branch** matches your branch
  (usually `main`).

### d) Clear the CDN cache

Netlify → **Deploys → Trigger deploy → Clear cache and deploy site**.

## Step 3 — it is your browser cache

Very common, and it looks exactly like a failed deploy.

- **Hard reload:** Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
- **Or** open the site in a **private / incognito window** — this bypasses the
  cache completely and is the fastest honest test
- **On your phone:** Settings → Safari → Clear History and Website Data

Always check in incognito before concluding a deploy failed.

---

# The Netlify domain

## Renaming `yardsaletest.netlify.app`

You can change it whenever you like:

**Site configuration → Site details → Change site name**

Type e.g. `oldescondidoyardsale` and it becomes
`oldescondidoyardsale.netlify.app`. The old name stops working immediately, so
do not print it on anything.

## Pointing `oldescondidoyardsale.com` at this site

The `.netlify.app` address is only a staging URL. Your real domain is the one
that goes on the door hangers.

1. Netlify → **Domain management → Add a domain**
2. Enter `oldescondidoyardsale.com` → **Verify** → **Add domain**
3. Netlify shows you nameservers, e.g.
   `dns1.p01.nsone.net`, `dns2.p01.nsone.net`, …
4. Go to wherever you bought the domain (GoDaddy, Namecheap, Google Domains) and
   replace its nameservers with those
5. Wait — usually 15 minutes to a few hours, occasionally 24
6. Back in Netlify, confirm **HTTPS** shows a Let's Encrypt certificate. It is
   automatic; if it stalls, click **Renew certificate**

Then set the primary domain: **Domain management** → next to
`oldescondidoyardsale.com` → **Options → Set as primary domain**. Netlify will
redirect the `.netlify.app` address to it.

> **Important for your QR codes:** print only
> `oldescondidoyardsale.com`. Never print a `.netlify.app` URL — if you ever
> move hosts, every printed piece dies with it. The domain is yours; the host is
> replaceable.

---

# The form: Sheet fills, but no confirmation shown

## What was happening

Your screenshot told the whole story: the row **was** reaching the Sheet, but the
page showed *"That didn't go through."*

The form sends to two places:

| Destination | What it is |
| --- | --- |
| **Google Sheet** (Apps Script) | Your working spreadsheet |
| **Netlify Forms** | A backup copy in the Netlify dashboard |

The page was waiting on the **Netlify** response before showing the thank-you.
Netlify only accepts that POST once it has *detected* the form at deploy time —
and on your site detection is off, so it returned 404 and the page reported a
failure. Meanwhile the Sheet had already saved the registration.

**Waiting on the wrong one.** Now fixed.

## What it does now

The page waits on the **Google Sheet** request — the one that works. Netlify is
sent a copy in the background and can never block or fail the submission.

After this deploy: submit the form, and you go straight to the thank-you page
while the row lands in the Sheet.

## Optional: turn the Netlify backup on

Nice to have, not required — it gives you a second copy and email alerts.

1. Netlify → **Site configuration → Forms** → enable **form detection**
2. Redeploy (**Deploys → Trigger deploy → Deploy site**)
3. **Forms → registration** should now list submissions
4. **Forms → Form notifications → Add notification → Email notification** →
   `GarageSaleOldEscondido@gmail.com`

---

# "Registration done" email is not arriving

This is a separate thing, and nothing is broken — **the site never sends email.**
It writes to your Sheet. Nothing has ever been configured to send a confirmation.

Two different emails are worth setting up:

### A) Alert *you* on every registration

Easiest route is the Netlify notification above. If you would rather have it come
from the Sheet: open the Sheet → **Tools → Notification settings → Edit
notifications** → *Any changes are made* → *Email – right away*.

### B) Confirmation to the *neighbour*

This needs a few lines in your Apps Script. Add this function to `Code.gs`:

```js
function sendConfirmation_(data) {
  if (!data.email) return;
  MailApp.sendEmail({
    to: data.email,
    subject: "You're on the map — Old Escondido Yard Sale, Oct 10",
    body:
      "Hi " + (data.first || "neighbour") + ",\n\n" +
      "You're registered for the Old Escondido Community Yard Sale.\n\n" +
      "  Address:  " + (data.street || "") + "\n" +
      "  Date:     Saturday, October 10\n" +
      "  Hours:    7:30 AM - 1:00 PM\n\n" +
      "Your yard sign will be ready the week of the sale — we'll email you " +
      "where and when to pick it up.\n\n" +
      "Printed maps are free at the top of 6th Ave, 6:30-8:30 AM on the day.\n\n" +
      "Questions? Just reply to this email.\n\n" +
      "— Old Escondido Community Yard Sale\n" +
      "Hosted by Andrea Zeman Homes"
  });
}
```

Then call it from `doPost`, immediately before the `return`:

```js
try { sendConfirmation_(data); } catch (err) { console.error(err); }
```

The `try` matters: if the email fails, the registration must still be saved.

Save, then **Deploy → Manage deployments → pencil → Version: New version →
Deploy**. The first send will ask you to authorise Gmail — accept it.

> Gmail allows 100 emails a day on a free account, which is far more than this
> event needs.
