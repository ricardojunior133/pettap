import { describe, expect, it, vi } from "vitest";

import type { AdminDashboardRepository } from "@/features/admin/dashboard/repositories/admin-dashboard-repository";
import { AdminDashboardService, formatOperationalDuration, parseDashboardPeriod } from "@/features/admin/dashboard/services/admin-dashboard-service";
import type { DashboardSnapshot } from "@/features/admin/dashboard/types";

const snapshot: DashboardSnapshot = {
  revenue: { total: 4998, today: 2499, last7Days: 4998, last30Days: 4998 },
  orders: { total: 2, today: 1, last7Days: 2, last30Days: 2 },
  statuses: [{ key: "paid", value: 2 }, { key: "inProduction", value: 1 }, { key: "printed", value: 1 }, { key: "packed", value: 0 }, { key: "shipped", value: 0 }, { key: "delivered", value: 0 }, { key: "cancelled", value: 0 }],
  production: { waitingProduction: 1, printing: 1, waitingPacking: 0, waitingShipping: 0, deliveredToday: 0 },
  durations: [{ label: "Payment → Production", hours: 3 }, { label: "Production → Printed", hours: 26 }, { label: "Printed → Packed", hours: 0 }, { label: "Packed → Shipped", hours: 4 }, { label: "Shipped → Delivered", hours: 48 }, { label: "Payment → Delivered", hours: 81 }],
  revenueSeries: [{ day: "2026-07-01", revenueMinor: 2499 }],
  orderSeries: [{ day: "2026-07-01", payments: 1, production: 1, shipped: 0, delivered: 0 }],
  rankings: { sizes: [{ label: "Classic", quantity: 2 }], designs: [{ label: "Round", quantity: 2 }], colours: [{ label: "Black", quantity: 2 }] },
  activity: [{ action: "admin.order.production_updated", targetType: "order", result: "success", occurredAt: "2026-07-01T10:00:00.000Z" }],
};

function repository(): AdminDashboardRepository { return { getSnapshot: vi.fn().mockResolvedValue(snapshot) }; }

describe("admin dashboard service", () => {
  it("authorizes before returning an aggregated dashboard view model", async () => {
    const repo = repository();
    const authorize = vi.fn().mockResolvedValue(undefined);
    const dashboard = await new AdminDashboardService(repo, authorize).getDashboard("7d");
    expect(authorize).toHaveBeenCalledOnce();
    expect(repo.getSnapshot).toHaveBeenCalledWith("7d");
    expect(dashboard.statusTotal).toBe(4);
    expect(dashboard.activity[0]).not.toHaveProperty("accountId");
  });

  it("uses safe period defaults and normalizes period filters", () => {
    expect(parseDashboardPeriod("7d")).toBe("7d");
    expect(parseDashboardPeriod("90d")).toBe("90d");
    expect(parseDashboardPeriod("all-time")).toBe("30d");
    expect(parseDashboardPeriod(undefined)).toBe("30d");
  });

  it("formats average operational times in a human-readable unit", () => {
    expect(formatOperationalDuration(3.4)).toBe("3h");
    expect(formatOperationalDuration(36)).toBe("1.5d");
    expect(formatOperationalDuration(0)).toBe("Not enough data");
  });
});
