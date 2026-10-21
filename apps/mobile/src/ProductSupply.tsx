import React from 'react';
import {Text} from 'react-native';
import {productSupplyLabel} from '../../../lib/offerings';
import {useApp} from './runtime';
import {colors} from './ui';

export default function ProductSupply({kind,availability}:{kind?:string;availability?:string}) {
  const {t}=useApp();
  if(!kind||!availability||kind==='service')return null;
  const label=t(productSupplyLabel(kind,availability));
  return <Text accessibilityLabel={`${t('Availability')}: ${label}`} style={{fontSize:12,lineHeight:17,fontWeight:'600',color:colors.muted}}>{label}</Text>;
}
