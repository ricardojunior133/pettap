import "server-only";

import { requireAdminPermission } from "@/lib/auth/require-admin";

import { DrizzleAdminDashboardRepository, type AdminDashboardRepository } from "../repositories/admin-dashboard-repository";
import type { AdminDashboardViewModel, DashboardPeriod } from "../types";

export const dashboardPeriods = ["7d", "30d", "90d"] as const;

export function parseDashboardPeriod(value: string | undefined): DashboardPeriod {
  return dashboardPeriods.includes(value as DashboardPeriod) ? value as DashboardPeriod : "30d";
}

export function formatOperationalDuration(hours: number) {
  if (!Number.isFinite(hours) || hours <= 0) return "Not enough data";
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${(hours / 24).toFixed(hours >= 240 ? 0 : 1)}d`;
}

export class AdminDashboardService {
  constructor(
    private readonly repository: AdminDashboardRepository = new DrizzleAdminDashboardRepository(),
    private readonly authorize: () => Promise<unknown> = () => requireAdminPermission("admin.dashboard.read"),
  ) {}

  async getDashboard(period: DashboardPeriod = "30d"): Promise<AdminDashboardViewModel> {
    await this.authorize();
    const snapshot = await this.repository.getSnapshot(period);
    return { ...snapshot, period, statusTotal: snapshot.statuses.reduce((total, item) => total + item.value, 0) };
  }
}
