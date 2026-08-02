export type SupportNotificationResult = "skipped" | "sent" | "failed";

export async function notifySupportQueue(
  conversation: { id: number; publicRef: string; businessName: string; assignedUserName?: string | null },
  options: { send?: typeof fetch; timeoutMs?: number } = {},
): Promise<SupportNotificationResult> {
  const token = process.env.MIRTPAGE_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.MIRTPAGE_TELEGRAM_SUPPORT_CHAT_ID;
  if (!token || !chatId) return "skipped";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
  try {
    const response = await (options.send || fetch)(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(options.timeoutMs ?? 5_000),
        body: JSON.stringify({
          chat_id: chatId,
          text: `New MirtPage support request ${conversation.publicRef} from ${conversation.businessName}.${conversation.assignedUserName ? ` Assigned to ${conversation.assignedUserName}.` : " Waiting for an available agent."}\n${appUrl}/dashboard/support/${conversation.id}`,
          disable_web_page_preview: true,
        }),
      },
    );
    if (!response.ok) throw new Error("provider_non_success");
    return "sent";
  } catch {
    console.error("Support queue notification failed", { category: "provider_failure" });
    return "failed";
  }
}
