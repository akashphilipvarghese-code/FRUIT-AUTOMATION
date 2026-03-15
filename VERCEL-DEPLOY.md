# Deploy ClearScan to Vercel (fix 404)

## Recommended: Use Root Directory

1. **Vercel Dashboard** → your project → **Settings** → **General**.
2. **Root Directory**: set to **`clearscan-app`** (type it, then Save).
3. **Build & Development** (Settings):
   - **Framework Preset**: **Vite** (or "Other").
   - **Build Command**: `npm run build` (or leave default).
   - **Output Directory**: `dist` (or leave default).
4. **Redeploy**: Deployments tab → ⋮ on latest → **Redeploy**.

Then remove the repo-root `vercel.json` so only `clearscan-app/vercel.json` is used:

```bash
rm vercel.json
git add -A && git commit -m "chore: use Root Directory clearscan-app only" && git push
```

---

## Alternative: Deploy from repo root

If you prefer not to set Root Directory, keep the root `vercel.json` (it has `installCommand` and `buildCommand` pointing into `clearscan-app`). Ensure **Root Directory** in Vercel is empty so the repo root is used, then redeploy.
