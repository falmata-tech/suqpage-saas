/** Customer-facing copy only; transport request and staff contracts stay separate. */
export const TRANSPORT_COPY = {
  launcherTitle: "Need Transport?",
  launcherSubtitle: "Talk to a live transport agent",
  title: "Transport chat",
  invitation: "Need to move goods?",
  description: "Share the pickup and destination. A live transport agent can discuss options with the provider you choose.",
  waitingStatus: "Waiting for a SharedTrucks live agent",
  waiting: "A SharedTrucks live agent will join to arrange your shipment. We’ll reply here.",
  busyStatus: "SharedTrucks agents are helping other customers",
  elapsed: "Wait so far {value1} / 03:30",
  busy: "The SharedTrucks team is helping other customers right now. Please wait a little longer.",
  callbackHeading: "The SharedTrucks team is helping other customers right now.",
  callbackDescription: "Leave your contact details and they’ll get in touch as soon as possible.",
  callbackPhone: "Phone",
  callbackEmail: "Email (optional)",
  callbackSubmit: "Send contact details",
  callbackReceivedHeading: "Your request has been sent.",
  callbackReceived: "The SharedTrucks team will contact you using the details below.",
  callbackPhoneRequired: "Enter a phone number so the team can reach you.",
  callbackInvalidEmail: "Enter a valid email address, or leave it blank.",
} as const;

export const OWNER_TRANSPORT_COPY = {
  invitation: "Moving goods for your business?",
  description: "Share the pickup and destination for incoming stock or customer orders. A live transport agent can discuss options with the provider you choose.",
} as const;

export const LOGISTICS_PROVIDER_COPY = {
  label: "Logistics service provider",
  choose: "Choose a logistics service provider",
  description: "Matches compatible freight with shared truck space and coordinates the shipment.",
  availability: "1 company available",
  freightBrokerage: "Freight brokerage",
  parcelExpress: "Parcel express delivery",
  hubAndSpoke: "Hub-and-spoke logistics",
} as const;
