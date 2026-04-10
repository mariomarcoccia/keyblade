#!/bin/bash
# PostToolUse hook for Skill: injects continuation instructions after build/resolve sub-skills.
# Prevents the LLM from "narrating" between sub-skill transitions.
set -euo pipefail

INPUT=$(cat)

SKILL=$(echo "$INPUT" | jq -r '.tool_input.skill // empty')

# Only process build/resolve sub-skills
TYPE=""
case "$SKILL" in
  build-understand|build-verify|build-implement|build-certify)
    TYPE="build" ;;
  resolve-investigate|resolve-verify|resolve-fix|resolve-certify)
    TYPE="resolve" ;;
  *)
    exit 0 ;;
esac

# Terminal state guard: don't inject for completed workflows
RESPONSE=$(echo "$INPUT" | jq -r '.tool_response // empty')
if echo "$RESPONSE" | grep -qE '(^DONE:|VERIFIED_PROD|CANCELLED)'; then
  exit 0
fi

CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
ARGS=$(echo "$INPUT" | jq -r '.tool_input.args // empty')
SLUG=$(echo "$ARGS" | awk '{print $1}')

# Need slug to scope to correct directory
if [ -z "$CWD" ] || [ -z "$SLUG" ]; then
  exit 0
fi

# Session ownership check
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
OWNER_FILE="$CWD/.workflow/$TYPE/$SLUG/.build-owner"

if [ ! -f "$OWNER_FILE" ] || [ "$(cat "$OWNER_FILE" 2>/dev/null)" != "$SESSION_ID" ]; then
  exit 0
fi

# Compute next action
NEXT=""
case "$SKILL" in
  build-understand)
    NEXT="Proceed to Phase 2 (VERIFY)." ;;
  build-verify)
    NEXT="Set Status to BUILDING, proceed to Phase 3 (IMPLEMENT)." ;;
  build-implement)
    NEXT="Proceed to Phase 4 (CERTIFY)." ;;
  build-certify)
    NEXT="Read spec Status and proceed per the algorithm." ;;
  resolve-investigate)
    NEXT="Proceed to the next phase per the /resolve algorithm." ;;
  resolve-verify)
    NEXT="Set Status to FIXING, proceed to Phase 3 (FIX)." ;;
  resolve-fix)
    NEXT="Proceed to Phase 4 (CERTIFY)." ;;
  resolve-certify)
    NEXT="Read Status and proceed per the algorithm." ;;
esac

[ -z "$NEXT" ] && NEXT="Proceed to the next phase per the orchestrator algorithm."

jq -n --arg ctx "CONTINUITY ENFORCEMENT: Your ONLY next action must be a tool call. Do NOT output text to the user. $NEXT" \
  '{"hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": $ctx}}'
