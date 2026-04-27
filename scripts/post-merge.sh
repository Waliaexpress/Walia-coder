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

MAX_ATTEMPTS=3
RETRY_DELAY=5
PUSH_EXIT=0
PUSH_OUTPUT=""

is_permanent_failure() {
  local output="$1"
  echo "$output" | grep -qiE \
    "authentication failed|could not read username|invalid username or password|permission denied|repository not found|not found|denied to|\[rejected\].*non-fast-forward" \
    && return 0 || return 1
}

for attempt in $(seq 1 $MAX_ATTEMPTS); do
  echo "GitHub push attempt $attempt/$MAX_ATTEMPTS..."
  set +e
  PUSH_OUTPUT=$(git push "https://oauth2:${EFFECTIVE_TOKEN}@github.com/Waliaexpress/Walia-coder.git" HEAD:claude/ai-developer-platform-ImVIP 2>&1)
  PUSH_EXIT=$?
  set -e

  if [ $PUSH_EXIT -eq 0 ]; then
    break
  fi

  echo "Push attempt $attempt/$MAX_ATTEMPTS failed (exit code $PUSH_EXIT)." >&2
  echo "Push output: $PUSH_OUTPUT" >&2

  if is_permanent_failure "$PUSH_OUTPUT"; then
    echo "Permanent failure detected — not retrying." >&2
    break
  fi

  if [ $attempt -lt $MAX_ATTEMPTS ]; then
    echo "Retrying in ${RETRY_DELAY}s..." >&2
    sleep $RETRY_DELAY
    RETRY_DELAY=$((RETRY_DELAY * 2))
  fi
done

if [ $PUSH_EXIT -ne 0 ]; then
  echo "WARNING: GitHub push failed after $MAX_ATTEMPTS attempt(s) (exit code $PUSH_EXIT) — merge will proceed." >&2
  jq -n --arg ts "$TIMESTAMP" --argjson code "$PUSH_EXIT" --arg reason "$PUSH_OUTPUT" \
    '{"status":"failed","exitCode":$code,"reason":$reason,"timestamp":$ts}' \
    > "$GITHUB_SYNC_STATUS_FILE"
  exit 0
fi

echo "GitHub push complete."
jq -n --arg ts "$TIMESTAMP" '{"status":"success","timestamp":$ts}' > "$GITHUB_SYNC_STATUS_FILE"
