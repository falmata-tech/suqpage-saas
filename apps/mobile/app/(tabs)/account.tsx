import {Setup} from '../../src/owner-forms';
import {OwnerProfile} from "../../src/owner-profile";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
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
  const {next}=useLocalSearchParams<{next?:string}>();
  const { session, ready, t, ownerRequest, signOut, authIssue, authRetryAvailable, retryAuth, clearAuthIssue } = useApp();
  const openLink = useOpenLink();
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (authIssue === "Staff accounts sign in on the website.") {
      setSent(false);setCode("");setError("");
    }
  }, [authIssue]);
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
    clearAuthIssue();
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
          {next==='inquiries' && <Copy muted>{t("Sign in to view your business inquiries.")}</Copy>}
          <Copy muted>
            {t(
              "Create a professional store for your products and services, or sign in to manage your page and customer inquiries.",
            )}
          </Copy>
          <Status error={authIssue} />
          {authIssue === "Staff accounts sign in on the website." && <Button secondary label={t("Open website")} onPress={()=>void openLink(API+"/dashboard/admin")}/>}
          {authRetryAvailable ? <Card>
            <Button label={t("Retry")} onPress={retryAuth}/>
            <Button secondary label={t("Change email")} onPress={()=>{clearAuthIssue();setSent(false);setCode("");void signOut();}}/>
          </Card> : <Card>
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
            <Status loading={busy} error={error} />
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
          </Card>}
        </>
      ) : (
        <>
          <Status {...load} retry={load.reload} />
          {load.data &&
            ("setup" in load.data ? (
              <Setup/>
            ) : (
              <>
                <OwnerProfile home={load.data} />
              </>
            ))}
          {Boolean(load.error) && (
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
      <Button secondary label={t("About Suqpage")} onPress={()=>router.navigate("/about")}/>
      <Button secondary label={t("Privacy")} onPress={()=>void openLink(API+"/privacy")}/>
      <Button secondary label={t("Terms")} onPress={()=>void openLink(API+"/terms")}/>
    </Screen>
  );
}
