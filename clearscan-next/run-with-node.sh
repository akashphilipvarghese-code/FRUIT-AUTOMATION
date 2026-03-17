#!/usr/bin/env bash
# Tries to find Node/npm and run the app (use this if "npm" is not found in your terminal).

export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/*/bin:$PATH"

if ! command -v npm &>/dev/null; then
  echo "Node/npm not found. Install Node first:"
  echo "  brew install node   (if you use Homebrew)"
  echo "  or download from https://nodejs.org"
  exit 1
fi

cd "$(dirname "$0")"
npm install && npm run dev
