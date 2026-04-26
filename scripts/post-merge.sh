#!/bin/bash
set -e

pnpm install --frozen-lockfile
pnpm --filter db push

if [ -n "$GITHUB_TOKEN" ]; then
  echo "Pushing to GitHub branch claude/ai-developer-platform-ImVIP..."
  git -c "credential.helper=!f() { echo username=oauth2; echo password=\$GITHUB_TOKEN; }; f" \
    push https://github.com/Waliaexpress/Walia-coder.git HEAD:claude/ai-developer-platform-ImVIP
  echo "GitHub push complete."
else
  echo "GITHUB_TOKEN not set — skipping GitHub push."
fi
