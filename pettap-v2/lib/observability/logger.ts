import "server-only";

type LogLevel = "info" | "warn" | "error";
type SafeContext = Record<string, boolean | number | string | null | undefined>;

const forbidden = /password|secret|token|authorization|cookie|email|phone|address|stripe|payload/i;

function safeContext(context: SafeContext) {
  return Object.fromEntries(Object.entries(context).filter(([key]) => !forbidden.test(key)));
}

/** JSON logs are consumed by Vercel and can later be forwarded to Sentry. */
export function logEvent(level: LogLevel, event: string, context: SafeContext = {}) {
  const entry = JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...safeContext(context) });
  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.info(entry);
}
