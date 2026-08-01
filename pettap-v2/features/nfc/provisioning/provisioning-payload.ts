import "server-only";
import type { NfcProvisioningPayload } from "./nfc-writer-adapter";
/** Pure, deterministic and PII-free; credential, challenge and final profile URL remain separate. */
export function buildNfcProvisioningPayload(siteUrl: string, publicCode: string): NfcProvisioningPayload {
  return { version: "nfc-v1", recordType: "uri", value: `${new URL(siteUrl).origin}/nfc/v1/t/${encodeURIComponent(publicCode)}` };
}
