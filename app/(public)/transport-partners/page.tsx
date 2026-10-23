import Link from 'next/link';
import {getUiText} from '@/lib/i18n/server';
import TransportPartnerInterest from '@/components/TransportPartnerInterest';
import styles from '@/components/TransportPartnerInterest.module.css';
export const metadata={title:'Logistics service provider listings | MirtPage',robots:{index:false,follow:true}};
export default async function TransportPartners(){
 const t=await getUiText();
 return <main className={styles.page}><Link className={styles.back} href="/about">← {t('About MirtPage')}</Link><p>{t('For independent logistics service providers')}</p><h1>{t('Get listed on MirtPage')}</h1><p>{t('Freight brokerages, parcel express companies, and hub-and-spoke logistics operators can ask to be listed on MirtPage. Tell us about your company and we’ll contact you.')}</p><TransportPartnerInterest/></main>;
}
