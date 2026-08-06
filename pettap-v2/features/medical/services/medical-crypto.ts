import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import type { MedicalInformationInput } from "../types/medical";

type EncryptedMedicalPayload = {
  version: 1;
  iv: string;
  authTag: string;
  ciphertext: string;
};

export class MedicalEncryptionError extends Error {}

function getEncryptionKey() {
  const value = process.env.MEDICAL_ENCRYPTION_KEY;
  if (!value) throw new MedicalEncryptionError("Medical encryption is not configured.");

  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new MedicalEncryptionError("Medical encryption is not configured.");
  return key;
}

export function encryptMedicalPayload(input: MedicalInformationInput, key = getEncryptionKey()): EncryptedMedicalPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(input), "utf8"), cipher.final()]);

  return {
    version: 1,
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
}

export function decryptMedicalPayload(payload: unknown, key = getEncryptionKey()): MedicalInformationInput {
  if (!payload || typeof payload !== "object") throw new MedicalEncryptionError("Medical data is unavailable.");
  const encrypted = payload as Partial<EncryptedMedicalPayload>;
  if (encrypted.version !== 1 || !encrypted.iv || !encrypted.authTag || !encrypted.ciphertext) {
    throw new MedicalEncryptionError("Medical data is unavailable.");
  }

  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(encrypted.iv, "base64"));
    decipher.setAuthTag(Buffer.from(encrypted.authTag, "base64"));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted.ciphertext, "base64")), decipher.final()]);
    const parsed = JSON.parse(decrypted.toString("utf8")) as MedicalInformationInput;
    return {
      conditions: parsed.conditions ?? null,
      medications: parsed.medications ?? null,
      allergies: parsed.allergies ?? null,
      careInstructions: parsed.careInstructions ?? null,
    };
  } catch {
    throw new MedicalEncryptionError("Medical data is unavailable.");
  }
}
