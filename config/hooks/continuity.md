# Continuity Hook

PostToolUse hook for Skill transitions.

## Purpose

Prevents the LLM from narrating between sub-skill transitions.
After a Skill() returns, the ONLY permitted action is the next tool call.

## Behavior

When a build/resolve sub-skill completes:
1. Read next-action.md for the next step
2. Execute immediately - no summarization, no narration
3. If no next-action.md exists, the workflow is complete

## Anti-Pattern

```
WRONG:
  Skill("build-understand") returns
  "Great! Now let me implement..." <- VIOLATION
  Skill("build-implement")

RIGHT:
  Skill("build-understand") returns
  Skill("build-implement")  <- Immediate next call
```
