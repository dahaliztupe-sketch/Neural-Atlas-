#!/usr/bin/env bash
set -euo pipefail

# Neural Atlas — Documentation Backup & GitHub Main Branch Sync
REMOTE_URL="${GITHUB_REMOTE_URL:-https://github.com/dahaliztupe-sketch/neural-atlas.git}"
TARGET_BRANCH="${GITHUB_BRANCH:-main}"
COMMIT_MSG="${1:-chore: sync Neural Atlas updates and documentation}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR=".backups"
BACKUP_FILE="${BACKUP_DIR}/docs-${TIMESTAMP}.tar.gz"

echo "==> 1. Creating timestamped backup of project documentation..."
mkdir -p "${BACKUP_DIR}"
DOC_TARGETS=()
for item in README.md CHANGELOG.md SECURITY.md CONTRIBUTING.md CODE_OF_CONDUCT.md docs; do
  if [ -e "${item}" ]; then
    DOC_TARGETS+=("${item}")
  fi
done

if [ "${#DOC_TARGETS[@]}" -gt 0 ]; then
  tar -czf "${BACKUP_FILE}" "${DOC_TARGETS[@]}"
  echo "Documentation backup saved to ${BACKUP_FILE}"
else
  echo "Warning: No documentation targets found to back up."
fi

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

echo "==> 3. Staging changes..."
git add -A

if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  echo "Committing staged changes: ${COMMIT_MSG}"
  git commit -m "${COMMIT_MSG}"
fi

echo "==> 4. Pushing to ${TARGET_BRANCH} on origin..."
git push -u origin "${TARGET_BRANCH}"
echo "Sync complete."
