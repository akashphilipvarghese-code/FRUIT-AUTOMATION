# ClearScan AI — High-Tech Lens (Next.js)

Mobile-responsive landing for **Fruit Quality Comparison**: camera capture, laser scanning animation, and side-by-side comparison with your dataset.

## Run (from project root)

If you see **`command not found: npm`**, install Node.js first — see **[SETUP-NODE.md](./SETUP-NODE.md)**.

```bash
# Option A: One script (starts backend + frontend)
./run_clearscan.sh

# Option B: Two terminals
# Terminal 1:
cd backend && pip install -r requirements.txt && python main.py
# Terminal 2:
cd clearscan-next && npm install && npm run dev
```

Then open **http://localhost:3000**. If the page doesn’t load, ensure both backend (8000) and frontend (3000) are running and try a hard refresh (Cmd+Shift+R).

## Stack

- **Next.js 14** (App Router) + **Tailwind CSS**
- **Theme:** Black `#000000` and Orange `#FF8C00` (industrial)
- **Icons:** Lucide (Scan, History, Admin, Settings)
- **Camera:** `navigator.mediaDevices.getUserMedia` with `facingMode: "environment"` (back camera on phone)

## Run

```bash
cd clearscan-next
npm install
npm run dev
```

Open http://localhost:3000. For `/compare` to work, run the FruityVisionAI backend (see main README) and export dataset features first.

## API

The app POSTs the captured image to `/api/compare`, which is rewired to `http://localhost:8000/compare` when the backend runs locally. To use another host, set `NEXT_PUBLIC_API_URL` and call that URL from the client instead of `/api/compare`.
