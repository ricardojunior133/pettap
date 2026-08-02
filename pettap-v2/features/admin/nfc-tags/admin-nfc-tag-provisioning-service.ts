import "server-only";

import { randomBytes } from "node:crypto";

import { requireAdminPermission } from "@/lib/auth/require-admin";

import {
  DrizzleAdminNfcTagProvisioningRepository,
  type AdminNfcTagProvisioningRepository,
} from "./admin-nfc-tag-provisioning-repository";

export type AdminNfcTagProvisioningView = {
  publicCode: string;
  status: "unassigned";
  accountReference: string;
  createdAt: string;
  idempotent: boolean;
};

export type AdminNfcTagProvisioningServiceResult =
  | { ok: true; tag: AdminNfcTagProvisioningView }
  | { ok: false };

const publicCodePattern = /^PT_[A-Za-z0-9_-]{24}$/;

function createPublicCode() {
  const publicCode = `PT_${randomBytes(18).toString("base64url")}`;
  if (!publicCodePattern.test(publicCode)) throw new Error("Generated NFC public code is invalid.");
  return publicCode;
}

function accountReference(accountId: string) {
  return `Account ••••${accountId.slice(-6)}`;
}

/**
 * Administrative-only initial inventory allocation. Account identity comes
 * exclusively from the verified tags.manage context, never from the browser.
 */
export class AdminNfcTagProvisioningService {
  constructor(
    private readonly repository: AdminNfcTagProvisioningRepository = new DrizzleAdminNfcTagProvisioningRepository(),
    private readonly requirePermission: typeof requireAdminPermission = requireAdminPermission,
    private readonly generatePublicCode: () => string = createPublicCode,
  ) {}

  async createInitialTestTag(): Promise<AdminNfcTagProvisioningServiceResult> {
    const context = await this.requirePermission("tags.manage");
    const result = await this.repository.createInitialTestTag(context.accountId, [
      this.generatePublicCode(),
      this.generatePublicCode(),
      this.generatePublicCode(),
    ]);
    if (result.kind === "account_not_found") return { ok: false };
    return {
      ok: true,
      tag: {
        publicCode: result.tag.publicCode,
        status: result.tag.status,
        accountReference: accountReference(result.tag.accountId),
        createdAt: result.tag.createdAt.toISOString(),
        idempotent: result.kind === "existing",
      },
    };
  }
}
