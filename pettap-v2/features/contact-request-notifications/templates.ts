import type { ContactNotificationEmail } from "./types";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function safeSiteUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : new URL("https://pettap.co.uk");
  } catch { return new URL("https://pettap.co.uk"); }
}

export type FinderContactEmailInput = {
  recipientEmail: string;
  petName: string | null;
  finderName: string;
  finderContact: string;
  message: string;
  idempotencyKey: string;
  siteUrl: string;
};

/** Escapes every finder-controlled field before it becomes email markup. */
export function renderFinderContactEmail(input: FinderContactEmailInput): ContactNotificationEmail {
  const inboxUrl = new URL("/account/contact-requests", safeSiteUrl(input.siteUrl)).toString();
  const pet = input.petName?.trim() || "your pet";
  const text = [
    "Someone may have found your pet",
    "",
    `A person sent a private message about ${pet}.`,
    `Name: ${input.finderName}`,
    `Contact: ${input.finderContact}`,
    "",
    input.message,
    "",
    `Open your private inbox: ${inboxUrl}`,
    "Please avoid sharing sensitive personal information unless necessary.",
    "PetTap",
  ].join("\n");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;background:#f7f7f5;color:#171717;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:auto;background:#fff;border-radius:24px"><tr><td style="padding:36px"><p style="margin:0 0 24px;font-weight:800;font-size:18px">PetTap</p><h1 style="margin:0 0 16px;font-size:28px;line-height:34px">Someone may have found your pet</h1><p style="line-height:24px">A person sent a private message about ${escapeHtml(pet)}.</p><p style="line-height:24px"><strong>Name:</strong> ${escapeHtml(input.finderName)}<br/><strong>Contact:</strong> ${escapeHtml(input.finderContact)}</p><p style="white-space:pre-wrap;line-height:24px;border-left:3px solid #e5e5e5;padding-left:16px">${escapeHtml(input.message)}</p><p><a href="${escapeHtml(inboxUrl)}" style="display:inline-block;background:#171717;color:#fff;text-decoration:none;padding:13px 18px;border-radius:10px;font-weight:700">Open your private inbox</a></p><p style="color:#525252;font-size:13px;line-height:20px">Please avoid sharing sensitive personal information unless necessary.</p></td></tr></table></td></tr></table></body></html>`;
  return { to: input.recipientEmail, subject: "Someone may have found your pet", html, text, idempotencyKey: input.idempotencyKey };
}
