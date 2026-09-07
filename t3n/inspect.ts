/** Read-only T3N inspection plus local staged-draft demonstration. */
import { inspectProviderState, stageOperations } from "./adapter.js";

const snapshot = await inspectProviderState();
const draft = stageOperations(snapshot, "Prepare a reviewable agent-access change", [{
  kind: "draft",
  description: "Prepare a proposed access review for the current organisation agent roster.",
  scope: `organisation:${snapshot.orgDid}/agents`,
  reverse: "Discard this local draft; no T3N record has been changed.",
}]);

console.log(JSON.stringify({
  mode: "read-only",
  environment: snapshot.environment,
  actorDid: snapshot.actorDid,
  orgDid: snapshot.orgDid,
  policyAdmins: snapshot.policy.admins.length,
  agentsOnPage: snapshot.agents.agents.length,
  nextCursorPresent: Boolean(snapshot.agents.next_cursor),
  stagedDraft: draft,
}, null, 2));
