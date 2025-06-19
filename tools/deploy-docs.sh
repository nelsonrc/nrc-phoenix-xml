#!/bin/bash

set -e

# 👤 GitHub context
USERNAME=$(gh api user --jq .login)
REPO_NAME=$(basename -s .git "$(git config --get remote.origin.url)")
CURRENT_BRANCH=$(git branch --show-current)

# 🧪 Step 1: Generate docs into a temp directory
TEMP_DIR=$(mktemp -d)
echo "📚 Generating docs to temp dir: $TEMP_DIR"
npx typedoc --out "$TEMP_DIR"

# 🌱 Step 2: Ensure gh-pages exists remotely
if ! git ls-remote --exit-code --heads origin gh-pages &> /dev/null; then
  echo "🌿 Creating gh-pages branch..."
  git checkout --orphan gh-pages
  git reset --hard
  echo "<h1>Initializing GitHub Pages</h1>" > index.html
  git add .
  git commit -m "Initialize gh-pages"
  git push origin gh-pages
  git checkout "$CURRENT_BRANCH"
fi

# 🚀 Step 3: Switch to gh-pages and deploy
echo "📦 Deploying docs to gh-pages..."
git checkout gh-pages
git reset --hard
rm -rf *
cp -r "$TEMP_DIR"/. ./
touch .nojekyll
git add .
git commit -m "📘 Update documentation"
git push origin gh-pages

# 🔁 Step 4: Switch back to working branch
git checkout "$CURRENT_BRANCH"

# 🌐 Step 5: Enable Pages (if not already)
echo "🌐 Activating GitHub Pages if needed..."
gh api repos/${USERNAME}/${REPO_NAME}/pages \
  --method POST \
  --header "Accept: application/vnd.github+json" \
  --input - <<EOF || echo "✅ GitHub Pages already active."
{
  "source": {
    "branch": "gh-pages",
    "path": "/"
  }
}
EOF

echo "✅ Docs deployed to: https://${USERNAME}.github.io/${REPO_NAME}/"
