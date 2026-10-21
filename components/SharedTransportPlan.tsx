'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useUiText} from '@/lib/i18n/ui';
import LoadingBar from './LoadingBar';
/** Retired bearer links never authorize access or carry their fragment forward. */
export default function SharedTransportPlan(){
 const router=useRouter(),t=useUiText();
 useEffect(()=>{window.history.replaceState(null,'','/tracking');router.replace('/tracking');},[router]);
 return <LoadingBar label={t('Loading…')}/>;
}
