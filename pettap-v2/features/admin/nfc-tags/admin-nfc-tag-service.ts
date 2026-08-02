import "server-only";

import { z } from "zod";

import { requireAdminPermission } from "@/lib/auth/require-admin";

import {
  DrizzleAdminNfcTagRepository,
  type AdminNfcTagListInput,
  type AdminNfcTagRepository,
  type AdminNfcTagStatus,
} from "./admin-nfc-tag-repository";

const pageSize = 20;
const statusSchema = z.enum(["unassigned", "active", "suspended", "lost", "retired"]);
const searchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  publicCode: z.string().trim().regex(/^[A-Za-z0-9_-]*$/).max(128).default(""),
  status: z.string().optional(),
  unassigned: z.enum(["true", "false"]).optional(),
  withoutPet: z.enum(["true", "false"]).optional(),
}).strict();

export type AdminNfcTagQuery = {
  page: number;
  publicCode: string;
  status?: AdminNfcTagStatus;
  unassignedOnly: boolean;
  withoutPet: boolean;
};

export type AdminNfcTagView = {
  publicCode: string;
  status: AdminNfcTagStatus;
  petName: string | null;
  accountReference: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminNfcTagPageView = {
  tags: AdminNfcTagView[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  query: AdminNfcTagQuery;
};

export function parseAdminNfcTagQuery(raw: Record<string, string | string[] | undefined>): AdminNfcTagQuery {
  const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const parsed = searchSchema.safeParse({
    page: first(raw.page),
    publicCode: first(raw.publicCode),
    status: first(raw.status),
    unassigned: first(raw.unassigned),
    withoutPet: first(raw.withoutPet),
  });
  const value = parsed.success ? parsed.data : searchSchema.parse({});
  const status = statusSchema.safeParse(value.status);
  return {
    page: value.page,
    publicCode: value.publicCode,
    status: status.success ? status.data : undefined,
    unassignedOnly: value.unassigned === "true",
    withoutPet: value.withoutPet === "true",
  };
}

function accountReference(accountId: string | null) {
  return accountId ? `Account ••••${accountId.slice(-6)}` : "Unassigned account";
}

function toView(record: Awaited<ReturnType<AdminNfcTagRepository["list"]>>["rows"][number]): AdminNfcTagView {
  return {
    publicCode: record.publicCode,
    status: record.status,
    petName: record.petName,
    accountReference: accountReference(record.accountId),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/** Permission is verified before every operational tag read; the client only receives this allowlisted view. */
export class AdminNfcTagService {
  constructor(
    private readonly repository: AdminNfcTagRepository = new DrizzleAdminNfcTagRepository(),
    private readonly requirePermission: typeof requireAdminPermission = requireAdminPermission,
  ) {}

  async list(rawQuery: Record<string, string | string[] | undefined>): Promise<AdminNfcTagPageView> {
    await this.requirePermission("tags.manage");
    const query = parseAdminNfcTagQuery(rawQuery);
    const input: AdminNfcTagListInput = { ...query, pageSize };
    const result = await this.repository.list(input);
    const totalPages = result.total ? Math.ceil(result.total / pageSize) : 0;
    return { tags: result.rows.map(toView), page: query.page, totalPages, total: result.total, pageSize, query };
  }
}
