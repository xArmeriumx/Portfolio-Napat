# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- Create, read, update, comment on, label, and close issues through `gh issue`.
- Infer the repository from the current Git remote.
- Use GitHub Issues whenever a skill says to publish to the issue tracker.
- Fetch a referenced ticket, including comments and labels, before acting on it.

## Pull requests as a triage surface

PRs as a request surface: no.

## Wayfinding operations

- A map is a GitHub issue labelled `wayfinder:map`.
- Child tickets use `wayfinder:<type>` labels.
- Prefer native GitHub sub-issues and dependencies.
- Fall back to task lists and `Blocked by:` references where native features are unavailable.
- Claim work by assigning the selected issue to the current user.
