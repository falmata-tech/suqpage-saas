import React from 'react';
import {Redirect} from 'expo-router';

/** S138 retires anonymous capabilities without adopting or exposing their payload. */
export default function LegacyTransportPlan(){return <Redirect href="/tracking"/>;}
