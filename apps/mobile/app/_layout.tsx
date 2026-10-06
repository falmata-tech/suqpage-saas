import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RuntimeProvider, useApp } from "../src/runtime";
import { AppHeader } from "../src/chrome";
import { colors } from "../src/ui";
function Routes() {
  const { t, session } = useApp();
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        key={session?.user.id || "visitor"}
        screenOptions={{
          header: () => <AppHeader back />,
          headerTintColor: colors.ink,
          headerStyle: { backgroundColor: "white" },
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
          headerBackTitle: t("Back"),
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="shop/[handle]" options={{ title: t("Showroom") }} />
        <Stack.Screen
          name="product"
          options={{ title: t("Products & services") }}
        />
        <Stack.Screen name="inquiry" options={{ title: t("Inquiry") }} />
        <Stack.Screen
          name="buying"
          options={{ title: t("Transport & delivery") }}
        />
        <Stack.Screen
          name="owner/[section]"
          options={{ title: t("Your business") }}
        />
      </Stack>
    </>
  );
}
export default function Layout() {
  return (
    <SafeAreaProvider>
      <RuntimeProvider>
        <Routes />
      </RuntimeProvider>
    </SafeAreaProvider>
  );
}
