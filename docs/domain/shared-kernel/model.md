# Shared Kernel

**Generated with**: ddd-modeling 0.4.0-alpha

Types shared across bounded contexts. Changes to this model affect
all BCs that reference these types — coordinate before modifying.

## Value Objects

| Name | Construction Rule | Invalid States | Used by |
|---|---|---|---|
| Trait | One of the 33 catalog traits (closed list, currently defined in `tools/src/questions/Traits.ts`) | any value outside the list | Catalog, Participation, Color Distribution, icebreaker selection |

## Primitive Types

| Name | Base Type | Description |
|---|---|---|
