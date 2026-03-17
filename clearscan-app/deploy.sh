#!/bin/bash
# Load your shell so Node/npm are available, then deploy to Vercel.

# Load nvm if you use it
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Load fnm if you use it
[ -s "$HOME/.local/share/fnm/fnm" ] && eval "$("$HOME/.local/share/fnm/fnm" env)"

# Add common Node locations to PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

cd "$(dirname "$0")"

if ! command -v npm &>/dev/null; then
  echo ""
  echo "Node.js is not installed or not in your PATH."
  echo ""
  echo "1. Install Node from https://nodejs.org (download LTS, run the .pkg)"
  echo "2. Restart Terminal/Cursor completely"
  echo "3. Run: ./deploy.sh"
  echo ""
  exit 1
fi

echo "Installing dependencies..."
npm install

echo "Deploying to Vercel..."
npm run deploy
