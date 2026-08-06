import "server-only";

import { and, asc, eq, ne } from "drizzle-orm";

import { auditLogs, customerAddresses, customers } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { AddressInput } from "../schemas/address";

export type CustomerAddressViewModel = {
  id: string;
  type: "shipping" | "billing";
  fullName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  county: string | null;
  postcode: string;
  countryCode: string;
  phone: string | null;
  isDefault: boolean;
};

const customerAddressViewModelSelection = {
  id: customerAddresses.id,
  type: customerAddresses.type,
  fullName: customerAddresses.fullName,
  company: customerAddresses.company,
  addressLine1: customerAddresses.addressLine1,
  addressLine2: customerAddresses.addressLine2,
  city: customerAddresses.city,
  county: customerAddresses.county,
  postcode: customerAddresses.postcode,
  countryCode: customerAddresses.countryCode,
  phone: customerAddresses.phone,
  isDefault: customerAddresses.isDefault,
};

export class CustomerAddressRepository {
  async listByCustomer(accountId: string): Promise<CustomerAddressViewModel[]> {
    const db = createDatabaseClient();
    return db
      .select(customerAddressViewModelSelection)
      .from(customerAddresses)
      .innerJoin(customers, eq(customerAddresses.customerId, customers.id))
      .where(eq(customers.accountId, accountId))
      .orderBy(asc(customerAddresses.createdAt), asc(customerAddresses.id));
  }

  async getById(accountId: string, id: string): Promise<CustomerAddressViewModel | null> {
    const db = createDatabaseClient();
    const [address] = await db
      .select(customerAddressViewModelSelection)
      .from(customerAddresses)
      .innerJoin(customers, eq(customerAddresses.customerId, customers.id))
      .where(and(eq(customerAddresses.id, id), eq(customers.accountId, accountId)))
      .limit(1);

    return address ?? null;
  }

  async create(accountId: string, input: AddressInput): Promise<CustomerAddressViewModel | null> {
    const db = createDatabaseClient();
    return db.transaction(async (tx) => {
      const [customer] = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.accountId, accountId))
        .limit(1);
      if (!customer) return null;

      if (input.isDefault) {
        await tx
          .update(customerAddresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(customerAddresses.customerId, customer.id));
      }

      const [address] = await tx
        .insert(customerAddresses)
        .values({ ...input, customerId: customer.id })
        .returning(customerAddressViewModelSelection);

      await tx.insert(auditLogs).values({
        accountId,
        action: "address.created",
        targetType: "customer_address",
        targetId: address.id,
        result: "success",
        metadata: { addressId: address.id, addressType: input.type, isDefault: input.isDefault },
      });

      return address;
    });
  }

  async update(accountId: string, id: string, input: AddressInput): Promise<CustomerAddressViewModel | null> {
    const db = createDatabaseClient();
    return db.transaction(async (tx) => {
      const [ownedAddress] = await tx
        .select({ id: customerAddresses.id, customerId: customerAddresses.customerId })
        .from(customerAddresses)
        .innerJoin(customers, eq(customerAddresses.customerId, customers.id))
        .where(and(eq(customerAddresses.id, id), eq(customers.accountId, accountId)))
        .limit(1);
      if (!ownedAddress) return null;

      if (input.isDefault) {
        await tx
          .update(customerAddresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(customerAddresses.customerId, ownedAddress.customerId));
      }

      const [address] = await tx
        .update(customerAddresses)
        .set({ ...input, updatedAt: new Date() })
        .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, ownedAddress.customerId)))
        .returning(customerAddressViewModelSelection);

      await tx.insert(auditLogs).values({
        accountId,
        action: "address.updated",
        targetType: "customer_address",
        targetId: id,
        result: "success",
        metadata: { addressId: id, addressType: input.type, isDefault: input.isDefault },
      });

      return address;
    });
  }

  async setDefault(accountId: string, id: string): Promise<CustomerAddressViewModel | null> {
    const db = createDatabaseClient();
    return db.transaction(async (tx) => {
      const [ownedAddress] = await tx
        .select({
          id: customerAddresses.id,
          customerId: customerAddresses.customerId,
          type: customerAddresses.type,
          isDefault: customerAddresses.isDefault,
        })
        .from(customerAddresses)
        .innerJoin(customers, eq(customerAddresses.customerId, customers.id))
        .where(and(eq(customerAddresses.id, id), eq(customers.accountId, accountId)))
        .limit(1);
      if (!ownedAddress) return null;

      if (!ownedAddress.isDefault) {
        await tx
          .update(customerAddresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(customerAddresses.customerId, ownedAddress.customerId));
      }

      const [address] = await tx
        .update(customerAddresses)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, ownedAddress.customerId)))
        .returning(customerAddressViewModelSelection);

      if (!ownedAddress.isDefault) {
        await tx.insert(auditLogs).values({
          accountId,
          action: "address.default_changed",
          targetType: "customer_address",
          targetId: id,
          result: "success",
          metadata: { addressId: id, addressType: ownedAddress.type },
        });
      }

      return address;
    });
  }

  async delete(accountId: string, id: string): Promise<boolean> {
    const db = createDatabaseClient();
    return db.transaction(async (tx) => {
      const [ownedAddress] = await tx
        .select({
          id: customerAddresses.id,
          customerId: customerAddresses.customerId,
          type: customerAddresses.type,
          isDefault: customerAddresses.isDefault,
        })
        .from(customerAddresses)
        .innerJoin(customers, eq(customerAddresses.customerId, customers.id))
        .where(and(eq(customerAddresses.id, id), eq(customers.accountId, accountId)))
        .limit(1);
      if (!ownedAddress) return false;

      await tx
        .delete(customerAddresses)
        .where(and(eq(customerAddresses.id, id), eq(customerAddresses.customerId, ownedAddress.customerId)));

      if (ownedAddress.isDefault) {
        await tx
          .update(customerAddresses)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(customerAddresses.customerId, ownedAddress.customerId));

        const [replacement] = await tx
          .select({ id: customerAddresses.id })
          .from(customerAddresses)
          .where(and(eq(customerAddresses.customerId, ownedAddress.customerId), ne(customerAddresses.id, id)))
          .orderBy(asc(customerAddresses.createdAt), asc(customerAddresses.id))
          .limit(1);

        if (replacement) {
          await tx
            .update(customerAddresses)
            .set({ isDefault: true, updatedAt: new Date() })
            .where(eq(customerAddresses.id, replacement.id));
        }
      }

      await tx.insert(auditLogs).values({
        accountId,
        action: "address.deleted",
        targetType: "customer_address",
        targetId: id,
        result: "success",
        metadata: { addressId: id, addressType: ownedAddress.type, isDefault: ownedAddress.isDefault },
      });

      return true;
    });
  }
}
