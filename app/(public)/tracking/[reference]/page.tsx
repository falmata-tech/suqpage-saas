import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = { referrer: 'no-referrer' };

export default function RetiredTransportPage() {
  notFound();
}
