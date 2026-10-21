export function inquiryContactLinks(method: string, value: string): Array<{label: "Call" | "Send SMS" | "Email"; href: string}> {
  const phone = value.replace(/[\s().-]/g, "");
  if (method === "phone" && /^\+?[0-9]{7,15}$/.test(phone)) return [
    {label:"Call",href:`tel:${phone}`}, {label:"Send SMS",href:`sms:${phone}`},
  ];
  if (method === "email" && /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(value)) return [{label:"Email",href:`mailto:${encodeURIComponent(value)}`}];
  return [];
}
