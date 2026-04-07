# Keyblade

CLI setup tool for [Claude Code](https://claude.ai/code) with stack detection, PCI/e-commerce security, and commit discipline.

Inspired by [kakaroto-config](https://github.com/pedrojahara/kakaroto-config) by Pedro Jahara — rewritten from scratch with an opinionated focus on e-commerce teams.

## Install

Inside any project directory:

```bash
npx github:mariomarcoccia/keyblade
```

This installs configuration to `.claude/` and generates `.keyblade/config.json` with auto-detected stack info.

## What it does

Keyblade gives you 4 commands inside Claude Code:

| Command | Purpose |
|---------|---------|
| `/build` | Feature development — understands requirements, implements, certifies quality |
| `/resolve` | Bug resolution — investigates root cause, fixes, verifies |
| `/gate` | Quality gate — runs 6 agents before you open a PR |
| `/deliberate` | Solution design — challenges assumptions, simulates scenarios, zero code |

## Stack Detection

On install, Keyblade auto-detects your project's stack and saves it to `.keyblade/config.json`:

- **Languages:** TypeScript, JavaScript, Python, Go, Rust
- **Frameworks:** Next.js, React, Vue, Angular, Svelte, Nuxt, Express, Fastify, Hono, Koa, FastAPI, Django, Flask
- **Package Managers:** npm, yarn, pnpm, bun, pip, go, cargo
- **Test Runners:** vitest, jest, mocha, ava, pytest

All agents read this config to adapt their behavior to your stack.

## Agents

| Agent | Purpose | Blocking |
|-------|---------|----------|
| **code-reviewer** | Security, typing, bugs + PCI/e-commerce module | Yes |
| **commit-guardian** | Conventional commits, max 300 lines, atomic changes | Yes |
| **pr-hygiene** | PR description, linked issues, branch naming, size | No |
| **test-fixer** | Run/fix/create tests automatically | Yes |
| **code-simplifier** | Clarity, DRY, project patterns | No |
| **functional-validator** | Playwright smoke tests on UI changes | Yes |
| **build-implementer** | Autonomous feature implementation until tests pass | Yes |
| **resolve-fixer** | Autonomous bug fix + QA verification | Yes |

## PCI / E-commerce Security

The `code-reviewer` agent includes a dedicated PCI/e-commerce module:

| Check | Severity |
|-------|----------|
| Card numbers / PAN in logs | CRITICAL |
| CVV stored after authorization | CRITICAL |
| Missing input sanitization on payment fields | CRITICAL |
| HTTP instead of HTTPS on payment endpoints | CRITICAL |
| Session tokens in URLs | HIGH |
| Missing rate limiting on auth/payment | HIGH |
| Sensitive data in responses without masking | HIGH |
| SQL/NoSQL injection patterns | CRITICAL |

## Code Rules

Rules enforced via `CLAUDE.md`:

- TypeScript strict mode, ES modules, async/await
- Zod for all external inputs (API, user data, env vars)
- Functions < 50 lines, max 2 levels of nesting
- Forbidden: `any`, generic try/catch, callbacks, `@ts-ignore`
- Conventional commits: `type(scope): description`
- Max 300 lines per commit, each commit atomic

## `/gate` Pipeline

Runs agents in this order before a PR:

```
1. test-fixer (baseline)
2. code-simplifier
3. test-fixer (post-refactor verification)
4. code-reviewer (security + PCI)
5. commit-guardian
6. pr-hygiene
7. functional-validator (if UI files changed)
```

If any **blocking** agent returns FAIL, the pipeline stops.

## Keyblade vs Kakaroto

| Aspect | Kakaroto | Keyblade |
|--------|----------|----------|
| Stack detection | No | Yes — auto-detects language, framework, test runner |
| Security | Generic (eval, secrets) | PCI/e-commerce module (card data, CVV, HTTPS, rate limiting) |
| Commit guardian | No | Yes — conventional commits, max 300 lines, atomic |
| PR hygiene | No | Yes — description, size, linked issues, branch naming |
| Config generated | `.claude/` only | `.claude/` + `.keyblade/config.json` |
| Focus | Generic dev workflow | Opinionated for e-commerce teams |
| Dependency | Standalone | Standalone (no dependency on kakaroto) |

## File Structure

After installation:

```
.claude/
  CLAUDE.md              # Project rules
  agents/                # 8 specialized agents
  skills/                # build, resolve, gate, deliberate
  hooks/                 # continuity, session-recovery, stop-guard, empty-guard
  commands/              # gate
.keyblade/
  config.json            # Auto-detected stack configuration
```

## Requirements

- [Claude Code](https://claude.ai/code) CLI, desktop app, or IDE extension
- Node.js 18+

## License

MIT
