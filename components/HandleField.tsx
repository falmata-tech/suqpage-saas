'use client';
import {useEffect, useState} from 'react';
import {Check, LoaderCircle, X} from 'lucide-react';
import {parseBusinessHandle} from '@/lib/business-handle';
import {useUiText} from '@/lib/i18n/ui';

type CheckState = {handle: string; kind: 'checking' | 'available' | 'taken' | 'error'};
export default function HandleField({onReady, refreshKey = 0, currentHandle = ""}: {onReady: (ready: boolean) => void; refreshKey?: number; currentHandle?: string}) {
  const t = useUiText();
  const [value, setValue] = useState(currentHandle);
  const [mounted, setMounted] = useState(false);
  const [retry, setRetry] = useState(0);
  const [check, setCheck] = useState<CheckState | null>(null);
  let handle = '', invalid = '';
  if (value) {try {handle = parseBusinessHandle(value);} catch (error) {invalid = (error as Error).message;}}
  const current = check?.handle === handle ? check : null;
  const available = Boolean(handle && (handle===currentHandle || current?.kind === 'available'));
  useEffect(() => {setMounted(true);}, []);
  useEffect(() => {onReady(available);}, [available, onReady, value]);
  useEffect(() => {
    if (!handle) {setCheck(null); return;}
    if(handle===currentHandle){setCheck({handle,kind:'available'});return;}
    const controller = new AbortController();
    let active = true;
    setCheck({handle, kind: 'checking'});
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/signup/handle?handle=${encodeURIComponent(handle)}`, {signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]), cache: 'no-store'});
        const data = await response.json() as {handle?: string; available?: boolean};
        if (!response.ok || data.handle !== handle || typeof data.available !== 'boolean') throw new Error('check_failed');
        if (active) setCheck({handle, kind: data.available ? 'available' : 'taken'});
      } catch {
        if (active) setCheck({handle, kind: 'error'});
      }
    }, 350);
    return () => {active = false; window.clearTimeout(timer); controller.abort();};
  }, [handle, retry, refreshKey, currentHandle]);
  return <div className="field full handle-field">
    <label htmlFor="signup-handle">{t('Page handle')}</label>
    <input id="signup-handle" name="handle" value={value} onChange={event => {onReady(false); setValue(event.target.value);}}
      disabled={!mounted} required maxLength={61} autoCapitalize="none" autoCorrect="off" spellCheck={false}
      autoComplete="off" aria-describedby="signup-handle-address signup-handle-status" aria-invalid={Boolean(invalid || current?.kind === 'taken')} />
    <small id="signup-handle-address" dir="ltr">mirtpage.com/@{handle || value.trim().replace(/^@/, '').toLowerCase()}</small>
    <small id="signup-handle-status" role="status" aria-live="polite">
      {invalid ? <><X size={16} aria-hidden="true" />{t(invalid)}</> : !handle ? null
        : current?.kind === 'available' ? <><Check size={16} aria-hidden="true" />{t('Available')}</>
        : current?.kind === 'taken' ? <><X size={16} aria-hidden="true" />{t('This handle is already taken. Choose another.')}</>
        : current?.kind === 'error' ? <>{t('Could not check this handle. Try again.')} <button type="button" className="platform-link-button" onClick={() => setRetry(value => value + 1)}>{t('Retry')}</button></>
        : <><LoaderCircle size={16} aria-hidden="true" />{t('Checking…')}</>}
    </small>
  </div>;
}
