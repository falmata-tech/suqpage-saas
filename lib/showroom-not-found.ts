import { createUiText, type EnabledLocale, type UiMessages } from "./i18n/core";

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** A self-contained HTTP 404 document; it never interpolates a requested handle. */
export async function showroomNotFoundHtml(locale: EnabledLocale): Promise<string> {
  // Most requests never need a 404 document; load a language catalog only then.
  const messages: UiMessages = locale === "am" ? (await import("./i18n/messages/am.json")).default
    : locale === "om" ? (await import("./i18n/messages/om.json")).default : {};
  const text = createUiText(messages);
  const title = escapeHtml(text("Page not found."));
  const back = escapeHtml(text("Back to Market"));
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} · MirtPage</title><style>
    *{box-sizing:border-box}body{margin:0;min-height:100svh;background:#f4f4f2;color:#202428;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    header{height:74px;padding:0 clamp(18px,4vw,44px);display:flex;align-items:center;background:#fff;border-bottom:1px solid #dedfdd}header img{width:181px;height:auto;max-height:48px}
    main{min-height:calc(100svh - 74px);display:grid;place-items:center;padding:24px}.card{width:min(100%,520px);background:#fff;border:1px solid #dedfdd;border-radius:20px;padding:clamp(24px,5vw,42px);box-shadow:0 12px 34px #2024280d}
    .code{margin:0 0 8px;color:#c93600;font-size:.9rem;font-weight:800;letter-spacing:.12em}h1{margin:0;font-size:clamp(1.8rem,5vw,2.8rem);line-height:1.18;letter-spacing:-.035em}
    .action{display:inline-flex;align-items:center;justify-content:center;min-height:48px;margin-top:28px;padding:11px 20px;border-radius:10px;background:#c93600;color:#fff;font-weight:750;text-decoration:none}
    .action:hover{background:#a92f00}.action:focus-visible{outline:3px solid #ff4b00;outline-offset:3px}
  </style></head><body><header><a href="/" aria-label="MirtPage"><img src="/brand/mirtpage-panels-wordmark.svg" alt="MirtPage"></a></header><main><section class="card"><p class="code">404</p><h1>${title}</h1><a class="action" href="/">${back}</a></section></main></body></html>`;
}
