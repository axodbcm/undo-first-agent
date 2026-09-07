/**
 * Credential-safe T3N connection check.
 *
 * The API key is read only from T3N_API_KEY and is never logged.
 * The tenant DID is returned by the authenticated session; it is not
 * hardcoded or derived from the key.
 */
import { connectT3n } from "./session.js";

const { did, environment } = await connectT3n();

console.log(`T3N connection established (${environment}).`);
console.log(`Authenticated DID: ${did}`);
console.log("API key: loaded from the local environment and not printed.");
