# Quality Gate

Complete code validation: **current changes** vs **origin/main**

**Mode:** Orchestrates specialized agents for comprehensive validation. Fixes problems automatically.

**Usage:** Run before push to main, or periodically to ensure quality.

---

## Context Loading (REQUIRED)

Load project context:
- Read `.keyblade/config.json` for stack information
- Read `CLAUDE.md` for project rules

---

## Phase 0: Test Coverage Gate (BLOCKING)

**This phase is BLOCKING. Validation does NOT pass without tests.**

### Check Coverage

```bash
# Identify modified code files (excluding tests)
git diff origin/main...HEAD --name-only | grep -E '\.(ts|tsx|js|jsx)$' | grep -v '\.test\.' | grep -v '\.d\.ts'
```

For each file in `services/`, `utils/`, `api/`:
- Corresponding `.test.` file MUST exist
- If missing: create test file with basic coverage

---

## Phase 1: Agent Orchestration

Run agents in sequence:

1. **test-fixer** (BLOCKING) — Run tests, fix failures, create missing tests (baseline)
2. **code-simplifier** (non-blocking) — Clarity, DRY, patterns
3. **performance-reviewer** (non-blocking, unless CRITICAL_PERF) — N+1 queries, unbounded loads
4. **code-reviewer** with scope flags (BLOCKING) — Security, typing, bugs

   Compute scope flags:
   ```bash
   CHANGED=$(git diff origin/main...HEAD --name-only)
   # SCOPE_AUTH if auth/jwt/session files changed
   # SCOPE_API if routes/api/controllers files changed
   # SCOPE_MIGRATIONS if migration/schema files changed
   ```

5. **red-team** (BLOCKING) — Pass code-reviewer findings, adversarial review
6. **test-auditor** (BLOCKING if critical path has zero tests) — Coverage + quality scoring
7. **test-fixer** (BLOCKING) — Post-review: fix any new issues, integrate red-team stubs, apply auditor findings
8. **commit-guardian** (BLOCKING) — Conventional commits, size limits
9. **pr-hygiene** (non-blocking) — PR quality
10. **functional-validator** (BLOCKING, if UI changes) — Playwright browser testing

---

## Phase 2: Report

### Gate Result: [PASS/FAIL]

| Agent | Status | Issues | Blocking |
|-------|--------|--------|----------|
| test-fixer (baseline) | PASS/FAIL | n | Yes |
| code-simplifier | PASS/FAIL | n | No |
| performance-reviewer | PASS/FAIL | n | No* |
| code-reviewer | PASS/FAIL | n | Yes |
| red-team | PASS/FAIL | n | Yes |
| test-auditor | PASS/FAIL | n | Yes* |
| test-fixer (verification) | PASS/FAIL | n | Yes |
| commit-guardian | PASS/FAIL | n | Yes |
| pr-hygiene | PASS/FAIL | n | No |
| functional-validator | PASS/FAIL | n | Yes |

*performance-reviewer becomes blocking when CRITICAL_PERF=true
*test-auditor becomes blocking when critical path has zero tests

**Verdict:** PASS (all blocking agents passed) | FAIL (blocking issues found)
