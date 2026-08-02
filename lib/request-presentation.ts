import type { RequestEvent } from "./types";

export type PresentedRequestEvent = {
  label: string;
  detail: string;
};

const words = (value: string) => value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
const revisionNumber = (detail: string) => detail.match(/revision:(\d+)/)?.[1];

export function presentRequestEvent(event: Pick<RequestEvent, "event_type" | "detail">, clientView: boolean): PresentedRequestEvent {
  if (!clientView) return { label: words(event.event_type), detail: event.detail };

  switch (event.event_type) {
    case "submitted":
      return { label: "Request received", detail: "MirtPage received this request." };
    case "status_changed": {
      const nextStatus = event.detail.split("->").at(-1);
      return { label: "Status updated", detail: nextStatus ? `Request status changed to ${words(nextStatus)}.` : "The request status was updated." };
    }
    case "assigned":
      return { label: "Team assigned", detail: "A MirtPage team member was assigned to this request." };
    case "unassigned":
      return { label: "Assignment updated", detail: "The request returned to the MirtPage work queue." };
    case "invitation_created":
      return { label: "Invitation prepared", detail: "MirtPage prepared private workspace access." };
    case "invitation_accepted":
      return { label: "Workspace joined", detail: "The client workspace was activated." };
    case "revision_created":
      return { label: "Revision started", detail: "MirtPage started preparing a private showroom revision." };
    case "revision_submitted": {
      const number = revisionNumber(event.detail);
      return { label: "Preview ready", detail: number ? `Revision ${number} was sent for your review.` : "A private revision was sent for your review." };
    }
    case "revision_approved": {
      const number = revisionNumber(event.detail);
      return { label: "Revision approved", detail: number ? `You approved revision ${number}.` : "You approved the revision." };
    }
    case "revision_rejected": {
      const number = revisionNumber(event.detail);
      return { label: "Changes requested", detail: number ? `You requested changes to revision ${number}.` : "You requested changes to the revision." };
    }
    case "revision_published": {
      const number = revisionNumber(event.detail);
      return { label: "Showroom published", detail: number ? `Revision ${number} is now live.` : "The approved revision is now live." };
    }
    default:
      return { label: "Request updated", detail: "MirtPage recorded progress on this request." };
  }
}
