# Domain Docs

## Before exploring

- Read root `CONTEXT.md` when it exists.
- If `CONTEXT-MAP.md` exists, read the contexts relevant to the task.
- Read applicable ADRs under `docs/adr/`.
- Missing domain documents are not blockers; proceed silently.

## Layout

This is a single-context repository:

```
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

Domain documentation is created lazily when terminology or architectural decisions are resolved.

## Vocabulary

Use terminology defined in `CONTEXT.md`. Avoid synonyms that its glossary rejects. If a required concept is absent, reconsider the terminology or note the gap for domain modeling.

## ADR conflicts

Explicitly identify proposals that conflict with an existing ADR instead of silently overriding the decision.
