import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { auth, useApp, useLoad } from './runtime';
import ResourceLoading from './ResourceLoading';
import { Button, Card, Copy, Field, Status } from './ui';

type EmailStatus = { state: 'idle' | 'complete' } | {
  state: 'pending'; newEmail: string; oldVerified: boolean; newVerified: boolean; expired: boolean;
};

export const nativeOwnerEmailChangeEnabled = process.env.EXPO_PUBLIC_OWNER_EMAIL_CHANGE_ENABLED === '1';

export default function OwnerEmailChange({ currentEmail }: { currentEmail: string }) {
  const { t, ownerRequest, signOut } = useApp();
  const load = useLoad(() => ownerRequest<EmailStatus>('owner/email-change/status'), [], true);
  const [newEmail, setNewEmail] = useState(''), [oldCode, setOldCode] = useState(''), [nextCode, setNextCode] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const status = load.data;
  async function run(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError('');
    try { await work(); }
    catch (problem) { setError(problem instanceof Error ? problem.message : 'We could not finish the change. Try again.'); }
    finally { setBusy(false); }
  }
  async function begin() {
    if (!auth) throw Error('Email change is temporarily unavailable.');
    const prepared = await ownerRequest<{ state: 'prepared'; newEmail: string }>('owner/email-change/prepare', { newEmail });
    const requested = await auth.auth.updateUser({ email: prepared.newEmail });
    if (requested.error) throw Error('We could not finish the change. Try again.');
    await ownerRequest('owner/email-change/sent', {});
    load.reload();
  }
  async function verify(mailbox: 'current' | 'new') {
    const result = await ownerRequest<EmailStatus>('owner/email-change/code', { mailbox, code: mailbox === 'current' ? oldCode : nextCode });
    if (result.state === 'complete') load.setData(result);
    else load.reload();
  }
  return <>
    <Copy big heading>{t('Change sign-in email')}</Copy>
    <Copy muted>{t('We will send a different six-digit code to your current and new email addresses. Your sign-in email changes only after both are confirmed.')}</Copy>
    <ResourceLoading load={load} variant="editor"/>
    {status && <Card>
      <Copy muted>{t('Current sign-in email')}</Copy><Copy>{currentEmail}</Copy>
      {status.state === 'idle' && <>
        <Field label={t('New sign-in email')} value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!busy}/>
        <Button label={t('Send verification codes')} disabled={busy || !newEmail.trim()} onPress={() => void run(begin)}/>
      </>}
      {status.state === 'pending' && <>
        <Copy muted>{t('New sign-in email')}</Copy><Copy>{status.newEmail}</Copy>
        {status.expired ? <><Copy>{t('The code is invalid or expired.')}</Copy><Button secondary label={t('Contact support')} onPress={() => router.push({pathname:'/owner/[section]',params:{section:'support'}})}/></> : <View style={{gap:12}}>
          <Field label={t('Code sent to your current email')} value={oldCode} onChangeText={setOldCode} keyboardType="number-pad" maxLength={6} editable={!busy && !status.oldVerified}/>
          <Button secondary label={t('Verify current email')} disabled={busy || status.oldVerified || !/^\d{6}$/.test(oldCode)} onPress={() => void run(() => verify('current'))}/>
          <Field label={t('Code sent to your new email')} value={nextCode} onChangeText={setNextCode} keyboardType="number-pad" maxLength={6} editable={!busy && !status.newVerified}/>
          <Button secondary label={t('Verify new email')} disabled={busy || status.newVerified || !/^\d{6}$/.test(nextCode)} onPress={() => void run(() => verify('new'))}/>
        </View>}
      </>}
      {status.state === 'complete' && <>
        <Copy>{t('Both emails are confirmed. Sign in again.')}</Copy>
        <Button label={t('Sign in again')} onPress={() => void run(async () => { await signOut().catch(() => {}); router.replace('/account'); })}/>
      </>}
      {error && <Copy>{t(error)}</Copy>}
    </Card>}
  </>;
}
