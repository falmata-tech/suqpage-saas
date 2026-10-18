import type {Metadata} from 'next';
import TrackingPortal from '@/components/TrackingPortal';
import {getUiText} from '@/lib/i18n/server';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{const t=await getUiText();return{title:t('Transport plan'),robots:{index:false,follow:false,nocache:true,noarchive:true},referrer:'no-referrer'};}
export default async function ShipmentPage({params}:{params:Promise<{reference:string}>}){const {reference}=await params;return <TrackingPortal key={reference} reference={reference}/>;}
