import AfricMadeBrand from '@/components/AfricMadeBrand';
import BlockedBusinessList from '@/components/BlockedBusinessList';
import PublicMobileNavigation from '@/components/PublicMobileNavigation';
import {getUiText} from '@/lib/i18n/server';
export default async function Page(){const t=await getUiText();return <><main className="section public-mobile-page"><div className="container legal"><AfricMadeBrand/><h1>{t('Blocked businesses')}</h1><BlockedBusinessList/></div></main><PublicMobileNavigation/></>;}
