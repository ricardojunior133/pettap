const DEFAULT_CURRENCY = "GBP";

/** Formats database money stored as integer minor units (for example, 2499 = £24.99). */
export function formatMoney(amountMinor: number, currency = DEFAULT_CURRENCY, locale = "en-GB"): string {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new RangeError("Money amounts must be safe integer minor units.");
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(amountMinor / 100);
}
