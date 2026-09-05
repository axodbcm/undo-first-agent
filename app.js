/* Undo-First Agent — local, dependency-free prototype.
 * All data is synthetic and remains in this browser only.
 */

const STORAGE_KEY = "undo-first-agent:v1";
const sessionId = `UFA-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const scenarioData = {
  folder: {
    title: "Clean up a shared project folder",
    defaultRequest: "Clean up the shared project folder and make it easier for the team to find the latest files.",
    summary: "Create a review-only archive for stale duplicates, normalize six filenames, and preserve every original. Nothing is deleted or overwritten.",
    items: [
      ["brief-v3", "Project Brief v3.docx", "doc"],
      ["brief-final", "Project Brief FINAL.docx", "doc"],
      ["brief-final-2", "Project Brief FINAL (1).docx", "doc"],
      ["assets-zip", "campaign-assets.zip", "zip"],
      ["assets-zip-2", "campaign-assets (1).zip", "zip"],
      ["notes-old", "notes_old.txt", "txt"],
      ["roadmap", "Roadmap 2026.xlsx", "sheet"],
      ["roadmap-copy", "Roadmap 2026 - Copy.xlsx", "sheet"],
    ],
    steps: [
      ["Create a dated `_Review/2026-09-05` folder inside the shared project folder.", "CREATE"],
      ["Move 3 probable duplicates to the review folder; keep originals recoverable.", "MOVE"],
      ["Rename 3 files using the proposed naming convention; record old names.", "RENAME"],
      ["Write a manifest with every changed item and its reverse operation.", "RECORD"],
    ],
    rollback: "Move the 3 review items back to their original paths, restore the 3 previous filenames, and remove only the empty review folder. The manifest stays as evidence.",
    metrics: { coverage: "100%", coverageCaption: "every step reversible", blast: "6 items", blastCaption: "3 moves · 3 renames", data: "8 files", dataCaption: "names + paths only", expiry: "24h" },
    risk: "LOW RISK",
    before: [["8 files", "folder"], ["0 review items", "empty"], ["No action receipt", "log"]],
    after: [["5 active files", "folder"], ["3 review items", "moved"], ["1 undo manifest", "log"]],
  },
  crm: {
    title: "Correct a batch of customer records",
    defaultRequest: "Fix the inconsistent country codes in the latest customer import without losing the original values.",
    summary: "Stage a corrected view for 12 records, preserve each original value, and produce a diff that can be reverted as a single batch.",
    items: [["batch", "Import batch #1842", "batch"], ["records", "12 customer records", "users"], ["fields", "country_code field", "field"], ["source", "Original CSV snapshot", "snapshot"]],
    steps: [["Create a versioned snapshot of the 12 affected records.", "SNAPSHOT"], ["Validate the 12 proposed country-code changes against the allowed list.", "VALIDATE"], ["Stage changes as a new draft batch; do not overwrite production values.", "STAGE"], ["Write a field-level diff and reverse patch for every record.", "RECORD"]],
    rollback: "Discard the staged draft batch and restore the snapshot as the active review baseline. No production record is modified until a separate approval.",
    metrics: { coverage: "100%", coverageCaption: "snapshot + reverse patch", blast: "12 records", blastCaption: "1 field per record", data: "48 fields", dataCaption: "staged, not published", expiry: "2h" },
    risk: "LOW RISK",
    before: [["12 imported records", "batch"], ["12 inconsistent values", "warning"], ["1 source snapshot", "snapshot"]],
    after: [["12 staged corrections", "staged"], ["12 originals preserved", "safe"], ["1 reverse patch", "log"]],
  },
  subscriptions: {
    title: "Audit recent subscriptions",
    defaultRequest: "Review recent subscription charges and prepare cancellation or refund actions, but do not send anything yet.",
    summary: "Collect the last 30 days of synthetic subscription events, flag likely duplicate or post-cancellation charges, and prepare drafts only.",
    items: [["streaming", "StreamBox · €14.99", "charge"], ["design", "PixelKit · €9.00", "charge"], ["cloud", "CloudNest · €4.50", "charge"], ["cancelled", "NoteSpace · cancelled", "cancelled"]],
    steps: [["Read the last 30 days of subscription events from the connected ledger.", "READ"], ["Flag 2 charges that match the review rules; show the evidence for each.", "FLAG"], ["Prepare two unsent refund/cancellation drafts for human review.", "DRAFT"], ["Create a receipt with links to the source events and a discard action.", "RECORD"]],
    rollback: "Discard the two unsent drafts and clear the temporary review labels. No provider form is opened and no message is sent.",
    metrics: { coverage: "100%", coverageCaption: "drafts are discardable", blast: "2 drafts", blastCaption: "0 messages sent", data: "30 days", dataCaption: "read-only review", expiry: "30m" },
    risk: "LOW RISK",
    before: [["4 recent services", "ledger"], ["0 review drafts", "empty"], ["No outbound action", "safe"]],
    after: [["2 flagged charges", "review"], ["2 unsent drafts", "draft"], ["1 evidence receipt", "log"]],
  },
};

const $ = (id) => document.getElementById(id);
const clone = (value) => JSON.parse(JSON.stringify(value));

const state = loadState();
state.sessionId = sessionId;
state.plan = null;
state.executed = false;
state.rolledBack = false;

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored && typeof stored === "object" ? stored : { scenario: "folder", destructive: false, audit: [] };
  } catch {
    return { scenario: "folder", destructive: false, audit: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ scenario: state.scenario, destructive: state.destructive, audit: state.audit.slice(-20) }));
}

function nowIso() { return new Date().toISOString(); }
function formatTime(iso) { return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }

function toast(message) {
  const node = $("toast");
  node.textContent = message;
  node.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => node.classList.remove("show"), 3200);
}

function buildPlan() {
  const scenario = scenarioData[state.scenario];
  const request = $("requestText").value.trim() || scenario.defaultRequest;
  const created = nowIso();
  state.plan = { id: `PLAN-${created.replace(/\D/g, "").slice(0, 14)}`, scenario: state.scenario, request, created, expires: new Date(Date.now() + (state.scenario === "subscriptions" ? 30 : 60) * 60 * 1000).toISOString(), approved: false };
  state.executed = false;
  state.rolledBack = false;
  renderPlan();
  $("workspace").scrollIntoView({ behavior: "smooth", block: "start" });
  toast("Plan generated. Review the scope and rollback path before approving.");
}

function renderPlan() {
  const plan = state.plan;
  if (!plan) return;
  const scenario = scenarioData[plan.scenario];
  $("emptyPlan").classList.add("hidden");
  $("planContent").classList.remove("hidden");
  $("planTitle").textContent = scenario.title;
  $("planStatus").textContent = plan.approved ? (state.rolledBack ? "ROLLED BACK" : "EXECUTED") : "READY FOR REVIEW";
  $("planStatus").className = `plan-status ${plan.approved ? (state.rolledBack ? "rolled-back" : "approved") : "ready"}`;
  $("undoCoverage").textContent = scenario.metrics.coverage;
  $("undoCoverageCaption").textContent = scenario.metrics.coverageCaption;
  $("blastRadius").textContent = scenario.metrics.blast;
  $("blastRadiusCaption").textContent = scenario.metrics.blastCaption;
  $("dataTouched").textContent = scenario.metrics.data;
  $("dataTouchedCaption").textContent = scenario.metrics.dataCaption;
  $("planExpiry").textContent = scenario.metrics.expiry;
  $("proposalRisk").textContent = state.destructive ? "ELEVATED SCOPE" : scenario.risk;
  $("proposalRisk").style.color = state.destructive ? "var(--amber)" : "var(--green)";
  $("proposalSummary").textContent = scenario.summary;
  $("stepCount").textContent = `${scenario.steps.length} bounded operations`;
  $("stepList").innerHTML = scenario.steps.map(([text, kind]) => `<li><span>${escapeHtml(text)}</span><span class="step-kind">${escapeHtml(kind)}</span></li>`).join("");
  $("rollbackBox").innerHTML = `${escapeHtml(scenario.rollback)}<br /><br /><code>rollback_token: ${escapeHtml(plan.id)} · valid_until: ${escapeHtml(formatTime(plan.expires))}</code>`;
  $("approvalCheckbox").checked = Boolean(plan.approved);
  $("approvalCheckbox").disabled = Boolean(plan.approved);
  $("approveExecute").disabled = Boolean(plan.approved) || !$("approvalCheckbox").checked;
  $("approveExecute").innerHTML = plan.approved ? "Plan already executed <span>✓</span>" : "Approve &amp; run demo <span>→</span>";
  if (plan.approved) renderExecution();
  else $("executionPanel").classList.add("hidden");
}

function renderExecution() {
  const scenario = scenarioData[state.plan.scenario];
  $("executionPanel").classList.remove("hidden");
  $("executionTitle").textContent = state.rolledBack ? "Action rolled back" : "Action receipt";
  $("executionStatus").textContent = state.rolledBack ? "ROLLED BACK" : "COMPLETED LOCALLY";
  $("executionStatus").className = `plan-status ${state.rolledBack ? "rolled-back" : "approved"}`;
  const before = scenario.before;
  const after = state.rolledBack ? before : scenario.after;
  $("beforeCount").textContent = `${before.length} observations`;
  $("afterCount").textContent = `${after.length} observations`;
  $("beforeState").innerHTML = before.map(([text, kind]) => `<div class="state-item"><span class="item-icon">•</span>${escapeHtml(text)}</div>`).join("");
  $("afterState").innerHTML = after.map(([text, kind]) => `<div class="state-item ${state.rolledBack ? "" : "changed"}"><span class="item-icon">${state.rolledBack ? "↶" : "✓"}</span>${escapeHtml(text)}</div>`).join("");
  $("receiptMessage").textContent = state.rolledBack ? "Rollback completed. The synthetic state is back to its pre-action baseline." : "The synthetic demo action completed with a receipt and a tested rollback path.";
  $("rollbackButton").disabled = state.rolledBack;
  $("rollbackButton").textContent = state.rolledBack ? "↶ Already rolled back" : "↶ Roll back now";
  renderAudit();
}

function executePlan() {
  if (!state.plan || state.plan.approved) return;
  state.plan.approved = true;
  state.plan.approvedAt = nowIso();
  state.executed = true;
  state.rolledBack = false;
  state.audit.push({ type: "EXECUTED", plan: clone(state.plan), at: state.plan.approvedAt, scenario: state.plan.scenario });
  saveState();
  renderPlan();
  toast("Approved scope executed in the local synthetic sandbox.");
  $("executionPanel").scrollIntoView({ behavior: "smooth", block: "center" });
}

function rollbackPlan() {
  if (!state.plan || !state.plan.approved || state.rolledBack) return;
  state.rolledBack = true;
  state.audit.push({ type: "ROLLED_BACK", planId: state.plan.id, at: nowIso(), scenario: state.plan.scenario });
  saveState();
  renderPlan();
  toast("Rollback completed. No real data was touched.");
}

function renderAudit() {
  if (!state.plan || !state.plan.approved) return;
  $("auditPanel").classList.add("hidden");
  const scenario = scenarioData[state.plan.scenario];
  const receipt = [
    "UNDO-FIRST ACTION RECEIPT",
    "=========================",
    `plan_id       : ${state.plan.id}`,
    `scenario      : ${scenario.title}`,
    `request       : ${state.plan.request}`,
    `created_at    : ${formatTime(state.plan.created)}`,
    `approved_at   : ${formatTime(state.plan.approvedAt)}`,
    `status        : ${state.rolledBack ? "ROLLED_BACK" : "EXECUTED_LOCALLY"}`,
    `scope         : ${state.destructive ? "destructive actions allowed" : "non-destructive only"}`,
    "",
    "APPROVED OPERATIONS",
    ...scenario.steps.map(([text, kind], index) => `  ${String(index + 1).padStart(2, "0")}. [${kind}] ${text}`),
    "",
    "RECOVERY",
    `  rollback_token: ${state.plan.id}`,
    `  path          : ${scenario.rollback}`,
    "",
    "DATA POLICY",
    "  This receipt was produced from synthetic data in a local sandbox.",
    "  No external account, file, message, or provider was contacted.",
  ].join("\n");
  $("auditReceipt").textContent = receipt;
}

function selectScenario() {
  state.scenario = $("scenarioSelect").value;
  $("requestText").value = scenarioData[state.scenario].defaultRequest;
  state.plan = null;
  state.executed = false;
  state.rolledBack = false;
  $("planTitle").textContent = "No plan generated yet";
  $("planStatus").textContent = "WAITING FOR REQUEST";
  $("planStatus").className = "plan-status idle";
  $("emptyPlan").classList.remove("hidden");
  $("planContent").classList.add("hidden");
  $("executionPanel").classList.add("hidden");
  $("auditPanel").classList.add("hidden");
  saveState();
}

function resetDemo() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

function toggleDestructive() {
  state.destructive = $("destructiveToggle").checked;
  if (state.plan) renderPlan();
  saveState();
  toast(state.destructive ? "Elevated scope enabled for review; the approval gate remains on." : "Least-privilege scope restored.");
}

function showAudit() {
  $("auditPanel").classList.remove("hidden");
  renderAudit();
  $("auditPanel").scrollIntoView({ behavior: "smooth", block: "center" });
}

function registerWebMCP() {
  const modelContext = window.navigator.modelContext || window.modelContext || document.modelContext;
  if (!modelContext || typeof modelContext.registerTool !== "function") return;
  const tools = [
    { name: "inspect_action_request", description: "Read the current synthetic request and selected scope without executing it.", inputSchema: { type: "object", properties: {} }, execute: async () => ({ request: $("requestText").value, scenario: state.scenario, destructiveAllowed: state.destructive, approvalRequired: true }) },
    { name: "build_undo_plan", description: "Generate a bounded, reversible plan for the current synthetic request.", inputSchema: { type: "object", properties: {} }, execute: async () => { buildPlan(); return { planId: state.plan?.id, status: "ready_for_human_review" }; } },
    { name: "simulate_blast_radius", description: "Return the synthetic impact, data touched, risk, and rollback coverage of the current plan.", inputSchema: { type: "object", properties: {} }, execute: async () => { if (!state.plan) buildPlan(); const s = scenarioData[state.plan.scenario]; return { planId: state.plan.id, impact: s.metrics.blast, dataTouched: s.metrics.data, undoCoverage: s.metrics.coverage, risk: s.risk, rollback: s.rollback }; } },
    { name: "approve_reversible_action", description: "Record that a human approved the exact current plan; execution is still local and synthetic.", inputSchema: { type: "object", properties: { confirmation: { type: "boolean" } }, required: ["confirmation"] }, execute: async ({ confirmation }) => { if (confirmation !== true) return { status: "not_approved" }; $("approvalCheckbox").checked = true; executePlan(); return { status: "executed_in_local_sandbox", planId: state.plan?.id }; } },
    { name: "rollback_last_action", description: "Rollback the last locally executed synthetic action.", inputSchema: { type: "object", properties: {} }, execute: async () => { rollbackPlan(); return { status: state.rolledBack ? "rolled_back" : "nothing_to_rollback" }; } },
    { name: "prepare_action_receipt", description: "Prepare the audit receipt for the current plan without sending it anywhere.", inputSchema: { type: "object", properties: {} }, execute: async () => { if (state.plan?.approved) renderAudit(); return { status: state.plan?.approved ? "receipt_ready" : "plan_not_executed" }; } },
  ];
  tools.forEach((tool) => { try { modelContext.registerTool(tool); } catch (error) { console.warn("WebMCP tool registration skipped", tool.name, error); } });
  document.documentElement.dataset.webmcp = "registered";
}

$("sessionId").textContent = sessionId;
$("scenarioSelect").value = state.scenario || "folder";
$("requestText").value = scenarioData[state.scenario || "folder"].defaultRequest;
$("destructiveToggle").checked = Boolean(state.destructive);
$("startDemo").addEventListener("click", () => { $("workspace").scrollIntoView({ behavior: "smooth" }); window.setTimeout(buildPlan, 450); });
$("generatePlan").addEventListener("click", buildPlan);
$("scenarioSelect").addEventListener("change", selectScenario);
$("destructiveToggle").addEventListener("change", toggleDestructive);
$("approvalCheckbox").addEventListener("change", () => { if (state.plan) $("approveExecute").disabled = !$("approvalCheckbox").checked; });
$("approveExecute").addEventListener("click", executePlan);
$("rollbackButton").addEventListener("click", rollbackPlan);
$("receiptButton").addEventListener("click", showAudit);
$("copyReceipt").addEventListener("click", async () => { try { await navigator.clipboard.writeText($("auditReceipt").textContent); toast("Audit receipt copied to clipboard."); } catch { toast("Select and copy the receipt manually from the audit packet."); } });
$("editPlan").addEventListener("click", () => { $("requestText").focus(); toast("Edit the request, then generate a fresh plan."); });
$("resetDemo").addEventListener("click", resetDemo);
registerWebMCP();
