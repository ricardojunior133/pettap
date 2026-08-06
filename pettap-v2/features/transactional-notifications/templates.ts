import type { TransactionalEmail, TransactionalEmailPayload, TransactionalNotificationEvent } from "./types";

const subjects: Record<TransactionalNotificationEvent, string> = {
  payment_received: "We've received your order!",
  production_started: "We're crafting your PetTap",
  printed: "Your PetTap has been printed",
  packed: "Your order is packed",
  shipped: "Your PetTap is on the way",
  delivered: "Your PetTap has arrived",
  order_cancelled: "Your PetTap order has been cancelled",
};

const copy: Record<TransactionalNotificationEvent, string> = {
  payment_received: "Thank you — your order is confirmed.",
  production_started: "Our team has started crafting your personalised PetTap.",
  printed: "Your PetTap has been printed and is moving through our quality checks.",
  packed: "Your order is packed and ready for its journey.",
  shipped: "Your PetTap is on its way.",
  delivered: "Your PetTap has arrived. You can now activate it and keep your pet protected.",
  order_cancelled: "Your PetTap order has been cancelled. Please contact us if you need any help.",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "https://pettap.co.uk";
  } catch {
    return "https://pettap.co.uk";
  }
}

export type TransactionalEmailBrand = {
  supportEmail?: string;
};

export function renderTransactionalEmail(
  template: TransactionalNotificationEvent,
  to: string,
  payload: TransactionalEmailPayload,
  brand: TransactionalEmailBrand = {},
): TransactionalEmail {
  const supportEmail = brand.supportEmail || "support@pettap.co.uk";
  const orderUrl = safeUrl(payload.orderTrackingUrl);
  const accountUrl = safeUrl(payload.accountUrl);
  const carrierUrl = payload.carrierTrackingUrl ? safeUrl(payload.carrierTrackingUrl) : null;
  const isShippingUpdate = template === "shipped" || template === "delivered";
  const actionUrl = isShippingUpdate ? orderUrl : accountUrl;
  const actionLabel = isShippingUpdate ? "Track your order" : "View your order";
  const trackingText = payload.trackingNumber
    ? `Tracking: ${payload.trackingNumber}${payload.carrier ? ` (${payload.carrier})` : ""}`
    : null;
  const externalCarrierText = carrierUrl && payload.carrier ? `Track with ${payload.carrier}: ${carrierUrl}` : null;
  const siteUrl = new URL(orderUrl).origin;
  const body = [
    copy[template],
    "",
    `Order ${payload.orderNumber}`,
    `${payload.petName}'s PetTap: ${payload.summary}`,
    trackingText,
    "",
    `${actionLabel}: ${actionUrl}`,
    externalCarrierText,
    "",
    `Support: ${supportEmail}`,
    "PetTap · Designed in the UK",
  ].filter((line): line is string => Boolean(line)).join("\n");

  const externalCarrierLink = carrierUrl && payload.carrier
    ? `<p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#525252">Prefer the carrier site? <a href="${escapeHtml(carrierUrl)}" style="color:#171717;font-weight:700">Track with ${escapeHtml(payload.carrier)}</a>.</p>`
    : "";
  const tracking = trackingText
    ? `<p style="margin:0 0 24px;padding:14px 16px;border-radius:12px;background:#f5f5f5;font-size:14px;line-height:22px;color:#404040"><strong style="color:#171717">${escapeHtml(trackingText)}</strong></p>`
    : "";
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="color-scheme" content="light dark"/><meta name="supported-color-schemes" content="light dark"/>
<style>@media (prefers-color-scheme: dark) { .email-surface { background:#1b1b1b !important; } .email-text { color:#f5f5f5 !important; } .email-muted { color:#c7c7c7 !important; } .email-rule { border-color:#3a3a3a !important; } }</style></head>
<body style="margin:0;padding:0;background:#f5f5f4;color:#171717;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f5f4"><tr><td style="padding:32px 16px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;margin:0 auto"><tr><td class="email-surface" style="background:#ffffff;border-radius:24px;padding:40px">
      <p class="email-text" style="margin:0 0 28px;font-size:16px;font-weight:800;letter-spacing:-.04em;color:#171717">Pet<span style="color:#737373">Tap</span></p>
      <h1 class="email-text" style="margin:0 0 16px;font-size:28px;line-height:34px;letter-spacing:-.04em;color:#171717">${escapeHtml(subjects[template])}</h1>
      <p class="email-text" style="margin:0 0 24px;font-size:16px;line-height:25px;color:#262626">${escapeHtml(copy[template])}</p>
      <p class="email-text" style="margin:0 0 24px;font-size:15px;line-height:24px;color:#262626"><strong>Order ${escapeHtml(payload.orderNumber)}</strong><br/>${escapeHtml(payload.petName)}'s PetTap · ${escapeHtml(payload.summary)}</p>
      ${tracking}
      <p style="margin:0 0 24px"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;border-radius:10px;background:#171717;color:#ffffff;padding:13px 18px;font-size:15px;font-weight:700;text-decoration:none">${actionLabel}</a></p>
      ${externalCarrierLink}
      <hr class="email-rule" style="margin:28px 0;border:0;border-top:1px solid #e5e5e5"/>
      <p class="email-muted" style="margin:0 0 8px;font-size:13px;line-height:20px;color:#666666">Questions? <a href="mailto:${escapeHtml(supportEmail)}" style="color:#404040">${escapeHtml(supportEmail)}</a></p>
      <p class="email-muted" style="margin:0;font-size:12px;line-height:20px;color:#737373"><a href="${escapeHtml(siteUrl)}" style="color:#737373">pettap.co.uk</a> · <a href="${escapeHtml(new URL('/privacy', siteUrl).toString())}" style="color:#737373">Privacy</a> · <a href="${escapeHtml(new URL('/terms', siteUrl).toString())}" style="color:#737373">Terms</a></p>
    </td></tr></table>
  </td></tr></table>
</body></html>`;

  return { to, subject: subjects[template], template, html, text: body, payload };
}
