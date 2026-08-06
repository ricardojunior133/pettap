import "server-only";

import { generateEventDemoPublicCode } from "../security/tokens";
import { createEventDemoTagSchema, type CreateEventDemoTagInput } from "../schemas/event-demo";
import { EventDemoTagRepository, type EventDemoTagRecord } from "../repositories/event-demo-tag-repository";

export class EventDemoTagService {
  constructor(private readonly repository: Pick<EventDemoTagRepository, "create" | "findByPublicCode"> = new EventDemoTagRepository()) {}

  async create(input: CreateEventDemoTagInput): Promise<EventDemoTagRecord> {
    const validated = createEventDemoTagSchema.parse(input);
    // A collision is cryptographically unlikely; retry once defensively before surfacing an error.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const publicCode = generateEventDemoPublicCode();
      if (await this.repository.findByPublicCode(publicCode)) continue;
      return this.repository.create({ ...validated, publicCode });
    }
    throw new Error("Could not allocate a unique Event Demo public code.");
  }
}
