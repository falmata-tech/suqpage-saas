/** Presentation category; it grants no tenant or carrier authority. */
export type LogisticsServiceType = 'freight_brokerage' | 'parcel_express' | 'hub_and_spoke';

/** Current product offering, not tenant authorization or an editable carrier. */
export type TransportCoordinator = Readonly<{
  id: 'shared-trucks-logistics';
  name: string;
  shortName: string;
  serviceType: LogisticsServiceType;
  logoPath: string;
  websiteUrl: string;
}>;

export const TRANSPORT_COORDINATOR: TransportCoordinator = Object.freeze({
  id: 'shared-trucks-logistics',
  name: 'SharedTrucks Logistics',
  shortName: 'SharedTrucks Logistics',
  serviceType: 'freight_brokerage',
  logoPath: '/brands/sharedtrucks-logistics.png',
  websiteUrl: 'https://sharedtrucks.com/',
});

export type TransportCoordinatorSelection =
  | { ok: true; coordinator: TransportCoordinator }
  | { ok: false; code: 'unsupported_transport_coordinator' };

/** Missing selection is compatible with existing clients; explicit foreign IDs fail. */
export function selectTransportCoordinator(value?: unknown): TransportCoordinatorSelection {
  return value === undefined || value === TRANSPORT_COORDINATOR.id
    ? { ok: true, coordinator: TRANSPORT_COORDINATOR }
    : { ok: false, code: 'unsupported_transport_coordinator' };
}
