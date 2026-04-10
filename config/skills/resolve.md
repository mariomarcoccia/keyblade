# /resolve - Agentic Bug Resolution

Lifecycle: `INVESTIGATING -> DIAGNOSED -> VERIFIED -> FIXING -> CERTIFYING -> VERIFIED_PROD`

## Stack Awareness

Read `.keyblade/config.json` to determine test commands, build tools, and language-specific debugging.

## Algorithm

**CONTINUITY RULE — BLOCKING REQUIREMENT:**
After each phase completes, proceed to the next immediately.
Do NOT output text between phases. Do NOT summarize. Do NOT narrate.

### Phase 1: INVESTIGATE

1. Gather context: read bug description, CLAUDE.md, production logs
2. Sequential Thinking (MANDATORY):
   - Thought 1 (SYMPTOMS): What is the bug? Expected vs actual behavior?
   - Thought 2 (HYPOTHESES): Generate 3+ structurally different hypotheses
   - Thought 3 (TARGETING): Which hypothesis is most fragile? Test it.
   - Thought 4 (REVISION): Am I anchored? What evidence would change my mind?
3. Reproduce: write a failing test + browser reproduction via Playwright
4. Design QA Reproduction Flows (human-action scripts)
5. Classify severity: TRIVIAL (>95% confidence) | STANDARD | COMPLEX
6. Write diagnosis to `.workflow/resolve/{slug}/diagnosis.md`. Status -> DIAGNOSED
7. **Trivial escape hatch**: If TRIVIAL, apply fix + verify in this phase. Skip remaining phases.

### Phase 2: VERIFY

1. Present diagnosis + QA flows to user for review
2. User approves or requests changes (max 3 loops)
3. Write verify.sh if it doesn't exist. Status -> VERIFIED

### Phase 3: FIX

1. Status -> FIXING
2. Fix the root cause (minimum change necessary)
3. After each change: run tests + type check, iterate until both pass
4. Write regression test (MUST fail if fix is reverted)
5. Local QA verification: execute all QA flows via Playwright
6. Write fix-notes.md. Status -> CERTIFYING

### Phase 4: CERTIFY

1. Commit with `fix(scope): description`
2. Quality agents (COMPLEX only): code-simplifier, performance-reviewer, code-reviewer, red-team, test-auditor, test-fixer
3. Deploy + production QA verification (if deploy config exists)
4. memory-sync if meaningful debugging insight
5. Status -> VERIFIED_PROD
6. Cleanup `.workflow/resolve/{slug}/` directory

## Circuit Breaker

Two parallel risk signals during Phase 3 (FIX):

### Signal 1: Attempt Counter

| Checkpoint | Action |
|------------|--------|
| Attempt 2 | STOP. Sequential Thinking. Try different approach. |
| Attempt 3 | Question root cause. Is diagnosis wrong? |
| ~50 turns | Re-read diagnosis. Write findings to fix-notes.md. |
| Attempt 4 | BAIL. Status -> INVESTIGATING. Return for re-investigation. |
| ~100 turns | Status -> FAILED. Return failure report. |

### Signal 2: WTF-Likelihood

Starting at 0%, update after each fix action:

| Event | Delta |
|-------|-------|
| Revert/rollback a change | +15% |
| Same test still failing | +10% |
| Modifying file NOT in diagnosis Hotspots | +20% |
| >3 files changed in single attempt | +5% |

**Thresholds:** >= 20% Yellow (mandatory Sequential Thinking), >= 30% Bail (re-investigate).

## Recovery

On session start, check `.workflow/resolve/{slug}/diagnosis.md` Status:
- VERIFIED_PROD -> report summary, exit
- FAILED -> report failure, exit
- CERTIFYING -> resume Phase 4
- FIXING -> resume Phase 3
- VERIFIED -> resume Phase 3
- DIAGNOSED -> resume Phase 2
- INVESTIGATING -> resume Phase 1

## Rules

- Never fix symptoms — find the root cause
- Every fix must include a regression test
- Preserve existing functionality
- Conventional commit: `fix(scope): description`
- Do NOT ask user questions during fix phase — work autonomously
