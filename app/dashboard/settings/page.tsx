import Link from 'next/link';
import {redirect} from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import HandleSettingsForm from '@/components/HandleSettingsForm';
import FocusedEditForm from '@/components/FocusedEditForm';
import recordStyles from '@/components/BusinessRecordFacts.module.css';
import styles from '@/components/BusinessSettingsTasks.module.css';
import {getUiText} from '@/lib/i18n/server';
import {requireUser} from '@/lib/auth';
import {resolveManagedBusiness} from '@/lib/dashboard';
import {readHandleSettings} from '@/lib/business-handle-runtime';
import {saveBusinessHandleAction} from '@/app/dashboard/business/handle-actions';
import {updateBusinessAction} from '@/app/actions';
import {LIVE_PLATFORMS,LIVE_PLATFORM_LABELS} from '@/lib/live-showroom';
import type {BusinessSettingsSection} from '@/lib/business-settings-runtime';

export const dynamic='force-dynamic';
const tasks=[{key:'identity',label:'Business identity'},{key:'live',label:'Live presentation'},{key:'sharing',label:'Browser and sharing details'}] as const;

export default async function SettingsPage({searchParams}:{searchParams:Promise<{business?:string;section?:string;edit?:string;user?:string;saved?:string;error?:string;accessError?:string}>}){
  const t=await getUiText(),actor=await requireUser(),query=await searchParams;
  const business=await resolveManagedBusiness(actor,query.business);
  if(query.edit==='recovery'||query.accessError||query.saved==='password'){
    const legacy=new URLSearchParams({business:String(business.id)});
    if(query.edit==='recovery'){legacy.set('edit','recovery');legacy.set('user',String(Number(query.user)||0));}
    if(query.accessError)legacy.set('accessError',query.accessError.slice(0,300));
    if(query.saved==='password')legacy.set('saved','password');
    redirect('/dashboard/access?'+legacy);
  }
  const section:BusinessSettingsSection=tasks.some(task=>task.key===query.section)?query.section as BusinessSettingsSection:'identity';
  const title=tasks.find(task=>task.key===section)!.label;
  const readHref=`/dashboard/settings?business=${business.id}&section=${section}`;
  const editing=query.edit==='details',handle=section==='identity'&&query.edit==='handle';
  return <DashboardShell user={actor} business={business}>
    <div className="dashboard-head standard-page-heading"><h1>{t('Business details')}</h1></div>
    {query.saved?<p className="notice" role="status">{t('Business details saved.')}</p>:null}
    {query.error?<p className="error" role="alert">{t(query.error)}</p>:null}
    <div className={styles.workspace}>
      <nav className={styles.tasks} aria-label={t('Business details')}>{tasks.map(task=><Link key={task.key} href={`/dashboard/settings?business=${business.id}&section=${task.key}`} aria-current={task.key===section?'page':undefined}>{t(task.label)}</Link>)}</nav>
      <section className="panel">
        <div className="dashboard-section-head"><h2>{t(handle?'Page address':title)}</h2>{!editing&&!handle?<Link className="btn brand" href={`${readHref}&edit=details`}>{t('Edit')}</Link>:null}</div>
        {handle?<><HandleSettingsForm key={business.content_version} settings={await readHandleSettings(actor,business.id)} businessId={business.id} admin={actor.access_role==='platform_admin'} action={saveBusinessHandleAction}/><Link className="btn secondary" href={readHref}>{t('Cancel')}</Link></>:editing?
          <FocusedEditForm action={updateBusinessAction} cancelHref={readHref} submitLabel="Save business details" className="form-grid">
            <input type="hidden" name="businessId" value={business.id}/><input type="hidden" name="expectedVersion" value={business.content_version}/><input type="hidden" name="section" value={section}/>
            {section==='identity'?<>
              <div className="field full"><label htmlFor="business-name">{t('Business name')}</label><input id="business-name" required name="name" maxLength={100} defaultValue={business.name}/></div>
              <div className="field full settings-media-field"><label htmlFor="business-logo">{t('Logo')}</label>{business.logo_path?<img src={business.logo_path} alt={t('Current business logo')}/>:<span>{t('No logo uploaded')}</span>}<input id="business-logo" type="file" name="logo" accept="image/jpeg,image/png,image/webp"/><small>{t('Images are limited to valid JPEG, PNG, or WebP files of 5 MB or less.')}</small></div>
              <div className="field full"><label htmlFor="business-email">{t('Notification email')}</label><input id="business-email" type="email" name="contactEmail" maxLength={160} defaultValue={business.contact_email}/></div>
            </>:section==='live'?<>
              <div className="field full"><label htmlFor="business-live-platform">{t('Live platform')}</label><select id="business-live-platform" name="livePlatform" defaultValue={business.live_platform}><option value="">{t('Not configured')}</option>{LIVE_PLATFORMS.map(platform=><option key={platform} value={platform}>{LIVE_PLATFORM_LABELS[platform]}</option>)}</select></div>
              <div className="field full"><label htmlFor="business-live-url">{t('Live-session link')}</label><input id="business-live-url" type="url" name="liveUrl" defaultValue={business.live_url} placeholder="https://..."/></div>
              <label className="check-field field full"><input type="checkbox" name="isLive" defaultChecked={Boolean(business.is_live)}/>{t('Show this business as live now on its page and across the MirtPage Market')}</label>
            </>:<>
              <div className="field full"><label htmlFor="business-title">{t('Page title')}</label><input id="business-title" name="siteTitle" maxLength={120} defaultValue={business.site_title||business.name}/></div>
              <div className="field full"><label htmlFor="business-description">{t('Search and sharing description')}</label><textarea id="business-description" name="siteDescription" maxLength={240} rows={4} defaultValue={business.site_description||business.description}/></div>
            </>}
          </FocusedEditForm>:
          section==='identity'?<>{business.logo_path?<img src={business.logo_path} alt={t('Current business logo')} width={80} height={80} style={{objectFit:'contain'}}/>:null}<dl className={recordStyles.facts}><dt>{t('Business name')}</dt><dd>{business.name}</dd><dt>{t('Page address')}</dt><dd>@{business.handle} · <Link href={`${readHref}&edit=handle`}>{t('Edit')}</Link></dd><dt>{t('Notification email')}</dt><dd>{business.contact_email||t('Not configured')}</dd></dl></>:
          section==='live'?<dl className={recordStyles.facts}><dt>{t('Live platform')}</dt><dd>{business.live_platform||t('Not configured')}</dd><dt>{t('Live-session link')}</dt><dd>{business.live_url||t('Not configured')}</dd><dt>{t('Live')}</dt><dd>{t(business.is_live?'Yes':'No')}</dd></dl>:
          <dl className={recordStyles.facts}><dt>{t('Page title')}</dt><dd>{business.site_title||business.name}</dd><dt>{t('Search and sharing description')}</dt><dd>{business.site_description||business.description||t('Not set')}</dd></dl>}
      </section>
    </div>
  </DashboardShell>;
}
