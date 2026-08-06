export const trackingStages = ["payment_received", "production_started", "printed", "packed", "shipped", "delivered"] as const;

export type TrackingStage = (typeof trackingStages)[number];

const progress: Record<TrackingStage, number> = {
  payment_received: 10,
  production_started: 30,
  printed: 50,
  packed: 70,
  shipped: 90,
  delivered: 100,
};

export function calculateTrackingProgress(status: TrackingStage): number {
  return progress[status];
}
