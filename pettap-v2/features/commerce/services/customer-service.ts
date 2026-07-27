import "server-only";

import { getAuthenticatedAccountId } from "./commerce-account-service";

import { DrizzleCustomerRepository, type CustomerRecord, type CustomerRepository } from "../repositories/customer-repository";

export class CustomerService {
  constructor(
    private readonly repository: CustomerRepository = new DrizzleCustomerRepository(),
    private readonly resolveAccountId: () => Promise<string> = getAuthenticatedAccountId,
  ) {}

  async getCurrentCustomer(): Promise<CustomerRecord | null> {
    return this.repository.findByAccountId(await this.resolveAccountId());
  }
}
