'use client';

import {useFormStatus} from 'react-dom';
import {useUiText} from '@/lib/i18n/ui';

export default function SupportJoinButton(){
  const {pending}=useFormStatus();
  const t=useUiText();
  return <button className="btn brand" type="submit" disabled={pending} aria-busy={pending}>{t('Join chat')}</button>;
}
