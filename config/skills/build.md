# /build - Feature Development

Lifecycle: `UNDERSTOOD -> VERIFIED -> BUILDING -> CERTIFYING -> DONE`

## Stack Awareness
Read `.keyblade/config.json` to adapt build commands, test runners, and file patterns.

## Algorithm

1. Understand the request (read spec if provided, or create one)
2. Design verification criteria (V1: tests, V2: types, V3: build)
3. Implement with freedom in approach
4. Run verification frequently as feedback loop
5. Certify: all checks pass, implementation notes written

## Rules
- Follow conventional commits
- Max 300 lines per commit
- Tests are BLOCKING - no code without tests
- TypeScript strict, Zod for inputs
