# Keyblade Configuration Architecture

## File Hierarchy

```
~/.claude/
├── CLAUDE.md                    Project rules (installed by Keyblade)
├── ARCHITECTURE.md              This file — system documentation
├── settings.json                Hook configuration (from settings-template.json)
├── commands/                    Invoked via /command
│   └── gate.md
├── skills/                      Invoked via /skill
│   ├── build.md                 Feature development (4-phase orchestrator)
│   ├── resolve.md               Bug resolution (4-phase orchestrator)
│   ├── deliberate.md            Adversarial solution design
│   └── gate.md                  Quality gate pre-PR
├── hooks/                       Shell scripts triggered by events
│   ├── stop-guard.sh            Stop: prevents stop during active workflow
│   ├── continuity.sh            PostToolUse Skill: injects next action
│   ├── skill-register.sh        PreToolUse Skill: claims session ownership
│   ├── session-recovery.sh      SessionStart: detects stalled workflows
│   ├── implement-stop.sh        Stop: enforces verify.sh --full for agents
│   └── empty-guard.sh           PostToolUse AskUserQuestion: rejects empty
└── agents/                      Invoked via Task tool (13 total)
    ├── code-reviewer.md         Confidence-driven, scope-triggered, noise-filtered
    ├── red-team.md              Adversarial: trust boundaries, silent failures
    ├── performance-reviewer.md  N+1 queries, unbounded loads, blocking async
    ├── test-auditor.md          Read-only coverage auditor with quality scoring
    ├── test-fixer.md            Run/fix/create tests, consumes auditor output
    ├── code-simplifier.md       Clarity, DRY, Rule of 3
    ├── functional-validator.md  Playwright browser automation
    ├── build-implementer.md     Autonomous implementation from spec
    ├── resolve-fixer.md         Autonomous bug fixing with circuit breaker
    ├── memory-sync.md           Post-workflow knowledge synchronization
    ├── commit-guardian.md       Conventional commits enforcement
    └── pr-hygiene.md            PR quality validation
```

Projects also have `.keyblade/config.json` with detected stack information.

---

## Workflows

### /build (Feature Development)

| Phase | Description |
|-------|-------------|
| Understand | Explore product surface, interview user, design acceptance criteria |
| Verify | Coverage baseline + design V4+ QA verification scripts |
| Implement | Anti-anchoring, exemplar study, test coverage check, `build-implementer` agent |
| Certify | Quality agents -> commit -> deploy -> production V4+ verification |

Lifecycle: `DRAFTING -> UNDERSTOOD -> VERIFIED -> BUILDING -> CERTIFYING -> DONE`

### /resolve (Bug Resolution)

| Phase | Description |
|-------|-------------|
| Investigate | Sequential Thinking hypotheses, production logs, QA reproduction flows |
| Verify | User reviews diagnosis + QA flows |
| Fix | Minimum fix + regression test + local QA verification via `resolve-fixer` agent |
| Certify | Quality agents -> deploy -> production QA verification |

Lifecycle: `INVESTIGATING -> DIAGNOSED -> VERIFIED -> FIXING -> CERTIFYING -> VERIFIED_PROD`

**Trivial escape hatch:** Bugs with >95% confidence get fixed and verified in Phase 1, skipping all remaining phases.

**Circuit breaker:** Attempt 4 OR WTF-likelihood >= 30% in fix phase -> re-investigate (max 1 cycle).

### /gate (Quality Gate)

Sequence: `test-fixer (baseline)` -> `code-simplifier` -> `performance-reviewer` -> `code-reviewer (scope flags)` -> `red-team` -> `test-auditor (coverage + quality)` -> `test-fixer (verification + audit)` -> `functional-validator (if UI changes)`

### /deliberate (Solution Design)

3-move adversarial design: Challenge Frame -> Simulate 5+ Scenarios -> Refine Winner collaboratively. Zero implementation.

---

## Agent Registry

| Agent | Model | Blocking | Purpose |
|-------|-------|----------|---------|
| code-reviewer | opus | BLOCKING | Security, typing, bugs (confidence calibration + scope-triggered + noise filter) |
| red-team | opus | BLOCKING | Adversarial: trust boundaries, silent failures, race conditions, e-commerce attacks |
| performance-reviewer | opus | non-blocking* | N+1 queries, unbounded loads, blocking async (*CRITICAL_PERF overrides) |
| test-auditor | opus | BLOCKING* | Coverage gaps, quality scoring. Read-only. (*critical path with zero tests) |
| test-fixer | opus | BLOCKING | Run/fix/create tests, consume auditor output |
| code-simplifier | opus | non-blocking | Clarity, DRY, Rule of 3, patterns |
| functional-validator | opus | BLOCKING | Playwright smoke tests on UI |
| build-implementer | opus | BLOCKING | Autonomous implementation until tests pass |
| resolve-fixer | opus | BLOCKING | Autonomous bug fix until QA flows pass |
| memory-sync | sonnet | non-blocking | Sync MCP Memory post-workflow |
| commit-guardian | opus | BLOCKING | Conventional commits, max 300 lines |
| pr-hygiene | opus | non-blocking | PR description, linked issues, branch naming |

---

## Agent Output Format

All agents return a standardized block:

```
---AGENT_RESULT---
STATUS: PASS | FAIL
ISSUES_FOUND: <number>
ISSUES_FIXED: <number>
BLOCKING: true | false
---END_RESULT---
```

Rules: `STATUS=FAIL + BLOCKING=true` -> workflow STOPS. `BLOCKING=false` -> continues with warning.

Extra fields by agent:
- `performance-reviewer` adds `CRITICAL_PERF: true | false`. When `true`, orchestrator treats as blocking.
- `test-auditor` adds `QUALITY_SCORES` and `CRITICAL_GAPS`. When critical path has zero tests, `BLOCKING: true`.
- `test-fixer` adds `TESTS_CREATED` and `TESTS_UPGRADED`.

---

## Automatic Triggers

| Condition | Action |
|-----------|--------|
| Change in `*.tsx`, `*.css` | `functional-validator` invoked |
| Change in auth/jwt/session/middleware | SCOPE_AUTH -> deep auth review in `code-reviewer` |
| Change in routes/api/controllers | SCOPE_API -> deep API review in `code-reviewer` |
| Change in migrations/schema | SCOPE_MIGRATIONS -> deep migration review in `code-reviewer` |
| Changed code | `test-auditor` audits coverage and quality |
| New code without test | `test-fixer` creates test |
| End of workflow | `memory-sync` updates Memory |

---

## Hooks Pipeline

| Hook | Event | Function |
|------|-------|----------|
| `skill-register.sh` | PreToolUse (Skill) | Claims session ownership for build/resolve sub-skills |
| `continuity.sh` | PostToolUse (Skill) | Injects next phase call, prevents narration between phases |
| `stop-guard.sh` | Stop | Blocks stop while workflow active; reads next-action.md |
| `implement-stop.sh` | Stop (agent) | Enforces verify.sh --full for build-implementer agent |
| `session-recovery.sh` | SessionStart | Detects stalled workflows (30min heartbeat), offers resume |
| `empty-guard.sh` | PostToolUse (AskUserQuestion) | Rejects empty/blank responses (accidental submissions) |

---

## Stack Awareness

Keyblade detects the project stack and writes `.keyblade/config.json`:

```json
{
  "language": "typescript",
  "framework": "nextjs",
  "packageManager": "npm",
  "testRunner": "vitest",
  "detectedAt": "2026-04-09T..."
}
```

All agents read this config to adapt their behavior:
- Build/test commands
- Language-specific patterns
- Framework conventions
- File location expectations

---

## PCI / E-commerce Module

When the project stack indicates e-commerce or payment handling:

- **code-reviewer** activates PCI-DSS checks (CVV storage, card masking, HTTPS, rate limiting)
- **code-reviewer** activates LGPD data protection checks
- **red-team** activates e-commerce attack vectors (payment injection, cart manipulation, checkout bypass, session hijacking)
- **code-simplifier** focuses on checkout function deduplication and efficient GraphQL queries

---

## Quick Reference

```bash
# Skills (user-invocable)
/deliberate  # Adversarial solution design (optional)
/build       # Feature development (4-phase)
/resolve     # Bug resolution (4-phase)
/gate        # Quality gate pre-PR

# Agents (via Task tool, 13 total)
# code-reviewer, red-team, performance-reviewer,
# test-auditor, test-fixer, code-simplifier,
# functional-validator, build-implementer, resolve-fixer,
# memory-sync, commit-guardian, pr-hygiene
```
