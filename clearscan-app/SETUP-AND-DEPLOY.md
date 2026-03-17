# Fix "command not found" and deploy to Vercel

You need **Node.js** installed so `npx` works. Pick one option below.

---

## Option A: Install from nodejs.org (easiest)

1. Open **https://nodejs.org**
2. Download the **LTS** version (green button).
3. Run the installer and follow the steps.
4. **Quit and reopen Terminal** (or Cursor).
5. Then run:

```bash
cd /Users/apple/Desktop/FruityVisionAI/clearscan-app
npx vercel --yes
```

---

## Option B: Install with Homebrew (if you use brew)

In Terminal run:

```bash
brew install node
```

Then **quit and reopen Terminal** and run:

```bash
cd /Users/apple/Desktop/FruityVisionAI/clearscan-app
npx vercel --yes
```

---

## Option C: Install Homebrew first, then Node

If you don’t have Homebrew, install it from **https://brew.sh** (copy the command from that page into Terminal). After that, run the Homebrew commands from Option B.

---

## After Node is installed

From your project folder:

```bash
cd /Users/apple/Desktop/FruityVisionAI/clearscan-app
npx vercel --yes
```

First time you may be asked to log in to Vercel (it will open your browser). Then you’ll get a live URL for your app.

---

## If you see 404 NOT_FOUND after deploy

Your app lives in the **clearscan-app** folder. If Vercel is building from the **repo root** (e.g. FruityVisionAI), it won’t find the app and will show NOT_FOUND. Fix it in the dashboard:

1. Open **[Vercel Dashboard](https://vercel.com/dashboard)** → your project → **Settings**.
2. **Root Directory**
   - Click **Edit** next to Root Directory.
   - Set it to **`clearscan-app`** (no leading slash).
   - Save.
3. **Build & Development Settings**
   - **Framework Preset:** **Vite**.
   - **Build Command:** `npm run build` (or leave default).
   - **Output Directory:** **`dist`** (must be exactly this for Vite).
   - Save.
4. **Redeploy**
   - Go to **Deployments** → open the **⋯** menu on the latest deployment → **Redeploy**.
   - Turn on **Clear cache and redeploy** → **Redeploy**.

Use the **production URL** from the deployment (e.g. `https://your-project.vercel.app`). If you use a custom domain, add it in Settings → Domains.
