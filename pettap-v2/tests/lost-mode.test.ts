import { describe, expect, it } from "vitest";

import {
  type LostReportRepository,
  type LostReportResolution,
} from "@/features/lost-mode/repositories/lost-report-repository";
import {
  LostReportNotFoundError,
  LostReportService,
} from "@/features/lost-mode/services/lost-report-service";
import type { LostReport } from "@/features/lost-mode/types/lost-report";
import { PetAccessError } from "@/features/pets/services/pet-access";

const accountId = "a3c6efc0-bd44-41c7-a733-81df9740c0b9";
const petId = "602cb2c4-c1c1-4cd1-9cb0-11dc32e7adad";
const reportId = "9286f6f6-b7d4-4ee2-824e-6b92b44451b4";

function createRepository(resolution: LostReportResolution): LostReportRepository {
  return {
    async findActive() {
      return null;
    },
    async create() {
      throw new Error("not used in this test");
    },
    async resolve() {
      return resolution;
    },
    async listActive() {
      return [] as LostReport[];
    },
  };
}

const authorizeOwnedPet = async () => ({
  accountId,
  pet: { id: petId },
});

describe("Lost Mode resolution", () => {
  it("returns a resolved outcome once the owned active alert is closed", async () => {
    const service = new LostReportService(
      createRepository("resolved"),
      authorizeOwnedPet as never,
      async () => accountId,
    );

    await expect(service.resolve(petId, reportId)).resolves.toBe("resolved");
  });

  it("keeps a repeated resolution idempotent", async () => {
    const service = new LostReportService(
      createRepository("already-resolved"),
      authorizeOwnedPet as never,
      async () => accountId,
    );

    await expect(service.resolve(petId, reportId)).resolves.toBe("already-resolved");
  });

  it("does not disclose reports that are not owned by the active account", async () => {
    const service = new LostReportService(
      createRepository("not-found"),
      authorizeOwnedPet as never,
      async () => accountId,
    );

    await expect(service.resolve(petId, reportId)).rejects.toBeInstanceOf(
      LostReportNotFoundError,
    );
  });

  it("converts authorization failures into a safe not-found result", async () => {
    const service = new LostReportService(
      createRepository("resolved"),
      async () => {
        throw new PetAccessError();
      },
      async () => accountId,
    );

    await expect(service.resolve(petId, reportId)).rejects.toBeInstanceOf(
      LostReportNotFoundError,
    );
  });
});
