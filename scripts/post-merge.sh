#!/bin/bash
set -e

pnpm install --frozen-lockfile
pnpm --filter db push

GITHUB_SYNC_STATUS_FILE=".github-sync-status"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

EFFECTIVE_TOKEN="${GITHUB_TOKEN:-${GITHUB_PAT:-}}"

if [ -z "$EFFECTIVE_TOKEN" ]; then
  echo "WARNING: GITHUB_TOKEN not set — GitHub push skipped." >&2
  jq -n --arg ts "$TIMESTAMP" \
    '{"status":"skipped","reason":"GITHUB_TOKEN not set","timestamp":$ts}' \
    > "$GITHUB_SYNC_STATUS_FILE"
  exit 0
fi

echo "Pushing to GitHub branch claude/ai-developer-platform-ImVIP..."

set +e
PUSH_OUTPUT=$(git -c "credential.helper=!f() { echo username=oauth2; echo password=\$EFFECTIVE_TOKEN; }; f" \
  push https://github.com/Waliaexpress/Walia-coder.git HEAD:claude/ai-developer-platform-ImVIP 2>&1)
PUSH_EXIT=$?
set -e

if [ $PUSH_EXIT -ne 0 ]; then
  echo "WARNING: GitHub push failed (exit code $PUSH_EXIT) — merge will proceed." >&2
  echo "Push output: $PUSH_OUTPUT" >&2
  jq -n --arg ts "$TIMESTAMP" --argjson code "$PUSH_EXIT" --arg reason "$PUSH_OUTPUT" \
    '{"status":"failed","exitCode":$code,"reason":$reason,"timestamp":$ts}' \
    > "$GITHUB_SYNC_STATUS_FILE"
  exit 0
fi

echo "GitHub push complete."
jq -n --arg ts "$TIMESTAMP" '{"status":"success","timestamp":$ts}' > "$GITHUB_SYNC_STATUS_FILE"
