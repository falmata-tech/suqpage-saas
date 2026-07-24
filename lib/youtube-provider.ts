export type ControlledYouTubeAsset = {
  provider: "youtube";
  providerId: string;
  managedRef: `youtube:${string}`;
};

export class ControlledYouTubeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ControlledYouTubeError";
  }
}

const providerIdPattern = /^[A-Za-z0-9_-]{11}$/;

const fail = (message: string, code: string): never => {
  throw new ControlledYouTubeError(message, code);
};

function providerId(value: string | null): string {
  if (!value || !providerIdPattern.test(value)) {
    return fail("The YouTube video identifier is invalid.", "invalid_provider_id");
  }
  return value;
}

export function normalizeControlledYouTubeUrl(
  input: unknown,
): ControlledYouTubeAsset {
  if (typeof input !== "string" || !input.trim() || input.length > 500) {
    return fail("Enter a supported YouTube URL.", "invalid_url");
  }
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return fail("Enter a supported YouTube URL.", "invalid_url");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    url.searchParams.has("list")
  ) {
    return fail("This YouTube URL form is not supported.", "unsupported_url");
  }
  let id: string;
  if (url.hostname === "youtube.com" || url.hostname === "www.youtube.com") {
    if (url.pathname !== "/watch" || url.searchParams.getAll("v").length !== 1) {
      return fail("Use a standard YouTube watch URL.", "unsupported_url");
    }
    id = providerId(url.searchParams.get("v"));
  } else if (url.hostname === "youtu.be") {
    if (!/^\/[A-Za-z0-9_-]{11}$/.test(url.pathname)) {
      return fail("Use a standard YouTube share URL.", "unsupported_url");
    }
    id = providerId(url.pathname.slice(1));
  } else {
    return fail("Only YouTube watch and share URLs are supported.", "unsupported_host");
  }
  return { provider: "youtube", providerId: id, managedRef: `youtube:${id}` };
}

export function privacyEnhancedYouTubeEmbedUrl(input: unknown): string {
  if (typeof input !== "string" || !input.startsWith("youtube:")) {
    return fail("The managed YouTube reference is invalid.", "invalid_managed_ref");
  }
  const id = providerId(input.slice("youtube:".length));
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
