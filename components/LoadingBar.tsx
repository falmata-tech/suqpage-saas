'use client';
import {useUiText} from '@/lib/i18n/ui';
export default function LoadingBar({label}:{label?:string}={}){const t=useUiText();return <div className="africmade-loading" role="status" aria-live="polite"><span>{label||t('Loading…')}</span><div className="africmade-loading-track" aria-hidden="true"><i/></div></div>;}
