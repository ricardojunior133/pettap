export type NfcProvisioningPayload = Readonly<{ recordType: "uri"; value: string; version: "nfc-v1" }>;
export interface NfcWriterAdapter {
  readonly kind: string;
  isSupported(): Promise<boolean>;
  write(payload: NfcProvisioningPayload): Promise<void>;
  readBack(): Promise<NfcProvisioningPayload | null>;
  verify(expected: NfcProvisioningPayload, actual: NfcProvisioningPayload | null): boolean;
}
/** Safe default: no unverified browser NFC support is assumed. */
export class UnsupportedNfcWriterAdapter implements NfcWriterAdapter {
  readonly kind = "unsupported";
  async isSupported() { return false; }
  async write() { throw new Error("No verified NFC writer adapter is configured."); }
  async readBack() { return null; }
  verify() { return false; }
}
/** An operator may use an approved external writer and report its scanner read-back. */
export class ManualNfcWriterAdapter implements NfcWriterAdapter {
  readonly kind = "manual";
  constructor(private readonly readBackPayload: NfcProvisioningPayload | null) {}
  async isSupported() { return true; }
  async write() { /* Explicitly manual: this adapter never claims a physical browser write. */ }
  async readBack() { return this.readBackPayload; }
  verify(expected: NfcProvisioningPayload, actual: NfcProvisioningPayload | null) {
    return Boolean(actual && actual.recordType === expected.recordType && actual.version === expected.version && actual.value === expected.value);
  }
}
