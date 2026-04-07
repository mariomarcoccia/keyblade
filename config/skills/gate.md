# /gate - Quality Gate

Pre-push validation: current changes vs origin/main.

## Stack Awareness
Read `.keyblade/config.json` to determine which checks to run (lint, type-check, test, build).

## Algorithm

1. Load project context from `.keyblade/config.json`
2. Test Coverage Gate (BLOCKING): every modified service/util must have tests
3. Run agents in sequence:
   - code-reviewer (security, types, bugs)
   - commit-guardian (conventional commits, max 300 lines)
   - pr-hygiene (PR description, linked issues)
   - functional-validator (runtime behavior)
4. Report: PASS or FAIL with details

## Agents Orchestration
Each agent runs independently and reports:
- STATUS: PASS | FAIL
- ISSUES_FOUND: n
- BLOCKING: true | false

Gate passes only when all BLOCKING agents pass.
