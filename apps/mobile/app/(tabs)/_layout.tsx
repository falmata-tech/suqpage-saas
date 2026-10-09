import React from "react";
import {Tabs} from "expo-router";
import {AppHeader} from "../../src/chrome";
export default function Layout(){return <Tabs screenOptions={{header:()=> <AppHeader/>}} tabBar={()=>null}><Tabs.Screen name="index"/><Tabs.Screen name="featured"/><Tabs.Screen name="about"/><Tabs.Screen name="account"/></Tabs>;}
