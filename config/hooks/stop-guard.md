# Stop Guard Hook

Stop hook that prevents premature session termination.

## Purpose

Prevents the agent from stopping while a /build or /resolve workflow is active.
Ensures verify.sh passes before allowing stop.

## Behavior

1. Check if an active workflow exists (Status: BUILDING)
2. If active, check if verify.sh passes
3. If verify.sh fails, inject: "Cannot stop - verify.sh failing. Fix issues first."
4. If no active workflow, allow stop

## For build-implementer

Additionally checks:
- v4-passed marker exists (if V4+ tests in spec)
- implementation-notes.md is written
- next-action.md is written
