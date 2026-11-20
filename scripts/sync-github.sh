#!/usr/bin/env bash
set -euo pipefail

# Neural Atlas — Verified Pre-Flight & GitHub Repository Sync Helper
# Target repository: https://github.com/dahaliztupe-sketch/neural-atlas.git

REMOTE_URL="${GITHUB_REMOTE_URL:-https://github.com/dahaliztupe-sketch/neural-atlas.git}"
TARGET_BRANCH="${GITHUB_BRANCH:-main}"
COMMIT_MSG="${1:-chore: sync CS50x Week 3, LOCAL AI AGENT archived status, and docs}"

echo "==> 1. Running verification checks before Git sync..."
npm run lint
npm run lint:rules
npm test
npm run build

echo "==> 2. Checking Git repository state..."
if [ ! -d ".git" ]; then
  echo "Initializing local Git repository on branch '${TARGET_BRANCH}'..."
  git init -b "${TARGET_BRANCH}"
fi

CURRENT_BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo "${TARGET_BRANCH}")"
if [ "${CURRENT_BRANCH}" != "${TARGET_BRANCH}" ]; then
  git checkout -B "${TARGET_BRANCH}"
fi

if git remote get-url origin >/dev/null 2>&1; then
  EXISTING_ORIGIN="$(git remote get-url origin)"
  if [ "${EXISTING_ORIGIN}" != "${REMOTE_URL}" ]; then
    echo "Updating remote 'origin' -> ${REMOTE_URL}"
    git remote set-url origin "${REMOTE_URL}"
  fi
else
  echo "Adding remote 'origin' -> ${REMOTE_URL}"
  git remote add origin "${REMOTE_URL}"
fi

echo "==> 3. Fetching remote branch history (if reachable)..."
if git ls-remote --exit-code --heads origin "${TARGET_BRANCH}" >/dev/null 2>&1; then
  git fetch origin "${TARGET_BRANCH}"
  if ! git merge-base HEAD "origin/${TARGET_BRANCH}" >/dev/null 2>&1; then
    echo "Notice: Local repository has no shared history with origin/${TARGET_BRANCH}."
    echo "Review remote commits carefully, or run:"
    echo "  git pull origin ${TARGET_BRANCH} --allow-unrelated-histories"
    echo "before pushing if you want to merge existing remote commits."
  fi
fi

echo "==> 4. Staging project files (respecting .gitignore; .env* and secrets excluded)..."
git add -A

if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  echo "Creating commit: ${COMMIT_MSG}"
  git commit -m "${COMMIT_MSG}"
fi

echo "==> 5. Pushing branch '${TARGET_BRANCH}' to origin..."
git push -u origin "${TARGET_BRANCH}"
echo "GitHub sync complete."
