## Outcome

What user/operator outcome changes? Keep implementation detail secondary.

## Specification and architecture

- Controlling spec IDs:
- Spec status is `ready` or later: [ ]
- Related FE/BE/DEP specs are reciprocal: [ ]
- ADR added/updated if architecture changed: [ ] / N/A
- Change level: L0 / L1 / L2 / L3 / L4

## Acceptance evidence

- Acceptance criteria changed:
- Tests mapped to each criterion:
- Commands and results:
- Manual evidence, if required:

## Risk review

- [ ] Tenant isolation evaluated
- [ ] Authentication/authorization evaluated
- [ ] Customer privacy and logging evaluated
- [ ] Database/migration compatibility evaluated
- [ ] Accessibility/mobile/localization evaluated
- [ ] External provider failures/idempotency evaluated

## Deployment

- Rollout:
- Rollback:
- Backup/migration required: [ ] / N/A
- Configuration/secrets changed: [ ] / N/A
- Mocks and known limitations:

## Completion

- [ ] Initial dirty-worktree state was recorded and preserved
- [ ] Only explicit task files were staged and `check-staged-scope.mjs` passed
- [ ] Staged diff was reviewed before the task commit
- [ ] `npm run validate:specs`
- [ ] Applicable focused tests
- [ ] `npm run check`
- [ ] `npm run test:acceptance` for user workflows
- [ ] `npm run test:operations` for persistence/deployment
- [ ] `npm run release` for release-affecting changes
- [ ] Traceability and operator documentation updated
- Task commit hash:
