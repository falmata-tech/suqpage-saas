import React, { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { parseBusinessHandle } from "../../../lib/business-handle";
import { useApp, useLoad, request } from "./runtime";
import { Card, Field, Copy, Button, Status } from "./ui";
import {useOwnerEditGuard} from './owner-edit-navigation';
import OwnerEditConfirmation from './OwnerEditConfirmation';

type Check = { handle: string; kind: "checking" | "available" | "taken" | "error" };
export function HandleInput({ value, onChange, onReady, currentHandle = "", refreshKey = 0 }: {
  value: string; onChange: (value: string) => void; onReady: (ready: boolean) => void; currentHandle?: string; refreshKey?: number;
}) {
  const { t } = useApp();
  const [check, setCheck] = useState<Check | null>(null), [retry, setRetry] = useState(0);
  let handle = "", invalid = "";
  if (value) { try { handle = parseBusinessHandle(value); } catch (e) { invalid = (e as Error).message; } }
  const current = check?.handle === handle ? check : null;
  const available = Boolean(handle && (handle === currentHandle || current?.kind === "available"));
  useEffect(() => { onReady(available); }, [available, onReady, value]);
  useEffect(() => {
    if (!handle) { setCheck(null); return; }
    if (handle === currentHandle) { setCheck({handle, kind: "available"}); return; }
    const controller = new AbortController();
    let active = true, timeout: ReturnType<typeof setTimeout> | undefined;
    setCheck({handle, kind: "checking"});
    const timer = setTimeout(async () => {
      timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const data = await request<{handle: string; available: boolean}>("handles?handle=" + encodeURIComponent(handle), {signal: controller.signal});
        if (data.handle !== handle || typeof data.available !== "boolean") throw Error("check_failed");
        if (active) setCheck({handle, kind: data.available ? "available" : "taken"});
      } catch { if (active) setCheck({handle, kind: "error"}); }
      finally { clearTimeout(timeout); }
    }, 350);
    return () => { active = false; clearTimeout(timer); clearTimeout(timeout); controller.abort(); };
  }, [handle, currentHandle, retry, refreshKey]);
  return <>
    <Field label={t("Page handle")} value={value} onChangeText={v => {onReady(false); onChange(v);}} autoCapitalize="none" autoCorrect={false} maxLength={61} />
    <Copy muted>{"africmade.com/@" + (handle || value.trim().replace(/^@/, "").toLowerCase())}</Copy>
    {invalid ? <Status error={t(invalid)} /> : current ? <Copy>{t(current.kind === "available" ? "Available" : current.kind === "taken" ? "This handle is already taken. Choose another." : current.kind === "error" ? "Could not check this handle. Try again." : "Checking…")}</Copy> : null}
    {current?.kind === "error" ? <Button secondary label={t("Retry")} onPress={() => setRetry(v => v + 1)} /> : null}
  </>;
}

export function HandleEditor({ initialHandle, onSaved,onCancel }: { initialHandle: string; onSaved: () => void;onCancel?:()=>void }) {
  const { t, ownerRequest } = useApp();
  const [handle, setHandle] = useState(initialHandle), [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const flight=useRef(false);
  const guard=useOwnerEditGuard({dirty:handle!==initialHandle,signature:handle,busy,isBusy:()=>flight.current,discard:()=>setHandle(initialHandle)});
  const settings = useLoad(() => ownerRequest<{handle: string; contentVersion: number; nextChangeAt: number}>("owner/handle"));
  const locked = Boolean(settings.data && settings.data.nextChangeAt > Date.now());
  return <Card>
    <Copy big heading>{t("Page address")}</Copy>
    <Status {...settings} retry={settings.reload} />
    {locked ? <>
      <Copy>{"africmade.com/@" + (settings.data?.handle || initialHandle)}</Copy>
      <Copy muted>{t("You can change your handle once every 30 days. Contact support for help.")}</Copy>
      <Button secondary label={t("Contact support")} onPress={() => router.push({pathname: "/owner/[section]", params: {section: "support"}})} />
    </> : <>
      <HandleInput value={handle} onChange={value=>{guard.changed();setHandle(value);}} onReady={setReady} currentHandle={settings.data?.handle || initialHandle} />
      <Copy muted>{t("You can change your handle once every 30 days.")}</Copy>
      <Status error={error} />
      <Button label={t("Save handle")} disabled={busy || !ready || !settings.data || handle.trim().replace(/^@/, "").toLowerCase() === settings.data.handle} onPress={() => void (async () => {
        if(flight.current)return;flight.current=true;const checkpoint=guard.checkpoint();
        setBusy(true); setError("");
        try { await ownerRequest("owner/handle", {handle, expectedVersion: settings.data!.contentVersion}); settings.reload(); guard.complete(onSaved,handle,checkpoint); }
        catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
        finally { flight.current=false;setBusy(false); }
      })()} />
    </>}
    {onCancel&&<Button secondary disabled={busy} label={t('Cancel')} onPress={()=>guard.requestLeave(onCancel)}/>}
    <OwnerEditConfirmation guard={guard}/>
  </Card>;
}
