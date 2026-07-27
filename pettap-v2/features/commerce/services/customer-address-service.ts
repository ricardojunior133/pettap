import "server-only";
import { getAuthenticatedAccountId, type AccountResolver } from "./commerce-account-service";
import type { AddressInput } from "../schemas/address";
import { CustomerAddressRepository } from "../repositories/customer-address-repository";

type CustomerAddressRepositoryPort = Pick<
  CustomerAddressRepository,
  "listByCustomer" | "create" | "update" | "setDefault" | "delete"
>;

export class CustomerAddressService {
  constructor(
    private readonly repo: CustomerAddressRepositoryPort = new CustomerAddressRepository(),
    private readonly resolveAccountId: AccountResolver = getAuthenticatedAccountId,
  ) {}

  async list() {
    return this.repo.listByCustomer(await this.resolveAccountId());
  }

  async create(input: AddressInput) {
    const result = await this.repo.create(await this.resolveAccountId(), input);
    if (!result) throw new Error("Customer address is unavailable.");
    return result;
  }

  async update(id: string, input: AddressInput) {
    const result = await this.repo.update(await this.resolveAccountId(), id, input);
    if (!result) throw new Error("Address not found.");
    return result;
  }

  async setDefault(id: string) {
    const result = await this.repo.setDefault(await this.resolveAccountId(), id);
    if (!result) throw new Error("Address not found.");
    return result;
  }

  async delete(id: string) {
    if (!(await this.repo.delete(await this.resolveAccountId(), id))) {
      throw new Error("Address not found.");
    }
  }
}
