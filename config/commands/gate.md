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

1. **code-reviewer** (BLOCKING) - Security, types, bugs
2. **commit-guardian** (BLOCKING) - Conventional commits, size limits
3. **pr-hygiene** (non-blocking) - PR quality
4. **functional-validator** (BLOCKING) - Runtime behavior

---

## Phase 2: Report

### Gate Result: [PASS/FAIL]

| Agent | Status | Issues | Blocking |
|-------|--------|--------|----------|
| code-reviewer | PASS/FAIL | n | Yes |
| commit-guardian | PASS/FAIL | n | Yes |
| pr-hygiene | PASS/FAIL | n | No |
| functional-validator | PASS/FAIL | n | Yes |

**Verdict:** PASS (all blocking agents passed) | FAIL (blocking issues found)
