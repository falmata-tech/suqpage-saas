import Link from 'next/link';
import {getUiText} from '@/lib/i18n/server';
import TransportPartnerInterest from '@/components/TransportPartnerInterest';
import styles from '@/components/TransportPartnerInterest.module.css';
export const metadata={title:'Logistics service provider listings | AfricMade',robots:{index:false,follow:true}};
export default async function TransportPartners(){
 const t=await getUiText();
 return <main className={styles.page}><Link className={styles.back} href="/about">← {t('About AfricMade')}</Link><p>{t('For independent logistics service providers')}</p><h1>{t('Get listed on AfricMade')}</h1><p>{t('Freight brokerages, parcel express companies, and hub-and-spoke logistics operators can ask to be listed on AfricMade. Tell us about your company and we’ll contact you.')}</p><TransportPartnerInterest/></main>;
}
