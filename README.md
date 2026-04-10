# Keyblade

CLI setup tool for [Claude Code](https://claude.ai/code) with stack detection, PCI/e-commerce security, and autonomous development workflows.

Inspired by [kakaroto-config](https://github.com/pedrojahara/kakaroto-config) by Pedro Jahara — rewritten from scratch with an opinionated focus on e-commerce teams. v2.0 merges Kakaroto v1.3.0 improvements (multi-phase workflows, circuit breakers, Playwright automation).

## Install

Inside any project directory:

```bash
npx github:mariomarcoccia/keyblade
```

This installs configuration to `.claude/` and generates `.keyblade/config.json` with auto-detected stack info.

Use `--force` to overwrite an existing installation.

## What it does

Keyblade gives you 4 commands inside Claude Code:

| Command | Purpose |
|---------|---------|
| `/build` | Feature development — 4 phases: understand, verify, implement, certify |
| `/resolve` | Bug resolution — 4 phases: investigate, verify, fix, certify |
| `/gate` | Quality gate — runs 13 agents in sequence before you open a PR |
| `/deliberate` | Solution design — 3-move adversarial design, zero code |

## Stack Detection

On install, Keyblade auto-detects your project's stack and saves it to `.keyblade/config.json`:

- **Languages:** TypeScript, JavaScript, Python, Go, Rust
- **Frameworks:** Next.js, React, Vue, Angular, Svelte, Nuxt, Express, Fastify, Hono, Koa, FastAPI, Django, Flask
- **Package Managers:** npm, yarn, pnpm, bun, pip, go, cargo
- **Test Runners:** vitest, jest, mocha, ava, pytest

All agents read this config to adapt their behavior to your stack.

## Agents (13)

| Agent | Purpose | Blocking |
|-------|---------|----------|
| **code-reviewer** | Security, typing, bugs. Scope-triggered (AUTH/API/MIGRATIONS), noise filter, confidence triaging. PCI-DSS + LGPD modules. | Yes |
| **red-team** | Adversarial review: trust boundaries, silent failures, race conditions, e-commerce attack vectors (payment injection, cart manipulation, checkout bypass) | Yes |
| **performance-reviewer** | N+1 queries, unbounded loads, blocking sync, missing indexes, bundle size, algorithmic complexity | No* |
| **test-auditor** | Read-only coverage auditor with quality scoring (1-3 stars). Critical path detection. No Edit tool. | Yes* |
| **test-fixer** | Run/fix/create tests. Consumes auditor output. CRUD smoke tests. Happy + edge + error + boundary templates. | Yes |
| **code-simplifier** | Clarity, DRY (Rule of 3), clarity metrics. Conditional e-commerce module for checkout dedup. | No |
| **functional-validator** | Full Playwright browser automation. Autonomous error fixing + retry loops. | Yes |
| **build-implementer** | Autonomous implementation from spec. Turn budgets (50/100/150), anti-anchoring (3+ approaches), V4+ Playwright verification. | Yes |
| **resolve-fixer** | Autonomous bug fix. Circuit breaker: attempt counter + WTF-likelihood scoring. QA reproduction flows. Regression tests. | Yes |
| **memory-sync** | Post-workflow knowledge graph synchronization via MCP Memory. | No |
| **commit-guardian** | Conventional commits, max 300 lines, atomic changes | Yes |
| **pr-hygiene** | PR description, linked issues, branch naming, size | No |

\* `performance-reviewer` becomes blocking when `CRITICAL_PERF=true`. `test-auditor` blocks when critical path has zero tests.

## Multi-Phase Workflows

### `/build` Lifecycle

```
DRAFTING -> UNDERSTOOD -> VERIFIED -> BUILDING -> CERTIFYING -> DONE
```

| Phase | What happens |
|-------|-------------|
| **Understand** | Explore product surface, challenge assumptions, design acceptance criteria |
| **Verify** | Coverage baseline, design V4+ QA scripts, create `verify.sh` |
| **Implement** | Anti-anchoring (3+ approaches), test coverage check, Playwright V4+ |
| **Certify** | Quality agents in sequence, commit, deploy, production verification |

**Recovery:** On session restart, reads spec Status and resumes from the correct phase.

### `/resolve` Lifecycle

```
INVESTIGATING -> DIAGNOSED -> VERIFIED -> FIXING -> CERTIFYING -> VERIFIED_PROD
```

**Circuit breaker:** Attempt 4 OR WTF-likelihood >= 30% triggers re-investigation (max 1 cycle).

**Trivial escape hatch:** Bugs with >95% confidence get fixed in Phase 1, skipping remaining phases.

## `/gate` Pipeline

Runs 13 agents in sequence before a PR:

```
1. test-fixer          (baseline — ensure tests pass)
2. code-simplifier     (clarity, DRY, patterns)
3. performance-reviewer (N+1, unbounded, blocking sync)
4. code-reviewer       (security + PCI + scope flags)
5. red-team            (adversarial, with code-reviewer findings)
6. test-auditor        (coverage + quality scoring)
7. test-fixer          (verification + audit integration)
8. functional-validator (if UI files changed)
```

If any **blocking** agent returns FAIL, the pipeline stops.

## PCI / E-commerce Security

Activated when `.keyblade/config.json` indicates e-commerce or payment-related framework.

**code-reviewer** checks:

| Check | Severity |
|-------|----------|
| Card numbers / PAN in logs | CRITICAL |
| CVV stored after authorization | CRITICAL |
| Missing input sanitization on payment fields | CRITICAL |
| HTTP instead of HTTPS on payment endpoints | CRITICAL |
| Session tokens in URLs | HIGH |
| Missing rate limiting on auth/payment | HIGH |

**LGPD (Brazil):** CPF/email/phone encrypted at rest, data access logged, consent recorded, deletion endpoints required.

**red-team** attack vectors:

| Vector | Examples |
|--------|---------|
| Payment injection | Price manipulation, discount replay, currency mismatch |
| Cart manipulation | Negative quantities, race on stock, item substitution |
| Checkout bypass | Step skipping, address bypass, terms bypass |
| Session hijacking | Tokens in URL/localStorage, cross-tab interference |

## Hooks (Executable)

| Hook | Event | Function |
|------|-------|----------|
| `stop-guard.sh` | Stop | Blocks stop during active workflow; derives next action from spec Status |
| `continuity.sh` | PostToolUse (Skill) | Injects next phase call, prevents narration between phases |
| `skill-register.sh` | PreToolUse (Skill) | Claims session ownership for sub-skills |
| `session-recovery.sh` | SessionStart | Detects stalled workflows (30min heartbeat), offers resume |
| `implement-stop.sh` | Stop (agent) | Enforces verify.sh --full for build-implementer |
| `empty-guard.sh` | PostToolUse (AskUserQuestion) | Rejects empty/blank responses |

## Code Rules

Rules enforced via `CLAUDE.md`:

- TypeScript strict mode, ES modules, async/await
- Zod for all external inputs (API, user data, env vars)
- Functions < 50 lines, max 2 levels of nesting
- Forbidden: `any`, generic try/catch, callbacks, `@ts-ignore`
- Conventional commits: `type(scope): description`
- Max 300 lines per commit, each commit atomic

## Keyblade vs Kakaroto

| Aspect | Kakaroto v1.3.0 | Keyblade v2.0.0 |
|--------|-----------------|-----------------|
| Stack detection | No | Yes — auto-detects language, framework, test runner |
| Agents | 11 | 13 (includes commit-guardian, pr-hygiene, test-auditor) |
| Security | Generic | PCI-DSS + LGPD + e-commerce attack vectors (red-team) |
| Circuit breaker | WTF-likelihood in resolve | WTF-likelihood + attempt counter in resolve |
| Hooks | 6 shell scripts | 6 shell scripts + settings-template.json |
| Workflow phases | 5 phases (build), 4 phases (resolve) | 4 phases each with recovery |
| Playwright | Functional validator | Functional validator + V4+ build verification |
| Commit discipline | No | commit-guardian + pr-hygiene agents |
| Config generated | `.claude/` only | `.claude/` + `.keyblade/config.json` |
| Architecture docs | ARCHITECTURE.md | ARCHITECTURE.md |
| Language | Portuguese | English |
| Focus | Generic dev workflow | Opinionated for e-commerce teams |

## File Structure

After installation:

```
.claude/
  CLAUDE.md              # Project rules
  ARCHITECTURE.md        # System documentation
  settings.json          # Hook configuration
  agents/                # 13 specialized agents
  skills/                # build, resolve, gate, deliberate
  hooks/                 # 6 executable shell scripts
  commands/              # gate
.keyblade/
  config.json            # Auto-detected stack configuration
```

## Requirements

- [Claude Code](https://claude.ai/code) CLI, desktop app, or IDE extension
- Node.js 18+

## License

MIT
