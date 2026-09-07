# T3N adapter notes

This folder contains the credential-safe T3N connector and registration notes. The sandbox API key remains outside the
repository; never commit credentials.

## Official setup path

Use the official T3N ADK Quickstart to:

1. claim an API key;
2. store it in the environment as `T3N_API_KEY`;
3. authenticate the agent and obtain its tenant/session identity through the SDK;
4. keep the authenticated session variable rather than hardcoding or deriving a tenant DID.

The current prototype does not need any of those steps. Its synthetic provider is the contract test for the safety layer.

## Sandbox trust mode

The public sandbox currently does not publish a complete signed trust manifest. The official SDK exposes an explicit
`{ unsafe_trust_server: true }` option for local development and sandbox/mock nodes. The connector uses that option only
when `T3N_ENV=sandbox`; it must not be copied to a production deployment. Production uses the operator-signed manifest.

## Adapter boundary

The future adapter should provide these functions:

```js
async function inspectProviderState(scope) {}
async function prepareSnapshot(scope) {}
async function stageOperations(plan, snapshot) {}
async function commitApprovedPlan(plan, approval, snapshot) {}
async function rollbackCommittedPlan(receipt) {}
```

The UI and WebMCP layer should call the adapter only after:

- the plan has an identity, expiry, and hash;
- the provider snapshot is attached;
- the user approved that exact plan;
- a rollback operation exists and is accepted by the provider;
- the agent’s identity and tenant scope are available.

## First real integration slice

The first slice is now implemented in `t3n/adapter.ts` and exposed through:

```powershell
npm run t3n:inspect
```

It authenticates, reads the organisation policy and one page of agent metadata, then creates a local staged draft bound to a SHA-256 hash of that snapshot. The command has no provider write path: the draft is discarded when the process exits. Configure `T3N_ORG_DID` or use the saved public DID in `sandbox-state.json`. Do not begin with deletion, external messaging, money movement, or any mutation that cannot be reversed.

## Current publication status

The T3N sandbox account and API key were used locally to register the agent. The key remains outside the repository and
must only be entered through the local helper. The agent card is published at:

https://cn-api.sg.testnet.t3n.terminal3.io/api/agent-card/did:t3n:313ce6ecc4809d44b0596f90e2cb9dadf19009e2

This confirms registration and card publication only. The local demo still uses synthetic data, and the contest submission
has not been sent.
