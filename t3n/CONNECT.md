# Connect Undo-First Agent to T3N

The browser demo remains safe and static. The T3N key must stay on a local/server-side adapter; never put it in `index.html`, `app.js`, GitHub Pages, a commit, or the chat.

## 1. Install the connector locally

From the project folder:

```powershell
npm install
```

## 2. Provide the key without saving it in the repository

The easiest route is to run the included helper. It prompts for the key with hidden input, runs the connection check, and clears the environment variable when it exits:

```powershell
powershell -ExecutionPolicy Bypass -File .\t3n\connect.ps1
```

Alternatively, in the same PowerShell session, set the key as an environment variable. Do not send it to Codex or commit it:

```powershell
$env:T3N_API_KEY = Read-Host "Paste your T3N API key"
$env:T3N_ENV = "sandbox"
```

The key remains available only to that terminal session. The DID is intentionally not entered: the authenticated T3N session returns it.

## 3. Run the connection check

```powershell
npm run t3n:check
```

A successful check prints the authenticated DID and confirms that the key was loaded without printing it. The default
sandbox check uses T3N's explicit sandbox development trust mode because the sandbox manifest is not fully provisioned;
this is not appropriate for production.

## 4. Next adapter slice

Once the check works, add a provider behind the existing Undo-First contract:

```text
inspectProviderState → prepareSnapshot → buildUndoPlan → humanApproval
→ stageOperations → commitApprovedPlan → receipt → rollbackCommittedPlan
```

The first real T3N integration should be read-only or staged. Do not start with deletion, outbound messaging, money movement, or any mutation that cannot be reversed.

## 5. Register the sandbox agent

After the connection check succeeds, run:

```powershell
npm run t3n:register
```

The helper first asks for the API key with hidden input. It then asks for `CREATE` before creating a sandbox organisation
and `PUBLISH` before making the agent card public.
It prints the new agent API key once; save it locally and never commit or paste it into chat. It also stores only the
public organisation/agent DIDs in the ignored local file `t3n/sandbox-state.json`, so a retry does not create a second
organisation after a transient registration error.

## Current status

The local connector is prepared but not run yet because `T3N_API_KEY` is not configured in this environment. No key is stored in this repository.
