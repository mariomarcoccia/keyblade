# Claude Code - Project Rules (keyblade)

## Autonomy
DO, don't ask. SEARCH, don't request context.

## Workflows

| Command | Scope | Trigger |
|---------|-------|---------|
| `/build` | Global | create/add/implement feature |
| `/resolve` | Global | bug/error/problem |
| `/gate` | Global | quality check before PR |

## Code Standards
- Functions < 50 lines, max 2 levels of nesting
- TypeScript strict mode, ES modules, async/await
- Zod for all external inputs (API, user data, env)
- FORBIDDEN: `any`, generic try/catch, callbacks, `@ts-ignore`

## Commits (Conventional)
- Format: `type(scope): description`
- Types: feat, fix, refactor, test, docs, chore, ci
- Max 300 lines per commit
- Each commit must be atomic and self-contained

## Tests (BLOCKING)
Code without tests = PR rejected.
Exceptions: config files, .d.ts, pure UI without logic.

## Stack Awareness
Agents read `.keyblade/config.json` to adapt behavior to the project's detected stack.
Run `npx keyblade` to regenerate if stack changes.
