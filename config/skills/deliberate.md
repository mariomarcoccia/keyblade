# /deliberate - Deep Thinking

Structured reasoning for complex decisions.

## When to Use
- Architecture decisions with multiple viable approaches
- Trade-off analysis (performance vs maintainability, etc)
- Debugging complex issues with unclear root cause
- Design decisions that affect multiple systems

## Algorithm

1. Frame the question precisely
2. Generate at least 3 approaches (anti-anchoring)
3. For each approach: pros, cons, risks, effort
4. Challenge assumptions - what breaks if wrong?
5. Choose with explicit rationale
6. Document the decision

## Output Format

### Decision: [title]

**Context:** [why this decision matters]

| Approach | Pros | Cons | Risk |
|----------|------|------|------|
| A | ... | ... | ... |
| B | ... | ... | ... |
| C | ... | ... | ... |

**Chosen:** [approach] because [rationale]
**Rejected:** [why others were discarded]
