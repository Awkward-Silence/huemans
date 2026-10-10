# Architecture decision records

The architecture rules every change in this repo follows: humans and agents alike. A change that deviates from one needs a new ADR that supersedes it.

| ADR | Title | Status |
|---|---|---|
| [ADR-001](ADR-001-tdd-outside-in.md) | TDD outside-in and test structure | Accepted |
| [ADR-002](ADR-002-tell-dont-ask.md) | Tell, Don't Ask | Accepted |
| [ADR-003](ADR-003-value-objects.md) | Value objects instead of primitives | Accepted |
| [ADR-004](ADR-004-aggregate-identity-and-domain-events.md) | Aggregate identity and domain events | Accepted |
| [ADR-005](ADR-005-references-by-id.md) | References between aggregates by id only | Accepted |
| [ADR-006](ADR-006-canonical-dtos.md) | Canonical DTOs at the boundary | Accepted |
| [ADR-007](ADR-007-domain-free-of-infrastructure.md) | Domain free of infrastructure | Accepted |
| [ADR-008](ADR-008-application-service-no-buses.md) | One ApplicationService per context, no command or query bus | Accepted |
| [ADR-009](ADR-009-criteria-for-dynamic-queries.md) | Criteria for dynamic queries | Accepted |
| [ADR-010](ADR-010-explicit-optionality.md) | Explicit optionality in the domain | Accepted |
| [ADR-011](ADR-011-typed-validation-at-the-edge.md) | Typed validation at the edge | Accepted |

## Adding an ADR

1. Take the next number and copy the structure of an existing ADR: Status, Context, Decision, Consequences, In this repo.
2. Start as **Proposed**. Mark it **Accepted** once the team agrees.
3. To replace a decision, mark the old ADR **Superseded by ADR-NNN** and link both ways.
4. Add it to the table above and to the list in the root `CLAUDE.md`.
