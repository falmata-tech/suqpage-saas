'use client';
import {useState} from 'react';
import {clockInputParts, clockInputValue} from '@/lib/clock-display';
import {useUiText} from '@/lib/i18n/ui';

export default function ClockInput({id,name,defaultValue,label}:{id:string;name:string;defaultValue:string;label:string}) {
  const t=useUiText();
  const [parts,setParts]=useState(()=>clockInputParts(defaultValue));
  return <div className="clock-input" role="group" aria-label={label}>
    <input type="hidden" name={name} value={clockInputValue(parts.hour,parts.minute,parts.period)} />
    <select id={id} aria-label={`${label}: ${t('Hour')}`} value={parts.hour} onChange={event=>setParts({...parts,hour:event.target.value})}>
      {Array.from({length:12},(_,index)=>String(index+1)).map(hour=><option key={hour} value={hour}>{hour}</option>)}
    </select>
    <span aria-hidden="true">:</span>
    <select aria-label={`${label}: ${t('Minute')}`} value={parts.minute} onChange={event=>setParts({...parts,minute:event.target.value})}>
      {Array.from({length:60},(_,index)=>String(index).padStart(2,'0')).map(minute=><option key={minute} value={minute}>{minute}</option>)}
    </select>
    <select aria-label={`${label}: AM/PM`} value={parts.period} onChange={event=>setParts({...parts,period:event.target.value})}>
      <option value="AM">AM</option><option value="PM">PM</option>
    </select>
  </div>;
}
