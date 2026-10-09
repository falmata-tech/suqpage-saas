import Link from 'next/link';
import {redirect} from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import OwnerCoverEditor from '@/components/OwnerCoverEditor';
import {requireUser} from '@/lib/auth';
import {runtimeBusinessById,runtimeCatalogByBusinessId} from '@/lib/catalog-runtime';
import {readOwnerPage} from '@/lib/owner-page-service';
import {ownerPagePort} from '@/lib/owner-page-runtime';
import {initialBusinessProfile} from '@/lib/business-profile';
import {getUiText} from '@/lib/i18n/server';
export const dynamic='force-dynamic';
export default async function CoverPage(){const actor=await requireUser();if(actor.access_role!=='client'||!actor.business_id)redirect('/dashboard');const id=actor.business_id;const [business,catalog,draft,t]=await Promise.all([runtimeBusinessById(id),runtimeCatalogByBusinessId(id,true),readOwnerPage(ownerPagePort,actor,id),getUiText()]);if(!catalog)redirect('/dashboard');return <DashboardShell user={actor} business={business||null}><Link className="btn secondary" href="/dashboard/profile">{t('Back to profile')}</Link><OwnerCoverEditor businessId={id} draft={draft} content={draft?.content||initialBusinessProfile(catalog)}/></DashboardShell>;}
