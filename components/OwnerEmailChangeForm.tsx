'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUiText } from '@/lib/i18n/ui';
import LoadingBar from './LoadingBar';
import styles from './OwnerEmailChangeForm.module.css';

type TaskState = { state: 'idle' } | { state: 'pending'; newEmail?: string; oldVerified?: boolean; newVerified?: boolean; expired?: boolean }
  | { state: 'complete' } | { state: 'error'; error: string };

export default function OwnerEmailChangeForm({ currentEmail, initial, requestAction, verifyAction }: {
  currentEmail: string;
  initial: TaskState;
  requestAction: (form: FormData) => Promise<TaskState>;
  verifyAction: (form: FormData) => Promise<TaskState>;
}) {
  const t = useUiText(), router = useRouter();
  const [state, setState] = useState<TaskState>(initial);
  const [newEmail, setNewEmail] = useState(initial.state === 'pending' ? initial.newEmail || '' : '');
  const [oldCode, setOldCode] = useState(''), [nextCode, setNextCode] = useState('');
  const [busy, setBusy] = useState(false), pending = useRef(false);
  const [error, setError] = useState('');
  const errorCopy: Record<string, string> = {
    unavailable: 'Email change is temporarily unavailable.', owner_only: 'Sign in as the account owner to continue.',
    invalid_email: 'Enter a different, valid email address.', invalid_code: 'The code is invalid or expired.',
    pending: 'A change is already pending.', expired: 'The code is invalid or expired.',
    identity_mismatch: 'We could not finish the change. Try again.', try_again: 'We could not finish the change. Try again.',
  };
  async function run(work: () => Promise<TaskState>) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const result = await work();
      if (result.state === 'error') setError(errorCopy[result.error] || errorCopy.try_again);
      else {
        setState(result);
        if (result.state === 'complete') router.replace('/login?email=changed');
      }
    } catch { setError(errorCopy.try_again); }
    finally { pending.current = false; setBusy(false); }
  }
  const pendingState = state.state === 'pending' ? state : null;
  return <section className="panel form-grid" aria-busy={busy}>
    {busy && <div className="field full"><LoadingBar/></div>}
    {error && <p className="field full error" role="alert">{t(error)}</p>}
    <p className="field full muted">{t('We will send a different six-digit code to your current and new email addresses. Your sign-in email changes only after both are confirmed.')}</p>
    <div className="field"><label htmlFor="current-sign-in-email">{t('Current sign-in email')}</label><output id="current-sign-in-email" className={styles.currentAddress}>{currentEmail}</output></div>
    {!pendingState && state.state !== 'complete' && <form className="field full form-grid" action={requestAction as unknown as (formData: FormData) => Promise<void>} onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); void run(() => requestAction(form)); }}>
      <div className="field full"><label htmlFor="new-sign-in-email">{t('New sign-in email')}</label><input id="new-sign-in-email" name="newEmail" type="email" autoComplete="email" required maxLength={254} value={newEmail} onChange={event => setNewEmail(event.target.value)} disabled={busy}/></div>
      <button className="btn brand" type="submit" disabled={busy}>{t('Send verification codes')}</button>
    </form>}
    {pendingState && <div className="field full">
      <p>{t('New sign-in email')}: <strong>{pendingState.newEmail}</strong></p>
      {pendingState.expired ? <><p className="error" role="alert">{t('The code is invalid or expired.')}</p><Link className="btn secondary" href="/dashboard/support">{t('Contact support')}</Link></> : <div className="form-grid">
        {(['current', 'new'] as const).map(mailbox => <form className="field" key={mailbox} action={verifyAction as unknown as (formData: FormData) => Promise<void>} onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); void run(() => verifyAction(form)); }}>
          <label htmlFor={`email-code-${mailbox}`}>{t(mailbox === 'current' ? 'Code sent to your current email' : 'Code sent to your new email')}</label>
          <input type="hidden" name="mailbox" value={mailbox}/>
          <input id={`email-code-${mailbox}`} name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={mailbox === 'current' ? oldCode : nextCode} onChange={event => (mailbox === 'current' ? setOldCode : setNextCode)(event.target.value)} disabled={busy || (mailbox === 'current' ? pendingState.oldVerified : pendingState.newVerified)}/>
          <button className="btn secondary" type="submit" disabled={busy || (mailbox === 'current' ? pendingState.oldVerified : pendingState.newVerified)}>{t(mailbox === 'current' ? 'Verify current email' : 'Verify new email')}</button>
        </form>)}
      </div>}
    </div>}
    {state.state === 'complete' && <p className="field full notice" role="status">{t('Both emails are confirmed. Sign in again.')}</p>}
  </section>;
}
