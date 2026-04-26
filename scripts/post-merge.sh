#!/bin/bash
set -e

pnpm install --frozen-lockfile
pnpm --filter db push

GITHUB_SYNC_STATUS_FILE=".github-sync-status"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: GITHUB_TOKEN not set — GitHub push skipped. Set the GITHUB_TOKEN secret to enable automatic sync." >&2
  jq -n --arg ts "$TIMESTAMP" \
    '{"status":"skipped","reason":"GITHUB_TOKEN not set","timestamp":$ts}' \
    > "$GITHUB_SYNC_STATUS_FILE"
  exit 1
fi

echo "Pushing to GitHub branch claude/ai-developer-platform-ImVIP..."

set +e
PUSH_OUTPUT=$(git -c "credential.helper=!f() { echo username=oauth2; echo password=\$GITHUB_TOKEN; }; f" \
  push https://github.com/Waliaexpress/Walia-coder.git HEAD:claude/ai-developer-platform-ImVIP 2>&1)
PUSH_EXIT=$?
set -e

if [ $PUSH_EXIT -ne 0 ]; then
  echo "ERROR: GitHub push failed (exit code $PUSH_EXIT)." >&2
  echo "Push output: $PUSH_OUTPUT" >&2
  jq -n --arg ts "$TIMESTAMP" --argjson code "$PUSH_EXIT" --arg reason "$PUSH_OUTPUT" \
    '{"status":"failed","exitCode":$code,"reason":$reason,"timestamp":$ts}' \
    > "$GITHUB_SYNC_STATUS_FILE"
  exit $PUSH_EXIT
fi

echo "GitHub push complete."
jq -n --arg ts "$TIMESTAMP" '{"status":"success","timestamp":$ts}' > "$GITHUB_SYNC_STATUS_FILE"
