export type DashboardPeriod = "7d" | "30d" | "90d";

export type DashboardSnapshot = {
  revenue: { total: number; today: number; last7Days: number; last30Days: number };
  orders: { total: number; today: number; last7Days: number; last30Days: number };
  statuses: Array<{ key: string; value: number }>;
  production: { waitingProduction: number; printing: number; waitingPacking: number; waitingShipping: number; deliveredToday: number };
  durations: Array<{ label: string; hours: number }>;
  revenueSeries: Array<{ day: string; revenueMinor: number }>;
  orderSeries: Array<{ day: string; payments: number; production: number; shipped: number; delivered: number }>;
  rankings: { sizes: Array<{ label: string; quantity: number }>; designs: Array<{ label: string; quantity: number }>; colours: Array<{ label: string; quantity: number }> };
  activity: Array<{ action: string; targetType: string; result: string; occurredAt: string }>;
};

export type AdminDashboardViewModel = DashboardSnapshot & { period: DashboardPeriod; statusTotal: number };
