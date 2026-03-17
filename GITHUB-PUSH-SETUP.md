# Push this repo to GitHub (one-time setup)

The project is already connected to **https://github.com/akashphilipvarghese-code/FRUIT-AUTOMATION**.  
You only need to add this SSH key to your GitHub account once.

## 1. Copy this public key (one line)

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBsnzaKjj/NYd8KtyISrZtdTn4Tb52hAgqLIOuytV6GJ fruit-automation
```

## 2. Add it on GitHub

- Open: **https://github.com/settings/ssh/new**
- **Title:** `Fruit Automation` (or any name)
- **Key:** Paste the line above
- Click **Add SSH key**

## 3. Push from your machine

```bash
cd /Users/apple/Desktop/FruityVisionAI
git push -u origin main
```

After that, future pushes: `git push`.
