import { STARTER_VIDEO_REF } from "./business-starter";

export function retainedVideo(ref: string, current: readonly string[]): boolean {
  return !ref || ref === STARTER_VIDEO_REF || current.includes(ref);
}

export function videoSourceUrl(input: unknown): string {
  if (typeof input !== "string" || input.length > 1500) throw new Error("Add a valid HTTPS video link.");
  const url = new URL(input.trim());
  if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".") || /^(?:\d+\.|\[)/.test(url.hostname) || /\.(?:local|internal)$/.test(url.hostname)) throw new Error("Add a valid HTTPS video link.");
  return url.href;
}
