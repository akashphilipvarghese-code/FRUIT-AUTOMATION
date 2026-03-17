# Node.js not found — fix "command not found: npm"

Your terminal can’t find `node` or `npm`. Install Node.js, then run the app.

**Quick path:** Install from **[https://nodejs.org](https://nodejs.org)** (LTS, green button) → run the installer → **quit and reopen Terminal** → then:

```bash
cd /Users/apple/Desktop/FruityVisionAI/clearscan-next
npm install
npm run dev
```

Then open **http://localhost:3000**. If you get "permission denied" on the script below, run `chmod +x run-with-node.sh` first.

**Alternative:** From the `clearscan-next` folder run `./run-with-node.sh` — it looks for Node in common Mac locations and runs the app. If that still says "not found", use the options below.

## Option 1: Homebrew (recommended on Mac)

```bash
# Install Homebrew if you don’t have it: https://brew.sh
brew install node
```

Then close and reopen your terminal, or run:

```bash
source ~/.zshrc
```

## Option 2: Official installer

1. Go to **https://nodejs.org**
2. Download the **LTS** version and run the installer
3. Restart your terminal (or open a new tab)

## Option 3: nvm (Node Version Manager)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Close and reopen terminal, then:
nvm install --lts
nvm use --lts
```

---

## After Node is installed

From the project root:

```bash
cd /Users/apple/Desktop/FruityVisionAI/clearscan-next
npm install
npm run dev
```

Then open **http://localhost:3000**. Sign in/sign up from the header to use Clerk.
