import "server-only";

import type { PublicOrderTrackingRepositoryContract, PublicTrackingRecord } from "../repositories/public-order-tracking-repository";
import { PublicOrderTrackingRepository } from "../repositories/public-order-tracking-repository";
import { calculateTrackingProgress, trackingStages, type TrackingStage } from "./tracking-progress";

const stageContent: Record<TrackingStage, { title: string; description: string }> = {
  payment_received: { title: "Payment received", description: "Your personalised PetTap is confirmed." },
  production_started: { title: "Production started", description: "We’re crafting your PetTap." },
  printed: { title: "Printed", description: "Your PetTap has been printed and quality checked." },
  packed: { title: "Packed", description: "Your order is packed and ready for its journey." },
  shipped: { title: "Shipped", description: "Your PetTap is on its way." },
  delivered: { title: "Delivered", description: "Your PetTap has arrived safely." },
};

export type PublicTrackingTimelineEntry = {
  type: TrackingStage;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  occurredAt: string | null;
};

export type PublicTrackingViewModel = {
  orderNumber: string;
  status: string;
  createdAt: string;
  pet: { name: string };
  product: { design: string; colour: string; size: string };
  shipping: { carrier: string | null; trackingNumber: string | null; trackingUrl: string | null; shippedAt: string | null; deliveredAt: string | null };
  progress: number;
  timeline: PublicTrackingTimelineEntry[];
};

function safeUrl(value: string | null) {
  try {
    const url = value ? new URL(value) : null;
    return url && ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function firstNotification(record: PublicTrackingRecord, type: TrackingStage): Date | null {
  const notification = record.notifications.find((entry) => entry.notificationType === type);
  return notification ? (notification.sentAt ?? notification.createdAt) : null;
}

function firstHistory(record: PublicTrackingRecord, predicate: (entry: PublicTrackingRecord["history"][number]) => boolean): Date | null {
  return record.history.find(predicate)?.createdAt ?? null;
}

function stageDates(record: PublicTrackingRecord): Record<TrackingStage, Date | null> {
  return {
    payment_received: firstNotification(record, "payment_received") ?? record.order.createdAt,
    production_started: firstNotification(record, "production_started") ?? firstHistory(record, (entry) => entry.newStatus === "in_production"),
    printed: firstNotification(record, "printed") ?? firstHistory(record, (entry) => entry.reason?.includes("to completed") ?? false),
    packed: firstNotification(record, "packed") ?? firstHistory(record, (entry) => entry.newStatus === "ready_to_ship"),
    shipped: record.fulfilment?.shippedAt ?? firstNotification(record, "shipped") ?? firstHistory(record, (entry) => entry.newStatus === "shipped"),
    delivered: record.fulfilment?.deliveredAt ?? firstNotification(record, "delivered") ?? firstHistory(record, (entry) => entry.newStatus === "completed"),
  };
}

function statusLabel(record: PublicTrackingRecord, currentStage: TrackingStage) {
  if (record.order.status === "cancelled") return "Order cancelled";
  return stageContent[currentStage].title;
}

export class PublicOrderTrackingService {
  constructor(private readonly repository: PublicOrderTrackingRepositoryContract = new PublicOrderTrackingRepository()) {}

  async get(orderNumber: string): Promise<PublicTrackingViewModel | null> {
    const normalized = orderNumber.trim().toUpperCase();
    if (!/^PT-[A-Z0-9]{8,20}$/.test(normalized)) return null;
    const record = await this.repository.findByOrderNumber(normalized);
    if (!record) return null;

    const dates = stageDates(record);
    const currentIndex = Math.max(0, ...trackingStages.map((stage, index) => dates[stage] ? index : -1));
    const currentStage = trackingStages[currentIndex] ?? "payment_received";
    const personalisation = record.item?.personalisation;
    const design = personalisation?.design ?? personalisation?.collection ?? personalisation?.shape ?? record.item?.variantName ?? "PetTap tag";
    const timeline = trackingStages.map((type, index) => ({
      type,
      ...stageContent[type],
      completed: index < currentIndex,
      current: index === currentIndex,
      occurredAt: dates[type]?.toISOString() ?? null,
    }));

    return {
      orderNumber: record.order.orderNumber,
      status: statusLabel(record, currentStage),
      createdAt: record.order.createdAt.toISOString(),
      pet: { name: personalisation?.petName?.trim() || "Your pet" },
      product: { design, colour: personalisation?.colour ?? "Selected colour", size: personalisation?.size ?? "Selected size" },
      shipping: {
        carrier: record.fulfilment?.provider ?? null,
        trackingNumber: record.fulfilment?.trackingNumber ?? null,
        trackingUrl: safeUrl(record.fulfilment?.trackingUrl ?? null),
        shippedAt: record.fulfilment?.shippedAt?.toISOString() ?? null,
        deliveredAt: record.fulfilment?.deliveredAt?.toISOString() ?? null,
      },
      progress: calculateTrackingProgress(currentStage),
      timeline,
    };
  }
}
