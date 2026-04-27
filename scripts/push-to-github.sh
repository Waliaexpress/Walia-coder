#!/usr/bin/env bash
set -euo pipefail

# Target repository: set GITHUB_REPO to override (e.g. "myorg/my-fork").
# Defaults to the primary Walia-coder repo.
GITHUB_REPO="${GITHUB_REPO:-Waliaexpress/Walia-coder}"
REPO_HOST="github.com/${GITHUB_REPO}.git"

# Target branch: the positional argument takes precedence, then GITHUB_BRANCH,
# then the hard-coded fallback.
TARGET_BRANCH="${1:-${GITHUB_BRANCH:-claude/ai-developer-platform-ImVIP}}"

if [ -z "${GITHUB_PAT:-}" ]; then
  echo "Error: GITHUB_PAT environment variable is not set." >&2
  exit 1
fi

REMOTE_URL="https://${GITHUB_PAT}@${REPO_HOST}"

git push "$REMOTE_URL" "HEAD:${TARGET_BRANCH}"

echo "Successfully pushed HEAD to ${TARGET_BRANCH} on ${REPO_HOST}"
