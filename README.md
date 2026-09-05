# Undo-First Agent

**No action without an undo plan.**

Undo-First Agent is a small, dependency-free prototype of a safety layer for capable agents. It converts a natural-language request into a bounded change proposal, makes the blast radius visible, requires approval for the exact scope, executes only in a synthetic local sandbox, and produces a receipt with a tested rollback path.

The key product idea is simple:

> An agent should not ask a person to trust its intentions. It should show the change, the risk, and the way back.

## Run the demo

Open `C:\PROYECTOS\WORK\undo-first-agent\index.html` in a browser. No build step, package installation, server, API key, account, or network connection is required.

Recommended demo path:

1. Select **Clean up a shared project folder**.
2. Click **Generate undo-first plan**.
3. Review the proposed operations, data touched, expiry, and rollback plan.
4. Tick **I reviewed it**, then click **Approve & run demo**.
5. Open the **Action receipt** and click **Roll back now**.
6. Open **View audit receipt** to see the decision, scope, and recovery evidence.
7. Repeat with the CRM or subscriptions scenario to show the pattern is horizontal rather than tied to one app.

The browser stores only a small synthetic audit record in local storage. **No real files, accounts, messages, customer records, or subscription providers are contacted.**

## WebMCP surface

When the page is opened in a WebMCP-capable environment, it registers these tools through `navigator.modelContext` (or the equivalent model context object):

- `inspect_action_request` — inspect the request and current boundary;
- `build_undo_plan` — create the explicit plan;
- `simulate_blast_radius` — return impact, risk, and rollback coverage;
- `approve_reversible_action` — record a human approval and run the local demo;
- `rollback_last_action` — restore the synthetic baseline;
- `prepare_action_receipt` — prepare the local audit packet.

The tools are deliberately narrow. There is no generic “do anything” tool, no hidden network call, and no route around the human approval gate.

## Why this matters

Most agent demonstrations show an agent completing a task. Real users also need to know what happens when the task is slightly wrong, the scope is too broad, or a later reviewer asks what changed. Undo-First Agent makes reversibility a first-class capability rather than an afterthought.

The same contract can sit in front of file operations, CRM updates, calendar changes, subscription actions, internal admin tools, or any T3N-connected workflow:

```text
intent → explicit plan → impact simulation → human approval → scoped execution → receipt → rollback
```

## T3N integration plan

The local prototype intentionally runs without credentials. The optional integration path is documented in [`t3n/README.md`](t3n/README.md). When a T3N API key and agent DID are available, the adapter should replace the synthetic data provider while preserving the same contract:

1. Authenticate with T3N using environment variables, never a committed secret.
2. Bind each action to a tenant/agent identity and a declared scope.
3. Snapshot or stage data before mutation where the connected tool supports it.
4. Require the same approval object before the write call.
5. Store a receipt containing the action ID, source, scope, and reverse operation.

## Project files

- `index.html` — the interactive demo shell;
- `styles.css` — visual system and responsive layout;
- `app.js` — plan, approval, execution, rollback, audit, and WebMCP registration;
- `ANALISIS.md` — product and contest fit;
- `CHECKLIST.md` — local verification and recording checklist;
- `AGENTS.md` — contributor guardrails;
- `t3n/README.md` — credential-safe T3N integration notes.

## Status

Prototype complete for local review. Publication, account creation, T3N claim/API credentials, and any external submission are intentionally not performed yet.
