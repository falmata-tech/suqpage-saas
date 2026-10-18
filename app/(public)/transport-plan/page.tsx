import type {Metadata} from 'next';
import {getUiText} from '@/lib/i18n/server';
import SharedTransportPlan from '@/components/SharedTransportPlan';

export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{
 const t=await getUiText();
 return{title:t('Transport plan'),description:t('Providers in travel order'),robots:{index:false,follow:false,nocache:true,noarchive:true},referrer:'no-referrer',openGraph:{title:t('Transport plan'),description:t('Providers in travel order')},twitter:{title:t('Transport plan'),description:t('Providers in travel order')}};
}
export default function TransportPlanPage(){return <SharedTransportPlan/>;}
