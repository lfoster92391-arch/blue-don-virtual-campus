# Branch Strategy

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready releases |
| `develop` | Integration branch for approved phases |
| `phase/N-description` | Active phase work (e.g. `phase/1-core-shell`) |
| `feature/description` | Small scoped changes within a phase |

## Workflow

1. Create `phase/N-description` from `develop`
2. Complete phase deliverables
3. Open pull request to `develop`
4. Review and approve
5. Merge to `develop`
6. After MVP (Phase 11), merge `develop` to `main` for production release

## Rules

- Never push directly to `main`
- One phase per branch
- Do not merge phases together
- Do not skip review gates

## Tags

Production releases are tagged:

```
v0.1.0-phase-0
v0.2.0-phase-1
...
v1.0.0-mvp
```
