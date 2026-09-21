# How to deploy on Netlify

Drag-and-drop deploy, no Git needed.

1. Unzip the download. You get a folder called **`site`** containing
   `index.html`, `map.html`, `thanks.html`, `site.css`, `vercel.json`,
   `README.md`, `google-apps-script.gs` and an **`assets`** folder.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag the **whole `site` folder** onto the drop zone — the folder itself, not
   the files inside it, and not the `.zip`.
4. Netlify gives you a `random-name.netlify.app` URL straight away.
5. **Site configuration → Domain management → Add a domain** →
   `oldescondidoyardsale.com`, then follow Netlify's DNS instructions at your
   registrar. HTTPS is issued automatically.

## If images are missing after deploying

That means the `assets` folder didn't come along. Every image sits directly in
`assets/` with no sub-folders, so this is almost always one of:

- You dragged the individual files instead of the folder → re-drag the folder
- You dragged the `.zip` instead of the unzipped folder → unzip first
- Your unzip tool skipped a folder → unzip again and confirm `site/assets`
  contains 17 `.png` files before dragging

Check what actually deployed: open your site URL and add `/assets/logo.png` to
it. If you get a 404, the folder is missing.

## Updating the site later

Netlify site → **Deploys** tab → drag the updated `site` folder onto the drop
zone at the bottom. It replaces the live version.

## Swapping to the map on October 8

Rename the files inside `site` before you drag it in:

1. `index.html` → `register.html`
2. `map.html` → `index.html`

Re-drag the folder. The printed QR codes keep working — same URL.

## Netlify vs Vercel

`vercel.json` in this folder is only used by Vercel. Netlify ignores it and
serves the files as they are, which is all this site needs. You can leave it or
delete it.
