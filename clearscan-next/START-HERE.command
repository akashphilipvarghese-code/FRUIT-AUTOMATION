#!/bin/bash
# Double-click this file (or run in Terminal) to install Node and start ClearScan.

cd "$(dirname "$0")"

# Find npm even if not in PATH (check common install locations first)
if [ -x "/opt/homebrew/bin/npm" ]; then
  export PATH="/opt/homebrew/bin:$PATH"
elif [ -x "/usr/local/bin/npm" ]; then
  export PATH="/usr/local/bin:$PATH"
fi
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
[ -s "$HOME/.fnm/fnm" ] && eval "$("$HOME/.fnm/fnm" env)"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "=========================================="
echo "  ClearScan AI — Starting..."
echo "=========================================="
echo ""

if ! command -v node &>/dev/null; then
  echo "Node.js not found. Installing via Homebrew..."
  if command -v brew &>/dev/null; then
    brew install node
    export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
  else
    echo ""
    echo "Homebrew not found. Install Node manually:"
    echo "  1. Open https://nodejs.org"
    echo "  2. Download the LTS version and run the installer"
    echo "  3. Then double-click this file again."
    echo ""
    read -p "Press Enter to close..."
    exit 1
  fi
fi

echo "Node version: $(node -v)"
echo ""

# Use run-dev.sh so we use the same npm that we found
exec ./run-dev.sh
