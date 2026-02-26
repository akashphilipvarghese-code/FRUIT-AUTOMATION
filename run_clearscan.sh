#!/bin/bash
# Run ClearScan AI: backend (port 8000) + frontend (port 3000)
# Usage: ./run_clearscan.sh   or   bash run_clearscan.sh

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "=== ClearScan AI ==="
echo ""

# Start backend in background
echo "[1/2] Starting backend on http://localhost:8000 ..."
cd backend
python3 -m pip install -r requirements.txt -q 2>/dev/null || true
python3 main.py &
BACKEND_PID=$!
cd "$ROOT"
sleep 2

# Start frontend
echo "[2/2] Starting frontend on http://localhost:3000 ..."
cd clearscan-next
if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies (first run)..."
  npm install
fi
npm run dev &
FRONTEND_PID=$!
cd "$ROOT"

echo ""
echo "Backend PID: $BACKEND_PID  |  Frontend PID: $FRONTEND_PID"
echo "Open: http://localhost:3000"
echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
echo ""

wait $FRONTEND_PID 2>/dev/null || true
kill $BACKEND_PID 2>/dev/null || true
