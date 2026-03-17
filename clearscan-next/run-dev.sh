#!/bin/bash
# Finds Node/npm and runs the app (works even when "npm" is not in your PATH).

cd "$(dirname "$0")"

# Try to find npm (common Mac locations + nvm/fnm)
NPM=""
for candidate in \
  "/opt/homebrew/bin/npm" \
  "/usr/local/bin/npm" \
  "$HOME/.nvm/versions/node/"*"/bin/npm" \
  "$HOME/.fnm/node-versions/"*"/installation/bin/npm"; do
  if [ -x "$candidate" ] 2>/dev/null; then
    NPM="$candidate"
    break
  fi
done

# If still not found, try loading nvm then fnm
if [ -z "$NPM" ] && [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
  NPM="$(command -v npm 2>/dev/null)"
fi
if [ -z "$NPM" ] && [ -s "$HOME/.fnm/fnm" ]; then
  eval "$("$HOME/.fnm/fnm" env)"
  NPM="$(command -v npm 2>/dev/null)"
fi
if [ -z "$NPM" ]; then
  export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
  NPM="$(command -v npm 2>/dev/null)"
fi

if [ -z "$NPM" ]; then
  echo "Node/npm not found. Install Node from https://nodejs.org (LTS), then run this script again."
  echo "Or install Homebrew (https://brew.sh) and run: brew install node"
  exit 1
fi

# Ensure node is on PATH when npm runs (e.g. nvm installs)
NODE_BIN="$(dirname "$NPM")"
export PATH="$NODE_BIN:$PATH"

echo "Using: $NPM"
echo "Installing dependencies..."
"$NPM" install
echo "Starting dev server — open http://localhost:3000 when you see 'Ready'"
echo ""
"$NPM" run dev
