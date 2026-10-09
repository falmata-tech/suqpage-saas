'use client';
import {useUiText} from '@/lib/i18n/ui';
export default function LoadingBar({label}:{label?:string}={}){const t=useUiText();return <div className="suqpage-loading" role="status" aria-live="polite"><span>{label||t('Loading…')}</span><div className="suqpage-loading-track" aria-hidden="true"><i/></div></div>;}
