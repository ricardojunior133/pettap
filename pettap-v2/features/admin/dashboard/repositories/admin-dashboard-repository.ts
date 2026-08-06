import "server-only";

import { desc, sql } from "drizzle-orm";

import { auditLogs, orderItems, orders, orderStatusHistory } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { DashboardPeriod, DashboardSnapshot } from "../types";

const periodDays: Record<DashboardPeriod, number> = { "7d": 7, "30d": 30, "90d": 90 };

export interface AdminDashboardRepository {
  getSnapshot(period: DashboardPeriod): Promise<DashboardSnapshot>;
}

/**
 * Read-only aggregates for the private operations dashboard. Each query is
 * grouped in PostgreSQL; no customer records are hydrated for dashboard cards.
 */
export class DrizzleAdminDashboardRepository implements AdminDashboardRepository {
  async getSnapshot(period: DashboardPeriod): Promise<DashboardSnapshot> {
    const database = createDatabaseClient();
    const days = periodDays[period];
    const [summaryRows, productionRows, durationRows, revenueRows, eventRows, sizeRows, designRows, colourRows, activityRows] = await Promise.all([
      database.execute(sql`
        select
          coalesce(sum(grand_total_minor) filter (where payment_status = 'paid' and status not in ('cancelled', 'refunded')), 0)::int as total_revenue_minor,
          coalesce(sum(grand_total_minor) filter (where payment_status = 'paid' and status not in ('cancelled', 'refunded') and created_at >= date_trunc('day', now())), 0)::int as revenue_today_minor,
          coalesce(sum(grand_total_minor) filter (where payment_status = 'paid' and status not in ('cancelled', 'refunded') and created_at >= now() - interval '7 days'), 0)::int as revenue_7d_minor,
          coalesce(sum(grand_total_minor) filter (where payment_status = 'paid' and status not in ('cancelled', 'refunded') and created_at >= now() - interval '30 days'), 0)::int as revenue_30d_minor,
          count(*)::int as total_orders,
          count(*) filter (where created_at >= date_trunc('day', now()))::int as orders_today,
          count(*) filter (where created_at >= now() - interval '7 days')::int as orders_7d,
          count(*) filter (where created_at >= now() - interval '30 days')::int as orders_30d,
          count(*) filter (where payment_status = 'paid')::int as paid,
          count(*) filter (where status = 'in_production')::int as in_production,
          count(*) filter (where exists (select 1 from ${orderItems} as printed_item where printed_item.order_id = ${orders.id} and printed_item.production_status = 'completed'))::int as printed,
          count(*) filter (where fulfilment_status = 'ready')::int as packed,
          count(*) filter (where fulfilment_status = 'shipped')::int as shipped,
          count(*) filter (where fulfilment_status = 'delivered' or status = 'completed')::int as delivered,
          count(*) filter (where status = 'cancelled')::int as cancelled
        from ${orders}
      `),
      database.execute(sql`
        select
          count(*) filter (where fulfilment_status in ('unfulfilled', 'queued'))::int as waiting_production,
          count(*) filter (where status = 'in_production')::int as printing,
          count(*) filter (where fulfilment_status = 'in_production')::int as waiting_packing,
          count(*) filter (where fulfilment_status = 'ready')::int as waiting_shipping,
          count(*) filter (where (fulfilment_status = 'delivered' or status = 'completed') and completed_at >= date_trunc('day', now()))::int as delivered_today
        from ${orders}
        where payment_status = 'paid' and status not in ('cancelled', 'refunded')
      `),
      database.execute(sql`
        with events as (
          select order_id, new_status::text as stage, created_at from ${orderStatusHistory}
          union all
          select id, 'paid'::text, created_at from ${orders} where payment_status = 'paid'
          union all
          select target_id, 'printed'::text, created_at from ${auditLogs}
            where action = 'admin.order.production_updated' and metadata ->> 'nextStatus' = 'completed' and target_id is not null
        ), milestones as (
          select order_id,
            min(created_at) filter (where stage = 'paid') as paid_at,
            min(created_at) filter (where stage = 'in_production') as production_at,
            min(created_at) filter (where stage = 'printed') as printed_at,
            min(created_at) filter (where stage = 'ready_to_ship') as packed_at,
            min(created_at) filter (where stage = 'shipped') as shipped_at,
            min(created_at) filter (where stage = 'completed') as delivered_at
          from events group by order_id
        )
        select
          avg(extract(epoch from production_at - paid_at) / 3600) filter (where production_at is not null and paid_at is not null)::float as payment_to_production_hours,
          avg(extract(epoch from printed_at - production_at) / 3600) filter (where printed_at is not null and production_at is not null)::float as production_to_printed_hours,
          avg(extract(epoch from packed_at - printed_at) / 3600) filter (where packed_at is not null and printed_at is not null)::float as printed_to_packed_hours,
          avg(extract(epoch from shipped_at - packed_at) / 3600) filter (where shipped_at is not null and packed_at is not null)::float as packed_to_shipped_hours,
          avg(extract(epoch from delivered_at - shipped_at) / 3600) filter (where delivered_at is not null and shipped_at is not null)::float as shipped_to_delivered_hours,
          avg(extract(epoch from delivered_at - paid_at) / 3600) filter (where delivered_at is not null and paid_at is not null)::float as payment_to_delivered_hours
        from milestones
      `),
      database.execute(sql`
        select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
          coalesce(sum(grand_total_minor) filter (where payment_status = 'paid' and status not in ('cancelled', 'refunded')), 0)::int as revenue_minor
        from ${orders}
        where created_at >= current_date - (${days} - 1) * interval '1 day'
        group by date_trunc('day', created_at)
        order by date_trunc('day', created_at)
      `),
      database.execute(sql`
        select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
          count(*) filter (where payment_status = 'paid')::int as payments,
          count(*) filter (where status = 'in_production')::int as production,
          count(*) filter (where fulfilment_status = 'shipped')::int as shipped,
          count(*) filter (where fulfilment_status = 'delivered' or status = 'completed')::int as delivered
        from ${orders}
        where created_at >= current_date - (${days} - 1) * interval '1 day'
        group by date_trunc('day', created_at)
        order by date_trunc('day', created_at)
      `),
      database.execute(sql`select coalesce(personalisation ->> 'size', variant_name) as label, sum(quantity)::int as quantity from ${orderItems} group by 1 order by 2 desc, 1 asc limit 5`),
      database.execute(sql`select coalesce(personalisation ->> 'collection', personalisation ->> 'shape', product_name) as label, sum(quantity)::int as quantity from ${orderItems} group by 1 order by 2 desc, 1 asc limit 5`),
      database.execute(sql`select coalesce(personalisation ->> 'colour', 'Unspecified') as label, sum(quantity)::int as quantity from ${orderItems} group by 1 order by 2 desc, 1 asc limit 5`),
      database.select({ action: auditLogs.action, targetType: auditLogs.targetType, result: auditLogs.result, occurredAt: auditLogs.createdAt })
        .from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(12),
    ]);

    const first = <T extends Record<string, unknown>>(result: Iterable<T>) => Array.from(result)[0] ?? {} as T;
    const number = (value: unknown) => Number(value ?? 0);
    const summary = first(summaryRows);
    const production = first(productionRows);
    const durations = first(durationRows);
    const rank = (rows: Iterable<Record<string, unknown>>) => Array.from(rows).map((row) => ({ label: typeof row.label === "string" && row.label ? row.label : "Unspecified", quantity: number(row.quantity) }));

    return {
      revenue: { total: number(summary.total_revenue_minor), today: number(summary.revenue_today_minor), last7Days: number(summary.revenue_7d_minor), last30Days: number(summary.revenue_30d_minor) },
      orders: { total: number(summary.total_orders), today: number(summary.orders_today), last7Days: number(summary.orders_7d), last30Days: number(summary.orders_30d) },
      statuses: [
        { key: "paid", column: "paid" }, { key: "inProduction", column: "in_production" }, { key: "printed", column: "printed" },
        { key: "packed", column: "packed" }, { key: "shipped", column: "shipped" }, { key: "delivered", column: "delivered" }, { key: "cancelled", column: "cancelled" },
      ].map(({ key, column }) => ({ key, value: number(summary[column]) })),
      production: { waitingProduction: number(production.waiting_production), printing: number(production.printing), waitingPacking: number(production.waiting_packing), waitingShipping: number(production.waiting_shipping), deliveredToday: number(production.delivered_today) },
      durations: [
        { label: "Payment → Production", hours: number(durations.payment_to_production_hours) }, { label: "Production → Printed", hours: number(durations.production_to_printed_hours) },
        { label: "Printed → Packed", hours: number(durations.printed_to_packed_hours) }, { label: "Packed → Shipped", hours: number(durations.packed_to_shipped_hours) },
        { label: "Shipped → Delivered", hours: number(durations.shipped_to_delivered_hours) }, { label: "Payment → Delivered", hours: number(durations.payment_to_delivered_hours) },
      ],
      revenueSeries: Array.from(revenueRows).map((row) => ({ day: String(row.day), revenueMinor: number(row.revenue_minor) })),
      orderSeries: Array.from(eventRows).map((row) => ({ day: String(row.day), payments: number(row.payments), production: number(row.production), shipped: number(row.shipped), delivered: number(row.delivered) })),
      rankings: { sizes: rank(sizeRows), designs: rank(designRows), colours: rank(colourRows) },
      activity: activityRows.map((row) => ({ action: row.action, targetType: row.targetType, result: row.result, occurredAt: row.occurredAt.toISOString() })),
    };
  }
}
