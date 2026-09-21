# Fixing the form — read this first

Diagnosed against the live endpoint, **14 August 2026**.

## Good news: the permission fix worked

The Google sign-in wall is gone. Your endpoint now runs your script.

## What's wrong now

The endpoint returns:

```
ReferenceError: google is not defined  (line 1, file "Code")
```

Line 1 of your **Code.gs** is not JavaScript. Something else is sitting in that
file — almost certainly the **endpoint URL** (`https://script.google.com/...`)
pasted in by mistake, or the filename `google-apps-script.gs`, or the code got
pasted *underneath* some leftover text.

Apps Script executes every line of every file in the project. One stray word at
the top throws before `doPost` is ever reached, so nothing can be written.

## Fix it — 90 seconds

1. Open your Apps Script project
2. Click **`Code.gs`** in the left file list
3. Click inside the editor, press **Ctrl+A** (Windows) or **Cmd+A** (Mac) to
   select **everything**, then press **Delete**. The file must be completely
   empty.
4. Open `google-apps-script.gs` from this folder, select all of it, copy
5. Paste into the empty `Code.gs`
6. **Ctrl+S / Cmd+S** to save
7. **Deploy → Manage deployments → pencil → Version: New version → Deploy**

> Step 7 is not optional. Saving does **nothing** to the live URL — Apps Script
> keeps serving the old version until you publish a new one.

### Also: delete any extra files

If the left file list shows more than `Code.gs` — e.g. a second file where you
first pasted the script — **delete the extras**. Two copies of the same functions
in one project is its own error.

## Confirm it worked

Open your `/exec` URL in a **private / incognito window**. You should now see two
lines:

```
Old Escondido Yard Sale registration endpoint is live.
Connected to "<your sheet name>" → tab "Registrations". Rows so far: 0.
```

That second line is new — I added it so the URL tells you whether the script can
actually reach your Sheet. Read it carefully:

- **`Connected to "…"`** → everything is wired. Submit the form and the row will
  appear.
- **`NOT connected to a Sheet yet: …`** → the script is not attached to your
  Sheet. This happens if you created it at *script.google.com* instead of from
  inside the Sheet. Two ways out:
  - **Best:** open your Sheet → **Extensions → Apps Script** → paste the code
    there → deploy that one, and use its `/exec` URL.
  - **Or:** open your Sheet, copy the long id out of the URL
    (`docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`) and paste it into
    `SPREADSHEET_ID` at the top of `Code.gs`, then redeploy.
- **Any `ReferenceError` again** → step 3 did not fully clear the file.

Then run **`setup`** once from the function dropdown to create the headers.

---

## Meanwhile, nothing is being lost

The form writes to **two** places on every submission:

| Destination | Status | Purpose |
| --- | --- | --- |
| **Netlify Forms** | Working now, no setup | The capture that cannot fail |
| **Google Sheet** (Apps Script) | Needs the fix above | Your working spreadsheet |

The page only waits for Netlify, so registrations are being recorded **right
now** even with the Sheet broken.

**Go and look:** Netlify dashboard → your site → **Forms → registration**. Any
test submissions you have already made should be sitting there.

Turn on alerts so you never have to check manually: **Forms → Form notifications
→ Add notification → Email notification** → `GarageSaleOldEscondido@gmail.com`.

You can export that list as CSV and paste it into the Sheet whenever you like —
which means the Apps Script fix is a convenience, not a blocker for going live.

> **If Netlify shows no form at all:** it only detects forms when it deploys the
> HTML. Confirm **Site configuration → Forms → form detection** is **Enabled**,
> then redeploy.

---

## Still outstanding: the live site is out of date

Last time I checked `oldescondidoyardsale.com`:

1. **All 21 images under `assets/` returned 404.** The folder never reached the
   GitHub repo — that is why the logo and the animation are invisible (the
   sprites start at `opacity: 0` and only appear once the image loads).
2. **The HTML was an older build**, still showing content that has since been
   revised (the printed-map pickup point is now "Top of 6th Ave").

Push everything in this folder:

```
git add -A
git commit -m "Site: assets, form, map-live line"
git push
```

If the PNGs show under *Ignored files* in `git status --ignored`:

```
git add -f assets/
git commit -m "Force-add assets"
git push
```

**Verify before showing the client:** open
`https://oldescondidoyardsale.com/assets/logo.png` directly. You must see the
logo, not a 404.
