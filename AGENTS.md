# Undo-First Agent contributor notes

## Mission

Keep the trust contract visible: explicit scope, human approval, reversible execution, and an honest receipt.

## Local rules

- Keep the demo dependency-free unless a dependency has a clear maintenance benefit.
- Never add credentials, API keys, cookies, personal data, or private URLs to the repository.
- Do not describe synthetic execution as a real provider action.
- Do not add a generic “execute anything” tool. Every tool must have a narrow purpose and a documented scope.
- Preserve the approval gate when adding a new scenario or provider.
- Add a rollback path before adding a mutating action.
- Update `README.md`, `ANALISIS.md`, and `CHECKLIST.md` when behavior or claims change.

## Integration rule

T3N credentials belong in environment variables or the platform’s secret store. The local prototype must continue to work without credentials and must fail closed if a provider identity or rollback contract is missing.
