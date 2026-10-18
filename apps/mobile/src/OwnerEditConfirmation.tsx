import React from 'react';
import {Sheet} from './chrome';
import {Button, Copy} from './ui';
import {useApp} from './runtime';
import type {OwnerEditGuard} from './owner-edit-navigation';

export default function OwnerEditConfirmation({guard}: {guard: OwnerEditGuard}) {
  const {t} = useApp();
  return <Sheet visible={guard.confirming} title={t('Unsaved changes')} onClose={guard.keepEditing}>
    <Copy>{t('Your changes have not been saved.')}</Copy>
    <Button secondary label={t('Keep editing')} onPress={guard.keepEditing}/>
    <Button label={t('Discard changes')} onPress={guard.discard}/>
  </Sheet>;
}
