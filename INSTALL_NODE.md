# Install Node.js on macOS

You need Node.js (which includes npm) to install the mobile app dependencies.

## Option 1: Install via Homebrew (Recommended)

If you have Homebrew installed:

```bash
brew install node
```

To check if you have Homebrew:
```bash
brew --version
```

If that works, install Node.js with the command above.

## Option 2: Download from nodejs.org (Easiest)

1. Go to: https://nodejs.org/
2. Download the **LTS version** (Long Term Support - recommended)
3. Run the installer (.pkg file)
4. Follow the installation wizard
5. Restart your terminal after installation

## Option 3: Install via nvm (Node Version Manager)

If you want to manage multiple Node.js versions:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then install Node.js
nvm install --lts
nvm use --lts
```

## Verify Installation

After installing, restart your terminal and run:

```bash
node --version
npm --version
```

You should see version numbers (e.g., `v20.10.0` and `10.2.3`).

## Then Install Mobile Dependencies

Once Node.js is installed:

```bash
cd /Users/Courage/Desktop/Budgetplanner/apps/mobile
npm install
```

## Quick Check

Run this in your terminal to see if Node.js is already installed somewhere:

```bash
ls -la /usr/local/bin/node 2>/dev/null || ls -la /opt/homebrew/bin/node 2>/dev/null || echo "Node.js not found in common locations"
```
