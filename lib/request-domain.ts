import type { ServiceRequestStatus, ServiceRequestType } from "./types";

export const MAX_REQUEST_TEXT = 10_000;
export const MAX_PUBLIC_INTEREST_TEXT = 2_000;
export const REQUEST_STATUSES: ReadonlySet<ServiceRequestStatus> = new Set([
  "submitted", "under_review", "needs_information", "approved_for_work",
  "in_progress", "client_review", "client_approved", "published",
  "completed", "rejected", "cancelled",
]);
export const ACTIVE_SHOWROOM_PROJECT_STATUSES: readonly ServiceRequestStatus[] = [
  "submitted",
  "under_review",
  "needs_information",
  "approved_for_work",
  "in_progress",
  "client_review",
  "client_approved",
];
export const TERMINAL_SHOWROOM_PROJECT_STATUSES: readonly ServiceRequestStatus[] = [
  "published",
  "completed",
  "rejected",
  "cancelled",
];

export function isActiveShowroomProjectStatus(status: ServiceRequestStatus) {
  return ACTIVE_SHOWROOM_PROJECT_STATUSES.includes(status);
}
export const REVIEW_REQUEST_STATUSES: readonly ServiceRequestStatus[] = [
  "submitted", "under_review", "needs_information", "approved_for_work",
  "in_progress", "rejected", "cancelled",
];

const REVIEW_TRANSITIONS: Record<ServiceRequestStatus, ReadonlySet<ServiceRequestStatus>> = {
  submitted: new Set(["under_review", "needs_information", "rejected", "cancelled"]),
  under_review: new Set(["needs_information", "approved_for_work", "rejected", "cancelled"]),
  needs_information: new Set(["under_review", "rejected", "cancelled"]),
  approved_for_work: new Set(["in_progress", "cancelled"]),
  in_progress: new Set(["needs_information", "cancelled"]),
  client_review: new Set(), client_approved: new Set(), published: new Set(), completed: new Set(), rejected: new Set(), cancelled: new Set(),
};

export function isReviewTransitionAllowed(from: ServiceRequestStatus, to: ServiceRequestStatus) {
  return from === to || REVIEW_TRANSITIONS[from].has(to);
}

export function classifyShowroomRequest(state: { status:"active"|"draft"|"suspended"; contentVersion:number; retainedVersions:number }): ServiceRequestType {
  return state.status === "draft" && state.contentVersion === 1 && state.retainedVersions === 0 ? "onboarding" : "change";
}

export type PublicInterestInput = {
  contactName: string;
  contactValue: string;
  businessName: string;
  requestText: string;
  idempotencyKey: string;
  consent: boolean;
};

export type RequestImageInput = {
  originalName: string;
  claimedType: string;
  bytes: Buffer;
};

export class RequestError extends Error {
  constructor(message: string, public status = 400, public retryAfter = 0) {
    super(message);
  }
}

function text(value: unknown) {
  return String(value ?? "").trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function parsePublicInterestInput(raw: Record<string, unknown>): PublicInterestInput {
  const contactName = text(raw.contactName);
  const contactValue = text(raw.contactValue);
  const businessName = text(raw.businessName);
  const requestText = text(raw.requestText);
  const idempotencyKey = text(raw.idempotencyKey);
  const consent = raw.consent === true || raw.consent === "true" || raw.consent === "on" || raw.consent === "1";

  if (contactName.length < 2) throw new RequestError("Tell us your name.");
  if (contactName.length > 100) throw new RequestError("Your name must be 100 characters or fewer.");
  if (contactValue.length < 5) throw new RequestError("Enter a usable email, phone, or WhatsApp contact.");
  if (contactValue.length > 160) throw new RequestError("Your contact must be 160 characters or fewer.");
  if (businessName.length > 120) throw new RequestError("The business name must be 120 characters or fewer.");
  if (requestText.length < 10) throw new RequestError("Tell us briefly what kind of showroom you are interested in.");
  if (requestText.length > MAX_PUBLIC_INTEREST_TEXT) throw new RequestError(`Keep the interest message to ${MAX_PUBLIC_INTEREST_TEXT.toLocaleString("en-US")} characters or fewer.`);
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) throw new RequestError("The request session is invalid. Refresh and try again.");
  if (!consent) throw new RequestError("Confirm that MirtPage may use this information to review your request.");
  return { contactName, contactValue, businessName, requestText, idempotencyKey, consent };
}
