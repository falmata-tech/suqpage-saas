import type { Business } from "./types";

export type NotificationResult = "skipped" | "sent" | "failed";

type NotificationOptions = {
  send?: typeof fetch;
  timeoutMs?: number;
};

export async function notifyNewInquiry(
  business: Business,
  inquiryId: number,
  customerName: string,
  options: NotificationOptions = {},
): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const configuredFrom = process.env.NOTIFICATION_FROM_EMAIL || "";
  const address = configuredFrom.includes("<")
    ? /^[^<>\r\n]*<([^<>\r\n]+)>$/.exec(configuredFrom)?.[1]
    : configuredFrom;
  if (!apiKey || !address || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(address) || !business.contact_email) return "skipped";
  const from = `AfricMade <${address}>`;
  const send = options.send ?? fetch;
  try {
    const response = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(options.timeoutMs ?? 5_000),
      body: JSON.stringify({
        from,
        to: [business.contact_email],
        subject: `New AfricMade enquiry #${inquiryId}`,
        text: `${customerName} sent an enquiry to ${business.name}. Sign in to AfricMade to review it.`,
      }),
    });
    if (!response.ok) throw new Error("provider_non_success");
    return "sent";
  } catch {
    console.error("Inquiry notification failed", { category: "provider_failure" });
    return "failed";
  }
}
