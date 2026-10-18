import FocusedEditForm from './FocusedEditForm';
import {getUiText} from '@/lib/i18n/server';
import type {ExternalSponsorAd} from '@/lib/sponsor-admin';
import type {DiscoveryProfileAdminView} from '@/lib/discovery-admin';
import {createExternalSponsorAdAction,setBusinessSponsorshipAction,updateExternalSponsorAdAction} from '@/app/staff-actions';

export default async function SponsorPlacementEditor({ad,business,cancelHref,origin}:{ad?:ExternalSponsorAd;business?:DiscoveryProfileAdminView;cancelHref:string;origin:{business?:string;q?:string;businessPage?:string;adPage?:string}}) {
  const t=await getUiText();
  return <FocusedEditForm action={business?setBusinessSponsorshipAction:ad?updateExternalSponsorAdAction:createExternalSponsorAdAction} cancelHref={cancelHref} submitLabel={business?'Save':ad?'Save sponsor ad':'Create sponsor ad'}>
    {Object.entries(origin).map(([key,value])=><input key={key} type="hidden" name={`return_${key}`} value={value||''}/>)}
    {business?<>
      <input type="hidden" name="businessId" value={business.businessId}/><h2 className="field full">{business.businessName}</h2><p className="field full">@{business.handle}</p>
      <label className="field"><span>{t('Position')}</span><input name="position" type="number" min="1" max="999" defaultValue={business.sponsorPosition} required/></label>
      <label className="check-field field"><input name="active" type="checkbox" defaultChecked={business.sponsored}/>{t('Sponsored')}</label>
    </>:<>
      {ad&&<input type="hidden" name="id" value={ad.id}/>}
      <div className="field"><label htmlFor="sponsor-name">{t('Business name')}</label><input id="sponsor-name" name="name" minLength={2} maxLength={100} defaultValue={ad?.name||''} required/></div>
      <div className="field"><label htmlFor="sponsor-position">{t('Public position')}</label><input id="sponsor-position" name="position" type="number" min="1" max="999" defaultValue={ad?.position||100} required/></div>
      <div className="field full"><label htmlFor="sponsor-description">{t('Short details')}</label><textarea id="sponsor-description" name="description" minLength={2} maxLength={180} rows={3} defaultValue={ad?.description||''} required/></div>
      <div className="field"><label htmlFor="sponsor-website">{t('Website')}</label><input id="sponsor-website" name="websiteUrl" type="url" defaultValue={ad?.websiteUrl||''} placeholder="https://example.com"/></div>
      <div className="field"><label htmlFor="sponsor-phone">{t('Phone')}</label><input id="sponsor-phone" name="phone" type="tel" defaultValue={ad?.phone||''} placeholder="+251…"/></div>
      <div className="field full"><label htmlFor="sponsor-image">{t(ad?'Replace image':'Sponsor image')}</label>{ad&&<img src={ad.imagePath} alt="" width={160} height={100} style={{objectFit:'cover'}}/>}<input id="sponsor-image" name="image" type="file" accept="image/jpeg,image/png,image/webp" required={!ad}/><small>{t(ad?'Leave empty to keep the current image.':'JPG, PNG, or WebP up to 5 MB.')}</small></div>
      <label className="check-field field"><input name="active" type="checkbox" defaultChecked={ad?.active??true}/>{t('Active')}</label>
    </>}
  </FocusedEditForm>;
}
