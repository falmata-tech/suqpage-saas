"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientRequestForm({requestType}:{requestType:"onboarding"|"change"}) {
  const router=useRouter();
  const key=useMemo(()=>crypto.randomUUID(),[]);
  const [error,setError]=useState("");
  const [pending,setPending]=useState(false);
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setPending(true);setError("");
    try {
      const response=await fetch("/api/client/requests",{method:"POST",body:new FormData(event.currentTarget)});
      const body=await response.json() as {id?:number;error?:string};
      if(!response.ok||!body.id)throw new Error(body.error||"The request could not be saved.");
      router.push(`/dashboard/requests/${body.id}?created=1`);router.refresh();
    } catch (problem) { setError(problem instanceof Error?problem.message:"The request could not be saved.");setPending(false); }
  }
  return <form className="panel form-grid" onSubmit={submit} encType="multipart/form-data"><input type="hidden" name="idempotencyKey" value={key}/><div className="field full"><span className="eyebrow">{requestType==="onboarding"?"New showroom request":"Showroom change request"}</span><p>{requestType==="onboarding"?"Your workspace has no published showroom yet. This request starts the first private design and review cycle.":"Your current showroom stays live while SuqPage prepares this change privately."}</p></div><div className="field full"><label htmlFor="client-request-text">Your request</label><textarea id="client-request-text" name="requestText" required minLength={10} maxLength={10000} placeholder="Write the changes or information in your own words. A list is fine."/></div><div className="field full"><label htmlFor="client-request-images">Reference images <span className="optional">optional</span></label><input id="client-request-images" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple/><small>Up to 10 JPEG, PNG, or WebP images, 5 MB each. Images stay private.</small></div>{error&&<p className="error field full" role="alert">{error}</p>}<div className="field full"><button className="btn brand" disabled={pending}>{pending?"Sending request…":"Send request to SuqPage"}</button></div></form>;
}
