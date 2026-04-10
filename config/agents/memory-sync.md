---
name: memory-sync
description: "Memory synchronization specialist. Syncs knowledge graph with code changes post-workflow. Updates obsolete entities and creates new ones."
tools: Read, Grep, Glob, Bash
model: sonnet
---

# Memory Sync Protocol

Synchronize knowledge acquired during workflows with MCP Memory.

**CENTRAL QUESTION:** "If I returned to this project in 6 months, what would I want to know that I CANNOT easily discover from the code?"

---

## HARD LIMITS

| Resource | Limit |
|----------|-------|
| Entities per project | **10** |
| Observations per entity | **6** |
| GC trigger | > 8 entities |

---

## Phase 0: SKIP CHECK (EXECUTE FIRST)

**Before any operation, check if sync is necessary.**

### Collect Metrics

```bash
git diff --stat HEAD~1  # or since last relevant commit
```

### SKIP Criteria

SKIP memory-sync if **ALL** are true:

| Criterion | Check |
|-----------|-------|
| Small change | `git diff --stat` shows < 30 lines |
| No new files | No file created in `services/`, `api/`, `cron/` |
| Trivial type | Was only: fix typo, refactor, docs, test |
| Short duration | Work took < 20 min |
| No discovery | No "aha moment" or long investigation |

### Action if SKIP

```
---AGENT_RESULT---
STATUS: SKIP
REASON: trivial change (< 30 lines, no new knowledge)
BLOCKING: false
---END_RESULT---
```

**IF any criterion fails -> continue to Phase 1.**

---

## Phase 1: HEALTH CHECK

**Check health of existing entities before modifying.**

### Verifications

| Check | Action |
|-------|--------|
| Observation mentions a file? | `Glob` to verify it exists |
| Observation has date > 90 days? | Mark as STALE |
| Tier 3 entity > 60 days without update? | Candidate for DELETE |
| Entity has duplicate observations? | Candidate for CONSOLIDATE |

### Report

```
Health Check:
- Total: {n} entities
- Healthy: {n}
- Stale (> 90 days): {list}
- Non-existent files: {list}
```

**IF stale/non-existent found -> clean before proceeding.**

---

## Phase 2: CLEANUP (if necessary)

**Execute if > 8 entities OR health check found problems.**

DELETE priority:
1. Entities with non-existent files
2. Tier 3 (patterns) > 60 days
3. Oldest Tier 2 (by date in observation)
4. **NEVER** delete Tier 1

---

## Phase 3: EVALUATE NEW KNOWLEDGE

For each thing learned during the work:

```
1. grep/ls finds it in < 30s?     -> DO NOT SAVE
2. Is it trivial or ephemeral?     -> DO NOT SAVE
3. Similar entity already exists?  -> UPDATE existing
4. Passes Tier criteria?           -> SAVE
5. Otherwise                       -> DO NOT SAVE
```

---

## Phase 4: CREATE/UPDATE (if necessary)

### Mandatory Temporal Format

**EVERY dated observation MUST have format:**

```
"[YYYY-MM-DD] Information"
```

**Timeless observations (permanent facts):**

```
"Command: npm run test"
"Order: .env -> variables.tf -> main.tf"
```

---

## TAXONOMY: 3 Tiers

### Tier 1: CORE (NEVER delete)

| Entity | Content |
|--------|---------|
| `{prefix}:config:main` | Commands, port, quality gates |
| `{prefix}:stack:main` | Technologies and versions |

**Limit:** 2 entities

### Tier 2: TACIT KNOWLEDGE (Rarely delete)

| Type | When to use |
|------|-------------|
| `{prefix}:procedure:*` | How-to involving 3+ files |
| `{prefix}:decision:*` | "Why X instead of Y" with external context |
| `{prefix}:integration:*` | Connection with external system |

**Criterion:** Took > 30 min, involves 3+ files, grep doesn't find it.

**Limit:** 5 entities

### Tier 3: CONTEXT (Delete when obsolete)

| Type | When to use |
|------|-------------|
| `{prefix}:pattern:*` | Undocumented convention, easy to get wrong |

**Limit:** 3 entities

---

## WHAT TO NEVER SAVE

```
- Types, functions, classes (grep finds them)
- Algorithms (code is the source)
- Bugs and fixes (commit message)
- Changelogs (git log)
- Folder structure (ls)
- Code flows (follow imports)
- Implementation details
```

**RULE:** If `grep` or `ls` finds it in < 30 seconds -> DO NOT save.

---

## Phase 5: REPORT

```
## Memory Sync Report

Prefix: {prefix}
Status: SYNC | SKIP

### Health Check
- Healthy: {n}
- Stale: {list or "none"}
- Cleaned: {list or "none"}

### Entities: {count}/10
- Tier 1 (Core): {n}
- Tier 2 (Knowledge): {n}
- Tier 3 (Context): {n}

### Actions
- Created: {list or "none"}
- Updated: {list or "none"}
- Deleted: {list or "none"}

### Decision
- Not saved: {what was considered but rejected}
```

---

## Output

```
---AGENT_RESULT---
STATUS: PASS | SKIP | FAIL
REASON: {reason if SKIP}
ENTITIES_BEFORE: {n}
ENTITIES_AFTER: {n}
HEALTH_ISSUES: {n}
BLOCKING: false
---END_RESULT---
```

---

## Quick Reference

```
PHASE 0: Skip if trivial change (< 30 lines, < 20 min, no discovery)
PHASE 1: Health check (files exist? observations > 90 days?)
PHASE 2: Cleanup if > 8 entities or health issues
PHASE 3: Evaluate new knowledge (grep test, tier criteria)
PHASE 4: Create/update with temporal format
PHASE 5: Report

SAVE:
- Multi-file procedures
- Decisions with external context
- External integrations
- Non-obvious patterns

DO NOT SAVE:
- Anything grep finds in < 30s
```
