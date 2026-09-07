# Local verification checklist

## Smoke test

- [ ] Open `index.html` in a browser.
- [ ] The page loads without a build step or network requirement.
- [ ] The hero button scrolls to the live demo and generates a plan.
- [ ] The three scenario options replace the request and plan content.
- [ ] The generated plan shows coverage, blast radius, data touched, expiry, steps, and rollback.
- [ ] The approval button remains disabled until “I reviewed it” is checked.
- [ ] Approve and run changes the synthetic state to the “after” view.
- [ ] Roll back restores the pre-action baseline and disables the rollback button.
- [ ] The audit receipt reports the plan ID, scope, operations, and recovery path.
- [ ] Reset demo returns the page to the empty state.

## Safety checks

- [ ] No real account, file, message, customer record, or provider is contacted.
- [ ] No API key is present in source files.
- [ ] The destructive toggle changes the declared scope but does not remove the approval gate.
- [ ] The UI labels the run as synthetic/local.
- [ ] A stale or missing plan cannot be executed through the normal UI.

## WebMCP check

In a WebMCP-capable runtime, inspect the registered tools and confirm that the page exposes only the six narrow tools documented in `README.md`. Call the read-only inspection and simulation tools first. Confirm that approval is required before the local execution tool changes state, and that rollback returns the state to the baseline.

## T3N adapter check

- [ ] Set `T3N_API_KEY` and `T3N_ORG_DID` only in the local PowerShell session.
- [ ] Run `npm run t3n:inspect` and confirm it reads policy and one page of agent metadata.
- [ ] Confirm the output contains a local staged draft and snapshot hash.
- [ ] Confirm the adapter exposes no provider commit, delete, or external messaging path.
- [ ] Remove the environment variables after the check; never save them in the repository.

## Recording checklist

- Keep the browser zoom at 100%.
- Use the folder scenario for the main path.
- Keep the cursor near the relevant metric when explaining it.
- Pause briefly on the approval card before checking it.
- Click rollback and leave the restored state visible for the final frame.
- Do not show credentials, personal data, or browser extensions in the recording.
