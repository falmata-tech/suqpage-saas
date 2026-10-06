import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import type { OwnerHome } from "@suqpage/contracts";
import { auth, useApp, useLoad, request, API } from "../../src/runtime";
import {
  Screen,
  Copy,
  Card,
  Field,
  Button,
  Status,
  s,
  useOpenLink,
  Icon,
  colors,
} from "../../src/ui";
export default function Account() {
  const { session, ready, t, ownerRequest, signOut } = useApp();
  const openLink = useOpenLink();
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const load = useLoad(async () => {
    if (!session) return null;
    const state = await ownerRequest<{ setupRequired: boolean }>("session");
    return state.setupRequired
      ? { setup: true as const }
      : await ownerRequest<OwnerHome>("owner/home");
  }, [session?.user.id], true);
  async function login() {
    setBusy(true);
    setError("");
    try {
      if (!auth) throw Error("Sign-in is not configured.");
      const result = sent
        ? await auth.auth.verifyOtp({
            email: email.trim(),
            token: code.trim(),
            type: "email",
          })
        : await auth.auth.signInWithOtp({
            email: email.trim(),
            options: { shouldCreateUser: true },
          });
      if (result.error) throw result.error;
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (!ready)
    return (
      <Screen>
        <Status loading />
      </Screen>
    );
  return (
    <Screen>
      {!session ? (
        <>
          <Copy big>{t("Your digital storefront")}</Copy>
          <Copy muted>
            {t(
              "Create a professional store for your products and services, or sign in to manage your page and customer inquiries.",
            )}
          </Copy>
          <Card>
            <Copy big>{t("Continue with email")}</Copy>
            <Field
              label={t("Email")}
              value={email}
              editable={!sent}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {sent && (
              <>
                <Copy muted>{t("Check your email for a six-digit code.")}</Copy>
                <Field
                  label={t("Verification code")}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                />
              </>
            )}
            <Status error={error} />
            <Button
              disabled={busy || !email.trim() || (sent && !code.trim())}
              label={t(sent ? "Verify code" : "Send code")}
              onPress={() => void login()}
            />
            {sent && (
              <Button
                secondary
                label={t("Change email")}
                onPress={() => {
                  setSent(false);
                  setCode("");
                }}
              />
            )}
          </Card>
        </>
      ) : (
        <>
          <Status {...load} retry={load.reload} />
          {load.data &&
            ("setup" in load.data ? (
              <Card>
                <Copy big>{t("Account setup")}</Copy>
                <Button
                  label={t("Create your business page")}
                  onPress={() =>
                    router.push({
                      pathname: "/owner/[section]",
                      params: { section: "setup" },
                    })
                  }
                />
              </Card>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.brand,
                  }}
                >
                  {t("Business workspace")}
                </Text>
                <Copy big>{load.data.shop.name}</Copy>
                <Button
                  label={t("Edit page")}
                  onPress={() =>
                    router.push({
                      pathname: "/owner/[section]",
                      params: { section: "page" },
                    })
                  }
                />
                <Card>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Icon name="shop" color={colors.brand} />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: colors.ink,
                      }}
                    >
                      {t(
                        load.data.shop.status === "active"
                          ? "Your page is live"
                          : "Draft",
                      )}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Copy muted>{t("Products & services")}</Copy>
                    <Copy big>{load.data.shop.products.length}</Copy>
                  </View>
                  <Button
                    secondary
                    disabled={load.data.shop.status!=="active"}
                    label={t("View page")}
                    onPress={() =>
                      router.push({
                        pathname: "/shop/[handle]",
                        params: {
                          handle:
                            load.data && "shop" in load.data
                              ? load.data.shop.handle
                              : "",
                        },
                      })
                    }
                  />
                </Card>
                {[
                  ["page", "Your page"],
                  ["business", "Business details"],
                  ["products", "Products & services"],
                  ["inquiries", "Customer inquiries"],
                  ["support", "Support"],
                  ["settings", "Account security"],
                ].map(([screen, label]) => (
                  <Pressable
                    key={screen}
                    accessibilityRole="button"
                    accessibilityLabel={t(label)}
                    onPress={() =>
                      router.push({
                        pathname: "/owner/[section]",
                        params: { section: screen },
                      })
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      minHeight: 60,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: colors.line,
                      borderRadius: 7,
                      backgroundColor: "white",
                    }}
                  >
                    <Icon
                      name={
                        screen === "support"
                          ? "chat"
                          : screen === "products"
                            ? "shop"
                            : screen === "settings"
                              ? "user"
                              : "info"
                      }
                      color={colors.brand}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 16,
                        fontWeight: "600",
                        color: colors.ink,
                      }}
                    >
                      {t(label)}
                    </Text>
                    <Icon name="arrow" size={18} />
                  </Pressable>
                ))}
              </>
            ))}
          {load.error && (
            <Button
              secondary
              label={t("Open website")}
              onPress={() => void openLink(API + "/dashboard")}
            />
          )}
          <Button
            secondary
            label={t("Delete account")}
            onPress={() => router.push("/account-deletion")}
          />
          <Button
            secondary
            label={t("Sign out")}
            onPress={() => void signOut()}
          />
        </>
      )}
    </Screen>
  );
}
