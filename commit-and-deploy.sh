#!/bin/bash

set -e

COMMIT_MSG=${1:-"🔧 Update and deploy docs"}

# 1️⃣ Stage and commit changes
echo "🗂️ Staging all changes..."
git add .
echo "📝 Committing with message: $COMMIT_MSG"
git commit -m "$COMMIT_MSG" || echo "✅ No new changes to commit."

# 2️⃣ Push to main
CURRENT_BRANCH=$(git branch --show-current)
echo "⬆️ Pushing to $CURRENT_BRANCH..."
git push origin "$CURRENT_BRANCH"

# 3️⃣ Build and deploy documentation
echo "📘 Deploying updated docs..."
./deploy-docs.sh

echo "🚀 All done!"
