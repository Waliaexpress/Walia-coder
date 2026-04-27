#!/usr/bin/env bash
set -euo pipefail

REPO_HOST="github.com/Waliaexpress/Walia-coder.git"
TARGET_BRANCH="${1:-claude/ai-developer-platform-ImVIP}"

if [ -z "${GITHUB_PAT:-}" ]; then
  echo "Error: GITHUB_PAT environment variable is not set." >&2
  exit 1
fi

REMOTE_URL="https://${GITHUB_PAT}@${REPO_HOST}"

git push "$REMOTE_URL" "HEAD:${TARGET_BRANCH}"

echo "Successfully pushed HEAD to ${TARGET_BRANCH} on ${REPO_HOST}"
