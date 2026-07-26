export type EventDemoPagination = { requestedPage: number; page: number; pageSize: number; total: number; totalPages: number; offset: number; from: number; to: number; hasPrevious: boolean; hasNext: boolean };

export function normalisePaginationAfterCount(requestedPage: number | undefined, total: number, pageSize = 20): EventDemoPagination {
  const safeSize = Math.min(50, Math.max(1, Number.isFinite(pageSize) ? Math.floor(pageSize) : 20));
  const requested = Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage ?? 1) : 1);
  const totalPages = Math.max(1, Math.ceil(total / safeSize));
  const page = Math.min(requested, totalPages);
  const from = total === 0 ? 0 : (page - 1) * safeSize + 1;
  const to = total === 0 ? 0 : Math.min(page * safeSize, total);
  return { requestedPage: requested, page, pageSize: safeSize, total, totalPages, offset: (page - 1) * safeSize, from, to, hasPrevious: page > 1 && total > 0, hasNext: page < totalPages && total > 0 };
}
