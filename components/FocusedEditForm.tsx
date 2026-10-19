"use client";

import Link from "next/link";
import {useRef,useState} from "react";
import {unstable_rethrow} from "next/navigation";
import {useUiText} from "@/lib/i18n/ui";
import type {OwnerEditResult} from "@/lib/owner-edit-contract";
import LoadingBar from "./LoadingBar";

/** Expected save failures stay with the entered fields; successful actions navigate. */
export default function FocusedEditForm({action,children,cancelHref,submitLabel="Save changes",className="panel form-grid",disabled=false}:{
  action:(form:FormData)=>Promise<OwnerEditResult>;
  children:React.ReactNode;
  cancelHref:string;
  submitLabel?:string;
  className?:string;
  disabled?:boolean;
}) {
  const t=useUiText(),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const pending=useRef(false);
  // The server action also provides a safe POST target before hydration. Its
  // return value is handled by the client submit path once JavaScript is ready.
  return <form action={action as unknown as (formData:FormData)=>Promise<void>} className={className} aria-busy={busy} onSubmit={async event=>{
    event.preventDefault();if(pending.current||disabled)return;
    const form=new FormData(event.currentTarget);
    pending.current=true;setBusy(true);setError("");
    try {const result=await action(form);if(result)setError(result.error);}
    catch(error){unstable_rethrow(error);setError("Unable to connect. Please try again.");}
    finally {pending.current=false;setBusy(false);}
  }}>
    {busy&&<div className="field full"><LoadingBar/></div>}
    {error&&<p className="error field full" role="alert">{t(error)}</p>}
    <fieldset disabled={busy} style={{display:'contents',border:0,padding:0,margin:0}}>{children}</fieldset>
    <div className="field full inline-actions"><button className="btn brand" disabled={busy||disabled}>{t(busy?"Saving...":submitLabel)}</button><Link className="btn secondary" href={cancelHref} aria-disabled={busy} onClick={event=>{if(pending.current)event.preventDefault();}}>{t("Cancel")}</Link></div>
  </form>;
}
