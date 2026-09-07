/**
 * Register and optionally publish Undo-First Agent in T3N sandbox.
 *
 * This script performs persistent sandbox mutations only after explicit
 * local confirmations. It never writes the API key to disk or logs it.
 */
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import {
  createOrgDataClientFromSession,
  getNodeUrl,
} from "@terminal3/t3n-sdk";
import { connectT3n } from "./session.js";

const rl = createInterface({ input, output });
const ask = async (question: string) => (await rl.question(question)).trim();
const didPattern = /^did:t3n:[0-9a-f]{40}$/i;
const stateUrl = new URL("./sandbox-state.json", import.meta.url);

function normaliseDid(value: unknown, label: string): string {
  const candidate = typeof value === "string"
    ? value
    : value && typeof value === "object" && "value" in value && typeof value.value === "string"
      ? value.value
      : "";
  if (!didPattern.test(candidate)) {
    throw new Error(`${label} no es un DID T3N completo válido.`);
  }
  return candidate;
}

async function readState(): Promise<{ orgDid?: string; agentDid?: string }> {
  try {
    const raw = JSON.parse(await readFile(stateUrl, "utf8"));
    return {
      orgDid: raw.orgDid ? normaliseDid(raw.orgDid, "El DID de organización guardado") : undefined,
      agentDid: raw.agentDid ? normaliseDid(raw.agentDid, "El DID de agente guardado") : undefined,
    };
  } catch {
    return {};
  }
}

async function saveState(state: { orgDid: string; agentDid?: string }) {
  await writeFile(stateUrl, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

try {
  const savedState = await readState();
  const configuredOrgDid = process.env.T3N_ORG_DID?.trim();
  let orgDid = configuredOrgDid
    ? normaliseDid(configuredOrgDid, "T3N_ORG_DID")
    : savedState.orgDid;

  const { client, did, environment } = await connectT3n();
  if (environment !== "sandbox") {
    throw new Error("This registration helper is intentionally limited to T3N sandbox.");
  }

  console.log(`Authenticated DID: ${did}`);
  if (!orgDid) {
    const confirmation = await ask(
      "No organisation DID configured. Type CREATE to create a sandbox organisation: ",
    );
    if (confirmation !== "CREATE") {
      console.log("Cancelled before creating an organisation.");
      process.exit(0);
    }
    orgDid = normaliseDid(
      await client.createOrganisation("Undo-First Agent"),
      "El DID de organización devuelto por T3N",
    );
    await saveState({ orgDid });
    console.log(`Organisation created: ${orgDid}`);
  }

  const card = JSON.parse(await readFile(new URL("./agent-card.json", import.meta.url), "utf8"));
  // The SDK builds action.execute with a structured input and serialises the
  // card field at the correct level. Keep the organisation DID as a primitive
  // string; T3N rejects the custom Did wrapper returned by createOrganisation.
  const created = await client.createAgent(orgDid, "Undo-First Agent", { card });
  const agentDid = normaliseDid(created.agentDid, "El DID de agente devuelto por T3N");
  await saveState({ orgDid, agentDid });

  console.log(`Agent created: ${agentDid}`);
  console.log(`Agent card endpoint: ${created.agentUri ?? `https://cn-api.sg.testnet.t3n.terminal3.io/api/agent-card/${agentDid}`}`);
  console.log(`Agent key id: ${created.keyId}`);
  console.log("Agent API key (save it locally now; it is returned only once):");
  console.log(created.apiKey);

  const publish = await ask("Type PUBLISH to make the agent card world-readable: ");
  if (publish === "PUBLISH") {
    const orgData = createOrgDataClientFromSession(client, getNodeUrl());
    await orgData.agentCardPublish({ ownerDid: orgDid, agentDid });
    console.log(`Published agent card: https://cn-api.sg.testnet.t3n.terminal3.io/api/agent-card/${agentDid}`);
  } else {
    console.log("Agent remains hosted privately; nothing was published.");
  }
} finally {
  rl.close();
}
