#!/bin/bash
# Stop hook: prevents the owning session from stopping while /build or /resolve is active.
# Derives next action from spec/diagnosis Status (source of truth), with next-action.md as override.
set -euo pipefail

INPUT=$(cat)

STOP_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
if [ "$STOP_ACTIVE" = "true" ]; then
  exit 0
fi

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
[ -z "$SESSION_ID" ] && exit 0

CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
[ -z "$CWD" ] && exit 0

# Derive next action from spec.md Status for /build workflows
derive_build_action() {
  local SPEC="$1" SLUG="$2"
  local STATUS
  STATUS=$(grep -m1 '^Status:' "$SPEC" 2>/dev/null | sed 's/^Status:[[:space:]]*//' || echo "")

  case "$STATUS" in
    UNDERSTOOD)
      echo "Continue /build Phase 2 (VERIFY) for slug $SLUG." ;;
    VERIFIED)
      echo "Continue /build Phase 3 (IMPLEMENT) for slug $SLUG." ;;
    BUILDING)
      echo "Continue /build Phase 3 (IMPLEMENT) for slug $SLUG." ;;
    CERTIFYING)
      echo "Continue /build Phase 4 (CERTIFY) for slug $SLUG." ;;
  esac
}

# Derive next action from diagnosis.md Status for /resolve workflows
derive_resolve_action() {
  local SPEC="$1" SLUG="$2"
  local STATUS
  STATUS=$(grep -m1 '^Status:' "$SPEC" 2>/dev/null | sed 's/^Status:[[:space:]]*//' || echo "")

  case "$STATUS" in
    DIAGNOSED)
      echo "Continue /resolve Phase 2 (VERIFY) for slug $SLUG." ;;
    VERIFIED)
      echo "Continue /resolve Phase 3 (FIX) for slug $SLUG." ;;
    FIXING)
      echo "Continue /resolve Phase 3 (FIX) for slug $SLUG." ;;
    CERTIFYING)
      echo "Continue /resolve Phase 4 (CERTIFY) for slug $SLUG." ;;
  esac
}

# Generic workflow checker for both /build and /resolve
check_workflow() {
  local TYPE="$1" SPEC_NAME="$2"

  for dir in "$CWD"/.workflow/$TYPE/*/; do
    [ -d "$dir" ] || continue
    local OWNER="$dir/.build-owner"

    # Only check workflows we own
    [ -f "$OWNER" ] && [ "$(cat "$OWNER" 2>/dev/null)" = "$SESSION_ID" ] || continue
    touch "$OWNER"

    local SLUG ACTION=""
    SLUG=$(basename "$dir")

    # Priority 1: next-action.md (explicit handoff from forked agent)
    local NA="$dir/next-action.md"
    if [ -f "$NA" ]; then
      ACTION=$(head -1 "$NA" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
    fi

    # Priority 2: derive from spec/diagnosis Status
    if [ -z "$ACTION" ]; then
      local SPEC="$dir/$SPEC_NAME"
      if [ -f "$SPEC" ]; then
        case "$TYPE" in
          build)   ACTION=$(derive_build_action "$SPEC" "$SLUG") ;;
          resolve) ACTION=$(derive_resolve_action "$SPEC" "$SLUG") ;;
        esac
      fi
    fi

    # Block if action found
    if [ -n "$ACTION" ]; then
      echo "STOP BLOCKED -- Execute immediately: $ACTION"
      exit 2
    fi

    # No action = terminal state (DONE/CANCELLED/VERIFIED_PROD), clean up
    rm -f "$OWNER"
  done
}

check_workflow "build" "spec.md"
check_workflow "resolve" "diagnosis.md"

exit 0
