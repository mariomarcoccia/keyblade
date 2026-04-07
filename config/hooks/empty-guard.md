# Empty Guard Hook

PostToolUse guard for AskUserQuestion responses.

## Purpose

Rejects empty or blank responses from AskUserQuestion.
Forces the user to provide meaningful input.

## Behavior

1. After AskUserQuestion tool returns
2. Check if the answer is empty, blank, or whitespace-only
3. If empty: inject warning "Empty response detected. Please provide a meaningful answer."
4. Repeat the question

## Rationale

Empty responses lead to ambiguous behavior. The agent should never proceed
with an empty user answer - it indicates the user accidentally submitted
or doesn't understand what's being asked.
