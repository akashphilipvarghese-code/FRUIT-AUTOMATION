#!/bin/bash
# Run the ClearScan React frontend (code you provided)
cd "$(dirname "$0")"
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi
echo "Starting dev server..."
npm run dev
