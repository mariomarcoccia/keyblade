# /resolve - Bug Resolution

Lifecycle: `INVESTIGATING -> DIAGNOSED -> FIXING -> VERIFIED -> DONE`

## Stack Awareness
Read `.keyblade/config.json` to determine test commands, build tools, and language-specific debugging.

## Algorithm

1. Investigate: reproduce the bug, gather context
2. Diagnose: identify root cause, not symptoms
3. Fix: minimal change that resolves the issue
4. Verify: existing tests pass + new test for the bug
5. Document: what caused it, how it was fixed

## Rules
- Never fix symptoms - find the root cause
- Every fix must include a regression test
- Preserve existing functionality
- Conventional commit: `fix(scope): description`
