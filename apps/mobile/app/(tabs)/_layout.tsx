import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Tabs, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../../src/runtime";
import { Icon, colors } from "../../src/ui";
import { AppHeader, MoreSheet, OwnerNavigation } from "../../src/chrome";
export default function Layout() {
  const { t, session } = useApp();
  const [more, setMore] = useState(false);
  const { bottom } = useSafeAreaInsets();
  return (
    <>
      <Tabs
        screenOptions={{ header: () => <AppHeader /> }}
        tabBar={({ state }) =>
          session && state.routes[state.index]?.name === "account" ? (
            <OwnerNavigation />
          ) : (
            <View
              style={{
                paddingBottom: bottom,
                flexDirection: "row",
                borderTopWidth: 1,
                borderColor: colors.line,
                backgroundColor: "white",
              }}
            >
              {[
                ["index", "Market", "map", "/"],
                ["featured", "Featured", "star", "/featured"],
                ["about", "About", "info", "/about"],
                ["account", "More", "menu", "/account"],
              ].map(([key, label, icon, href]) => {
                const active = state.routes[state.index]?.name === key;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={t(label)}
                    onPress={() =>
                      key === "account"
                        ? setMore(true)
                        : router.navigate(href as "/" | "/featured" | "/about")
                    }
                    style={{
                      flex: 1,
                      minHeight: 60,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 3,
                      borderTopWidth: 3,
                      borderColor: active ? colors.brand : "transparent",
                    }}
                  >
                    <Icon
                      name={icon}
                      color={active ? colors.brand : colors.muted}
                      size={23}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: active ? colors.brand : colors.muted,
                      }}
                    >
                      {t(label)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )
        }
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="featured" />
        <Tabs.Screen name="about" />
        <Tabs.Screen name="account" />
      </Tabs>
      <MoreSheet visible={more} onClose={() => setMore(false)} />
    </>
  );
}
