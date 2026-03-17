#!/bin/bash
# Start FruityVisionAI backend (with HybridFruitNet) and ClearScan Next.js app.

cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "=============================================="
echo "  FruityVision AI — Backend + ClearScan"
echo "=============================================="
echo ""

# 1) Start backend on 8000
echo "Starting backend on http://localhost:8000 ..."
cd backend
python3 -m pip install -r requirements.txt -q 2>/dev/null
python3 main.py &
BACKEND_PID=$!
cd ..

sleep 3
if kill -0 $BACKEND_PID 2>/dev/null; then
  echo "Backend running (PID $BACKEND_PID)"
else
  echo "Backend failed to start. Check: cd backend && python3 main.py"
fi

# 2) Start ClearScan Next.js if npm available
export PATH="/Users/apple/.nvm/versions/node/v24.14.0/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
if command -v npm &>/dev/null; then
  echo "Starting ClearScan Next.js on http://localhost:3000 ..."
  cd clearscan-next && ./run-dev.sh
else
  echo "npm not found. Backend only: open http://localhost:8000"
  wait $BACKEND_PID
fi
