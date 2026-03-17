#!/bin/bash
# Finds Node/npm and runs the FruityVision frontend (Customer / Industrialist / Admin / ClearScan).

cd "$(dirname "$0")"

for candidate in "/opt/homebrew/bin/npm" "/usr/local/bin/npm" "$HOME/.nvm/versions/node/"*"/bin/npm"; do
  if [ -x "$candidate" ] 2>/dev/null; then
    NPM="$candidate"
    break
  fi
done
[ -z "$NPM" ] && [ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" && NPM="$(command -v npm 2>/dev/null)"
[ -z "$NPM" ] && export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH" && NPM="$(command -v npm 2>/dev/null)"

if [ -z "$NPM" ]; then
  echo "Node/npm not found. Install from https://nodejs.org or run: brew install node"
  exit 1
fi
NODE_BIN="$(dirname "$NPM")"
export PATH="$NODE_BIN:$PATH"

echo "FruityVision frontend — installing deps and starting..."
"$NPM" install
echo "Open http://localhost:3000 when you see 'Ready'"
"$NPM" run dev
