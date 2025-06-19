#!/bin/bash

set -e

# 🧠 Get user/repo info
USERNAME=$(gh api user --jq .login)
REPO_URL=$(git config --get remote.origin.url)
REPO_NAME=$(basename -s .git "$REPO_URL")

# 📂 Save current working branch
CURRENT_BRANCH=$(git branch --show-current)

echo "📚 Rebuilding documentation..."
npm run docs

# 🌱 Ensure gh-pages branch exists
if ! git show-ref --quiet refs/remotes/origin/gh-pages; then
  echo "🌿 Creating gh-pages branch..."
  git checkout --orphan gh-pages
  git reset --hard
  echo "<h1>Initializing GitHub Pages</h1>" > index.html
  git add .
  git commit -m "Initialize gh-pages"
  git push origin gh-pages
  git checkout "$CURRENT_BRANCH"
fi

# 🚀 Deploy docs
echo "📦 Deploying to gh-pages..."

git checkout gh-pages
git reset --hard
rm -rf *
cp -r docs/* ./
touch .nojekyll

git add .
git commit -m "📘 Update documentation"
git push -f origin gh-pages

# 🔁 Return to original branch
git checkout "$CURRENT_BRANCH"

# 🌐 Enable Pages via GitHub API (if not already enabled)
echo "🌐 Ensuring GitHub Pages is enabled..."

gh api repos/${USERNAME}/${REPO_NAME}/pages \
  --method POST \
  --header "Accept: application/vnd.github+json" \
  --input - <<EOF || echo "✔️ GitHub Pages already