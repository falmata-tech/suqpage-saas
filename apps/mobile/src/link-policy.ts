/** No platform APIs here: merchant links are untrusted navigation input. */
export type LinkPlan = { url: string; kind: "website" | "handler"; appUrl?: string };
export const LINK_ERROR = "Could not open link";

export function planLink(input: string, appOrigin?: string): LinkPlan {
  const raw = input.trim();
  if (!raw || raw.length > 16384 || /[\u0000-\u001f\u007f\\]/u.test(raw)) throw Error(LINK_ERROR);
  let url: URL;
  try { url = new URL(raw); } catch { throw Error(LINK_ERROR); }
  if (url.username || url.password) throw Error(LINK_ERROR);
  if (["mailto:", "tel:", "sms:"].includes(url.protocol)) {
    if (!url.pathname || /%0[ad]/i.test(url.pathname)) throw Error(LINK_ERROR);
    return { kind: "handler", url: raw };
  }
  if ((url.protocol !== "https:" && !(url.protocol === "http:" && url.origin === appOrigin)) || !url.hostname) throw Error(LINK_ERROR);
  const plan: LinkPlan = { kind: "website", url: url.href };
  // Exact hosts only. Never forward arbitrary URL parameters into a custom scheme.
  if (!url.port && (url.hostname === "wa.me" || url.hostname === "api.whatsapp.com")) {
    const phone = url.hostname === "wa.me" ? url.pathname.slice(1).replace(/\/$/, "")
      : url.pathname === "/send" ? url.searchParams.get("phone") || "" : "";
    if (/^\d{7,15}$/.test(phone)) {
      const params = new URLSearchParams({ phone });
      if (url.searchParams.has("text")) params.set("text", url.searchParams.get("text")!);
      plan.appUrl = `whatsapp://send?${params}`;
    }
  }
  if (!url.port && ["t.me", "telegram.me"].includes(url.hostname)) {
    const username = url.pathname.slice(1).replace(/\/$/, "");
    const reserved = ["share", "joinchat", "addstickers", "addemoji", "proxy", "socks", "login", "confirmphone", "setlanguage", "addtheme", "addstyle", "auction", "auth", "call", "nft", "web", "a", "k", "z", "invoice", "boost", "giftcode", "contact", "addlist", "m", "c", "s"];
    const phone = /^\+[1-9]\d{7,14}$/.test(username) ? username.slice(1) : null;
    if ((phone || /^[a-z][a-z0-9_]{4,31}$/i.test(username) && !reserved.includes(username.toLowerCase())) && [...url.searchParams.keys()].every(key => ["text", "profile"].includes(key))) {
      const params = new URLSearchParams(phone ? { phone } : { domain: username });
      if (url.searchParams.has("text")) params.set("text", url.searchParams.get("text")!);
      if (url.searchParams.has("profile")) params.set("profile", "");
      plan.appUrl = `tg://resolve?${params}`;
    }
  }
  return plan;
}

export interface LinkPorts {
  native: boolean;
  appOrigin?: string;
  openHandler(url: string): Promise<unknown>;
  openWebsite(url: string): Promise<unknown>;
}
/** Launching/closing a destination never means an inquiry or payment succeeded. */
export async function followLink(input: string, ports: LinkPorts): Promise<void> {
  const plan = planLink(input, ports.appOrigin);
  try {
    if (plan.kind === "handler") { await ports.openHandler(plan.url); return; }
    if (ports.native && plan.appUrl) {
      try { await ports.openHandler(plan.appUrl); return; } catch { /* App unavailable: use HTTPS. */ }
    }
    await ports.openWebsite(plan.url);
  } catch { throw Error(LINK_ERROR); }
}

export type TextLinkPart = { text: string; url?: string };
export function descriptionLinks(text: string): TextLinkPart[] {
  const parts: TextLinkPart[] = [];
  const matcher = /(?:https:\/\/|www\.)[^\s<>"'\u0000-\u001f]+/giu;
  let end = 0;
  for (const match of text.matchAll(matcher)) {
    const start = match.index;
    if (start > 0 && !/[\s([{]/u.test(text[start - 1])) continue;
    let value = match[0].replace(/[.,;:!?]+$/u, "");
    for (const [open, close] of [["(", ")"], ["[", "]"], ["{", "}"]]) {
      while (value.endsWith(close) && value.split(close).length > value.split(open).length) value = value.slice(0, -1);
    }
    const url = /^www\./i.test(value) ? `https://${value}` : value;
    try {
      const plan = planLink(url);
      if (end < start) parts.push({ text: text.slice(end, start) });
      parts.push({ text: value, url: plan.url });
      end = start + value.length;
    } catch { /* Keep invalid text verbatim and inert. */ }
  }
  if (end < text.length) parts.push({ text: text.slice(end) });
  return parts;
}
