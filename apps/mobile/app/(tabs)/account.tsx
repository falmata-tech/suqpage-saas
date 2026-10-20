import {Setup} from '../../src/owner-forms';
import {OwnerProfile} from "../../src/owner-profile";
import ResourceLoading from '../../src/ResourceLoading';
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
  const { session, ready, t, ownerRequest, signOut, authIssue, logoutIssue, logoutPending, authRetryAvailable, retryAuth, clearAuthIssue } = useApp();
  const openLink = useOpenLink();
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [password, setPassword] = useState(''),
    [passwordMode, setPasswordMode] = useState(false),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (authIssue === "Staff accounts sign in on the website.") {
      setSent(false);setCode("");setPassword('');setPasswordMode(false);setError("");
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
    if (logoutIssue || logoutPending) return;
    setBusy(true);
    setError("");
    clearAuthIssue();
    try {
      if (!auth) throw Error("Sign-in is not configured.");
      if (!sent) {
        const mode = await request<{mode:'otp'|'password'}>('auth/mode',{body:{email:email.trim()}});
        if (mode.mode === 'password') {setPasswordMode(true);setSent(true);return;}
      }
      if (passwordMode) {
        const session = await request<{access_token:string;refresh_token:string}>('auth/review',{body:{email:email.trim(),password}});
        const result = await auth.auth.setSession(session);
        if (result.error) throw result.error;
        setPassword('');
        return;
      }
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
  async function leaveSession() {
    setBusy(true);
    try { await signOut(); }
    catch { /* The provider keeps the safe logout error and Retry after this screen changes. */ }
    finally { setBusy(false); }
  }
  if (!ready&&!session)
    return (
      <Screen>
        <Status loading />
      </Screen>
    );
  return (
    <Screen>
      {!session ? (
        <>
          <Copy big heading>{t("Your business. Your digital showroom.")}</Copy>
          <Copy muted>
            {t(
              "Create a showroom for what you sell, make or grow. Already have one? Sign in to manage your page.",
            )}
          </Copy>
          <Status error={authIssue} />
          {authIssue === "Staff accounts sign in on the website." && <Button secondary label={t("Open website")} onPress={()=>void openLink(API+"/dashboard/admin")}/>}
          {logoutIssue || logoutPending ? <Card>
            <Copy big>{t("Sign out")}</Copy>
            <Status loading={logoutPending}/>
            {logoutIssue && <Button label={t("Retry")} disabled={busy} onPress={() => void leaveSession()}/>}
          </Card> : authRetryAvailable ? <Card>
            <Button label={t("Retry")} onPress={retryAuth}/>
            <Button secondary label={t("Change email")} onPress={()=>{clearAuthIssue();setSent(false);setCode("");setPassword('');setPasswordMode(false);void leaveSession();}}/>
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
                {!passwordMode && <Copy muted>{t("Check your email for a six-digit code.")}</Copy>}
                <Field
                  label={t(passwordMode ? 'Password' : "Verification code")}
                  value={passwordMode ? password : code}
                  onChangeText={passwordMode ? setPassword : setCode}
                  secureTextEntry={passwordMode}
                  autoCapitalize="none"
                  keyboardType={passwordMode ? 'default' : "number-pad"}
                  autoComplete={passwordMode ? 'current-password' : "one-time-code"}
                  maxLength={passwordMode ? 128 : 6}
                />
              </>
            )}
            <Status loading={busy} error={error} />
            <Button
              disabled={busy || !email.trim() || (sent && !(passwordMode ? password : code.trim()))}
              label={t(sent ? passwordMode ? 'Sign in' : "Verify code" : 'Continue with email')}
              onPress={() => void login()}
            />
            {sent && (
              <Button
                secondary
                label={t("Change email")}
                disabled={busy}
                onPress={() => {
                  setSent(false);
                  setCode("");
                  setPassword('');setPasswordMode(false);
                }}
              />
            )}
          </Card>}
        </>
      ) : (
        <>
          <ResourceLoading load={load} variant="profile"/>
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
        </>
      )}
      {!session&&<><Button secondary label={t("About MirtPage")} onPress={()=>router.navigate("/about")}/>
      <Button secondary label={t("Privacy")} onPress={()=>void openLink(API+"/privacy")}/>
      <Button secondary label={t("Terms")} onPress={()=>void openLink(API+"/terms")}/></>}
    </Screen>
  );
}
