#!/bin/bash
# One-time: add the SSH key (see GITHUB-PUSH-SETUP.md), then run this to push.
set -e
cd "$(dirname "$0")"
KEY_PUB="$HOME/.ssh/id_ed25519_github_fruit.pub"
if [ -f "$KEY_PUB" ]; then
  echo "Your SSH public key (add at https://github.com/settings/ssh/new):"
  echo ""
  cat "$KEY_PUB"
  echo ""
  echo "Opening GitHub 'Add SSH key' page in your browser..."
  open "https://github.com/settings/ssh/new" 2>/dev/null || true
fi
echo ""
echo "After adding the key above, press Enter to push."
read -r
git push -u origin main
echo "Done. Future pushes: git push"
