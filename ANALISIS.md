# Undo-First Agent — product and submission analysis

## One-line pitch

**Every AI action starts with an undo plan.**

Undo-First Agent is a reusable control layer that lets an agent be powerful without making the user accept an irreversible black box. It turns intent into a concrete, bounded and reversible change, asks for approval of that exact change, then produces evidence of what happened and how to recover.

## The demo story

The demo opens on a plausible workplace request: “Clean up the shared project folder and make it easier for the team to find the latest files.”

Instead of pretending that the agent can safely infer permission from that sentence, it shows:

- four explicit operations;
- six affected items;
- eight pieces of data touched;
- 100% undo coverage;
- a 24-hour plan expiry;
- no destructive action allowed by default;
- an exact reverse path;
- a checkbox that represents human approval of this plan, not a blanket trust setting.

After approval, the local sandbox changes its synthetic state and creates an action receipt. The user can then click **Roll back now** and see the baseline restored. The CRM and subscriptions variants demonstrate that the contract is portable across work and consumer workflows.

## Why it is a strong T3N-shaped agent

The challenge asks for a useful trusted agent that is easy to maintain and can keep running after the challenge. This prototype is deliberately small and durable:

1. **Useful:** accidental edits, broad permissions, and unclear agent side effects are universal problems.
2. **Trusted:** the safety boundary is visible and enforceable; approval is required before execution.
3. **Maintainable:** the UI is dependency-free, the scenarios use a shared plan contract, and the provider layer can be swapped without rewriting the trust loop.
4. **Demonstrable:** the result is visible in under two minutes and the rollback is a strong “show, not tell” moment.
5. **Extendable:** a T3N data provider can be added behind the same plan/receipt API without turning the demo into a collection of provider-specific screens.

## What is genuinely implemented

- explicit natural-language request input;
- three reusable synthetic scenarios;
- bounded operation list with operation kinds;
- scope boundary with destructive actions off by default;
- approval gate that cannot be skipped through the interface;
- local execution simulation;
- actual local rollback state transition;
- expiry and rollback token in the receipt;
- persistent local audit entries;
- six narrow WebMCP tool registrations when a model context is present;
- no external requests and no secrets.

## What is not claimed

This is not yet connected to a real filesystem, CRM, bank, subscription provider, or T3N tenant. It does not claim that any external action has occurred. The production version must implement provider-specific snapshots, idempotency, authorization, and error recovery before it can safely mutate real data.

## Production contract

```text
Plan {
  planId
  actor: { userId, agentDid, tenantDid }
  intent
  operations[]
  dataScope
  risk
  expiresAt
  rollback: { available, token, operations[] }
  requiresHumanApproval: true
}
```

The production adapter should refuse execution if any of these checks fail:

- plan expired;
- plan hash differs from the approved plan;
- provider snapshot is stale;
- requested scope is broader than approved scope;
- rollback cannot be prepared;
- actor or tenant identity is missing;
- provider returns a partial result without an idempotent recovery path.

## Responsible boundaries

The agent must not create a false sense of safety. “Undo” is only meaningful when it is tested, scoped, and honest about what it cannot reverse. For example, an email sent to an external recipient cannot be made unsent by renaming a local draft. The UI therefore treats drafts, staging, snapshots, and soft moves as safer primitives and reserves irreversible actions for a separately elevated policy.

## Suggested two-minute presentation

1. Open the local page and say: “The request is intentionally vague.”
2. Generate a plan. Point to impact, data touched, and expiry.
3. Ask: “Would you approve a plan that only says ‘clean up’?” Then show the four bounded operations.
4. Check approval and execute. Point out that the UI still calls it a synthetic local action.
5. Roll it back. Show that recovery is not a promise in a paragraph; it is an available action.
6. Open the receipt and finish: “This is the trust contract I would place in front of every T3N-connected tool.”

## Current limitations and next implementation slice

The next slice should add a real T3N-authenticated adapter only after the user has claimed an API key and agent identity. It should start with read-only inspection plus a staged/draft operation, not direct destructive mutations. The first external provider should expose an explicit snapshot and reverse operation so the local contract remains honest.
