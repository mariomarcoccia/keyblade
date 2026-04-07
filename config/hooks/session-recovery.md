# Session Recovery Hook

SessionStart hook for detecting stalled workflows.

## Purpose

When a new session starts, detect if a previous /build or /resolve was interrupted.
Resume from where it left off using implementation-notes.md as context.

## Behavior

1. Check for active .workflow/build/*/spec.md with Status: BUILDING
2. If found, read implementation-notes.md for context
3. Resume the workflow by invoking the appropriate skill
4. Use next-action.md to determine the exact next step

## Stale Detection

A workflow is considered stalled if:
- Status is BUILDING or CERTIFYING
- Last modification was > 30 minutes ago
- No active session owns the workflow
