# ClearScan App (your exact frontend)

This is the **exact** React app you provided: same `App.tsx`, same imports (`./components/upload-zone`, `./components/clearscan-logo`, etc.), black/orange ClearScan UI with Upload → Scanning → Grade Result → History.

## Run

```bash
cd /Users/sid/Desktop/FruityVisionAI/clearscan-app
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Structure

- `src/App.tsx` — Your App (unchanged)
- `src/components/upload-zone.tsx`
- `src/components/scanning-animation.tsx`
- `src/components/grade-result.tsx` (exports `GradeResult` + `GradeData`)
- `src/components/grading-history.tsx`
- `src/components/clearscan-logo.tsx`
- `src/components/ui/button.tsx`
- `src/types/fruit-types.ts`
