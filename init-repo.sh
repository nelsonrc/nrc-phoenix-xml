#!/bin/bash

# === Usage: ./init-repo.sh "nrc-phoenix-xml" "Initial commit message" ===

REPO_NAME=$1
COMMIT_MSG=${2:-"Initial commit"}
USERNAME=$(gh api user --jq .login)

if [[ -z "$REPO_NAME" ]]; then
  echo "❌ Repo name required. Usage: ./init-repo.sh <name> [commit message]"
  exit 1
fi

# Ensure GitHub CLI is installed
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) not found. Install it: https://cli.github.com/"
  exit 1
fi

# Step 1: Check if .git exists
if [ ! -d .git ]; then
  echo "📂 Initializing local Git repo..."
  git init
fi

# Step 2: Stage and commit
git add .
git commit -m "$COMMIT_MSG" || echo "📝 Nothing new to commit."

# Step 3: Check if remote exists locally
if git remote get-url origin &> /dev/null; then
  echo "🔗 Remote 'origin' already set."
else
  # Step 4: Check if GitHub repo exists
  if gh repo view "$USERNAME/$REPO_NAME" &> /dev/null; then
    echo "✅ GitHub repo '$REPO_NAME' already exists. Linking to local repo..."
    git remote add origin "https://github.com/$USERNAME/$REPO_NAME.git"
  else
    echo "🚀 Creating GitHub repo '$REPO_NAME'..."
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
  fi
fi

# Step 5: Push to remote
git branch -M main
git push -u origin main

echo "🎉 Repo '$REPO_NAME' is live and ready!"
