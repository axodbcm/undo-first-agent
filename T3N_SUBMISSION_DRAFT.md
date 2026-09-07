# T3N Agent Build Challenge — submission draft

**Status:** draft only. This document has not been submitted.

## Project

**Undo-First Agent — No action without an undo plan.**

Undo-First Agent is a small, dependency-free safety layer for capable agents. It turns a vague request into a bounded
change proposal, shows the blast radius and rollback path, requires approval for the exact scope, runs a synthetic local
execution, and produces an audit receipt that can be rolled back.

## Links

- Public repository: https://github.com/axodbcm/undo-first-agent
- Public demo: https://axodbcm.github.io/undo-first-agent/
- Published T3N sandbox agent card: https://cn-api.sg.testnet.t3n.terminal3.io/api/agent-card/did:t3n:313ce6ecc4809d44b0596f90e2cb9dadf19009e2
- T3N agent DID: `did:t3n:313ce6ecc4809d44b0596f90e2cb9dadf19009e2`

## What is built

The demo presents three reusable synthetic scenarios: shared-folder cleanup, customer-record correction, and subscription
audit. For each scenario the agent:

1. translates natural language into explicit operations;
2. shows scope, data touched, risk, expiry, and undo coverage;
3. keeps destructive actions off by default;
4. blocks execution until the user approves the exact plan;
5. creates an execution receipt;
6. restores the synthetic baseline with one-click rollback.

## T3N and WebMCP fit

The T3N sandbox identity is registered and the public agent card is published. The card describes the narrow
`undo-first-plan` capability and points to the public demo. The browser demo exposes six narrow WebMCP tools when a model
context is available:

- `inspect_action_request`
- `build_undo_plan`
- `simulate_blast_radius`
- `approve_reversible_action`
- `rollback_last_action`
- `prepare_action_receipt`

The demo remains intentionally honest: it uses synthetic local data and performs no real filesystem, CRM, subscription,
messaging, or financial action. A production provider adapter would be added behind the same plan, approval, receipt, and
rollback contract.

## Maintenance and handover

The project has no runtime dependency for the browser demo and can be hosted as static files. A maintainer can extend it by
adding a provider adapter that implements inspection, snapshotting, staged operations, approved commit, and rollback. The
approval gate must remain in place for every mutating operation, and every new action must document its reverse operation.

Preferred continuation: keep the current static demo public and add one read-only T3N-backed inspection followed by one
staged/draft operation. Do not begin with irreversible deletion, external messaging, or money movement.

## Validation evidence

- Public demo loaded successfully.
- Plan generation showed bounded operations, six affected items, eight touched files, 100% undo coverage, and a 24-hour expiry.
- The approval button remained disabled until `I reviewed it` was checked.
- Approval produced `COMPLETED LOCALLY` and an action receipt.
- Rollback produced `ROLLED BACK` and restored eight files with zero review items.
- No API key or personal data is stored in the repository.

## Bugs encountered and resolved

- The sandbox trust manifest was incomplete, so the connector uses the SDK's explicit unsafe trust option only for
  `T3N_ENV=sandbox`; production still requires a signed manifest.
- The SDK returns DID wrapper objects in some calls. The registration helper now normalizes those values to primitive DID
  strings before passing them to the contract or saving state.
- The registration helper now uses the SDK's official structured `createAgent` call rather than serializing the complete
  contract input as a string.

## Submission checklist

- [x] Public GitHub repository
- [x] Public static demo
- [x] T3N sandbox agent registered
- [x] T3N agent card published
- [x] Documentation and maintenance notes
- [x] Known bugs and fixes documented
- [ ] Create a public Google Doc containing this material and screenshots
- [ ] Review the final submission in Superteam Earn
- [ ] Press `Submit Now`

## Important boundary

The final Google Doc creation, screenshot upload, and `Submit Now` action are still pending human review. No API key is
included in this draft.
