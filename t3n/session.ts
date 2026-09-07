/** Shared credential-safe T3N sandbox session setup. */
import {
  T3nClient,
  setEnvironment,
  loadWasmComponent,
  eth_get_address,
  metamask_sign,
  createEthAuthInput,
  fetchTrustedManifest,
} from "@terminal3/t3n-sdk";

export type T3nEnvironment = "sandbox" | "production";

export async function connectT3n() {
  const apiKey = process.env.T3N_API_KEY;
  const environment = (process.env.T3N_ENV ?? "sandbox") as T3nEnvironment;

  if (!apiKey) {
    throw new Error("T3N_API_KEY is not set. Enter it only in the local PowerShell prompt.");
  }
  if (environment !== "sandbox" && environment !== "production") {
    throw new Error("T3N_ENV must be sandbox or production.");
  }

  setEnvironment(environment);
  const address = eth_get_address(apiKey);
  const trustAnchor = environment === "sandbox"
    ? { unsafe_trust_server: true as const }
    : await fetchTrustedManifest("production");

  const client = new T3nClient({
    trustAnchor,
    wasmComponent: await loadWasmComponent(),
    handlers: {
      EthSign: metamask_sign(address, undefined, apiKey),
    },
  });

  await client.handshake();
  const authenticated = await client.authenticate(createEthAuthInput(address));

  return { client, did: authenticated.value, environment };
}
