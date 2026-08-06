import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { lostReports, pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { LostReport, LostReportDetails } from "../types/lost-report";

const lostReportSelection = {
  id: lostReports.id,
  petId: lostReports.petId,
  status: lostReports.status,
  details: lostReports.details,
  createdAt: lostReports.createdAt,
  updatedAt: lostReports.updatedAt,
};

function mapLostReport(row: typeof lostReports.$inferSelect): LostReport {
  return {
    id: row.id,
    petId: row.petId,
    status: row.status as LostReport["status"],
    details: row.details as LostReportDetails,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export type LostReportResolution = "resolved" | "already-resolved" | "not-found";

export interface LostReportRepository {
  findActive(petId: string, accountId: string): Promise<LostReport | null>;
  create(
    petId: string,
    accountId: string,
    details: LostReportDetails,
  ): Promise<LostReport>;
  resolve(
    id: string,
    petId: string,
    accountId: string,
  ): Promise<LostReportResolution>;
  listActive(accountId: string): Promise<LostReport[]>;
}

export class DrizzleLostReportRepository implements LostReportRepository {
  async findActive(petId: string, accountId: string) {
    const db = createDatabaseClient();
    const [result] = await db
      .select(lostReportSelection)
      .from(lostReports)
      .innerJoin(pets, eq(lostReports.petId, pets.id))
      .where(
        and(
          eq(lostReports.petId, petId),
          eq(pets.accountId, accountId),
          eq(lostReports.status, "active"),
        ),
      )
      .orderBy(desc(lostReports.createdAt))
      .limit(1);

    return result ? mapLostReport(result) : null;
  }

  async create(petId: string, accountId: string, details: LostReportDetails) {
    const db = createDatabaseClient();

    return db.transaction(async (transaction) => {
      const [pet] = await transaction
        .select({ id: pets.id })
        .from(pets)
        .where(and(eq(pets.id, petId), eq(pets.accountId, accountId)))
        .limit(1);

      if (!pet) throw new Error("NOT_FOUND");

      const [existing] = await transaction
        .select({ id: lostReports.id })
        .from(lostReports)
        .where(
          and(eq(lostReports.petId, petId), eq(lostReports.status, "active")),
        )
        .limit(1);

      if (existing) {
        const [row] = await transaction
          .select()
          .from(lostReports)
          .where(eq(lostReports.id, existing.id));
        return mapLostReport(row);
      }

      const [row] = await transaction
        .insert(lostReports)
        .values({ petId, status: "active", details })
        .returning();

      return mapLostReport(row);
    });
  }

  async resolve(id: string, petId: string, accountId: string) {
    const db = createDatabaseClient();
    const [report] = await db
      .select({ id: lostReports.id, status: lostReports.status })
      .from(lostReports)
      .innerJoin(pets, eq(lostReports.petId, pets.id))
      .where(
        and(
          eq(lostReports.id, id),
          eq(lostReports.petId, petId),
          eq(pets.accountId, accountId),
        ),
      )
      .limit(1);

    if (!report) return "not-found";
    if (report.status === "resolved") return "already-resolved";

    const [updated] = await db
      .update(lostReports)
      .set({ status: "resolved", updatedAt: new Date() })
      .where(
        and(
          eq(lostReports.id, id),
          eq(lostReports.petId, petId),
          eq(lostReports.status, "active"),
        )
      )
      .returning({ id: lostReports.id });

    return updated ? "resolved" : "already-resolved";
  }

  async listActive(accountId: string) {
    const db = createDatabaseClient();
    const rows = await db
      .select(lostReportSelection)
      .from(lostReports)
      .innerJoin(pets, eq(lostReports.petId, pets.id))
      .where(and(eq(pets.accountId, accountId), eq(lostReports.status, "active")))
      .orderBy(desc(lostReports.createdAt));

    return rows.map((row) => mapLostReport(row));
  }
}
