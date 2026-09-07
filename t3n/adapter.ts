/**
 * First real T3N integration slice.
 *
 * This adapter is intentionally read-only at the provider boundary. It can
 * inspect an organisation and prepare a local staged draft, but it has no
 * commit or delete method. The API key is read by connectT3n() only.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  createOrgDataClientFromSession,
  getNodeUrl,
  type ListAgentsResponse,
  type OrgPolicyMeta,
} from "@terminal3/t3n-sdk";
import { connectT3n } from "./session.js";

export type StagedOperation = {
  kind: "draft";
  description: string;
  scope: string;
  reverse: string;
};

export type ProviderSnapshot = {
  capturedAt: string;
  environment: string;
  actorDid: string;
  orgDid: string;
  policy: OrgPolicyMeta;
  agents: ListAgentsResponse;
};

export type StagedDraft = {
  status: "staged";
  stagedAt: string;
  snapshotHash: string;
  plan: {
    intent: string;
    operations: StagedOperation[];
    requiresHumanApproval: true;
  };
};

const didPattern = /^did:t3n:[0-9a-f]{40}$/i;

function requireDid(value: unknown, label: string): string {
  if (typeof value !== "string" || !didPattern.test(value)) {
    throw new Error(`${label} must be a complete did:t3n identifier.`);
  }
  return value;
}

async function orgDidFromLocalState(): Promise<string | undefined> {
  try {
    const raw = JSON.parse(await readFile(new URL("./sandbox-state.json", import.meta.url), "utf8"));
    return raw.orgDid ? requireDid(raw.orgDid, "Saved organisation DID") : undefined;
  } catch {
    return undefined;
  }
}

async function resolveOrgDid(): Promise<string> {
  const configured = process.env.T3N_ORG_DID?.trim();
  return requireDid(configured || await orgDidFromLocalState(), "T3N_ORG_DID");
}

/** Read the authenticated organisation boundary and its current agent roster. */
export async function inspectProviderState(): Promise<ProviderSnapshot> {
  const { client, did, environment } = await connectT3n();
  const orgDid = await resolveOrgDid();
  const orgData = createOrgDataClientFromSession(client, getNodeUrl());
  const [policy, agents] = await Promise.all([
    orgData.policyGet({ orgDid }),
    orgData.listAgents({ orgDid, limit: 100 }),
  ]);

  return {
    capturedAt: new Date().toISOString(),
    environment,
    actorDid: did,
    orgDid,
    policy,
    agents,
  };
}

/**
 * Prepare a provider-aware draft without sending a write request.
 * The snapshot hash binds the draft to the observed provider state.
 */
export function stageOperations(
  snapshot: ProviderSnapshot,
  intent: string,
  operations: StagedOperation[],
): StagedDraft {
  if (!intent.trim()) throw new Error("A staged draft requires an intent.");
  if (operations.length === 0) throw new Error("A staged draft requires at least one operation.");
  if (operations.some((operation) => operation.kind !== "draft")) {
    throw new Error("This adapter only accepts draft operations.");
  }

  const snapshotHash = createHash("sha256")
    .update(JSON.stringify(snapshot))
    .digest("hex");

  return {
    status: "staged",
    stagedAt: new Date().toISOString(),
    snapshotHash,
    plan: {
      intent: intent.trim(),
      operations,
      requiresHumanApproval: true,
    },
  };
}
