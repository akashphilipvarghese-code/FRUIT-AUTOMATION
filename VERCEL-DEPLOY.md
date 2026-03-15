# Deploy ClearScan to Vercel

## Required: Set Root Directory

The app **must** be built from the `clearscan-app` folder. In Vercel:

1. **Settings** → **General** → **Root Directory**
2. Enter **`clearscan-app`** and click **Save**.
3. **Build & Development** (optional):
   - **Framework Preset**: **Vite**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Deployments** → **Redeploy** the latest deployment.

There is no root `vercel.json`; Vercel uses `clearscan-app/vercel.json` when Root Directory is set to `clearscan-app`. Node version is set by `clearscan-app/.nvmrc` (20).
