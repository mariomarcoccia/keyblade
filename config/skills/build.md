# /build - Agentic Feature Development

Lifecycle: `DRAFTING -> UNDERSTOOD -> VERIFIED -> BUILDING -> CERTIFYING -> DONE`

## Stack Awareness

Read `.keyblade/config.json` to adapt build commands, test runners, and file patterns.

## Algorithm

**CONTINUITY RULE — BLOCKING REQUIREMENT:**
After each phase completes, proceed to the next immediately.
Do NOT output text between phases. Do NOT summarize. Do NOT narrate.

### Phase 1: UNDERSTAND

1. Read the request (spec if provided, or create one from user input)
2. Explore the product surface — Glob routes, pages, UI features
3. Challenge assumptions: list every assumption, identify the most fragile ones
4. Design acceptance criteria — observable behaviors, not implementation details
5. Write spec to `.workflow/build/{slug}/spec.md` with Status: UNDERSTOOD

### Phase 2: VERIFY

1. Read spec. Design verification criteria.
2. **Coverage Baseline**: Identify test coverage gaps in areas this feature touches
3. V1-V3 are automatic: unit tests, TypeScript, build
4. Design V4+ QA test scripts (what would convince a skeptical user this works?)
5. Write `.workflow/build/verify.sh`. Status -> VERIFIED

### Phase 3: IMPLEMENT

1. Status -> BUILDING
2. Anti-anchoring: consider 3+ approaches, prefer simplest
3. Implement with freedom in approach
4. Run verify.sh frequently as feedback loop
5. Test coverage check: all new exported functions must have tests
6. V4+ verification via Playwright against dev server
7. Write implementation-notes.md. Status -> CERTIFYING

### Phase 4: CERTIFY

1. Run quality agents in sequence:
   - code-simplifier (non-blocking)
   - performance-reviewer (non-blocking, unless CRITICAL_PERF)
   - code-reviewer with scope flags (BLOCKING)
   - red-team with code-reviewer findings (BLOCKING)
   - test-auditor for coverage + quality (BLOCKING if critical path has zero tests)
   - test-fixer for verification + audit integration
2. Commit all changes (conventional commits)
3. Deploy + production verification (if deploy config exists)
4. memory-sync if meaningful patterns established
5. Status -> DONE

## Recovery

On session start, check `.workflow/build/{slug}/spec.md` Status:
- BUILDING -> resume Phase 3
- CERTIFYING -> resume Phase 4
- DONE -> inform user, exit
- UNDERSTOOD -> resume Phase 2
- VERIFIED -> resume Phase 3

## Rules

- Follow conventional commits
- Max 300 lines per commit
- Tests are BLOCKING — no code without tests
- TypeScript strict, Zod for inputs
- If verify.sh fails 3x on same area: mandatory step-back protocol
