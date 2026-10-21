/** Browser clipboard adapter: a denied or false legacy copy is never success. */
function legacyCopy(value: string) {
  let area: HTMLTextAreaElement | null = null;
  try {
    area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area?.remove();
  }
}

export async function copyBrowserText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {}
  }
  return legacyCopy(value);
}

/** Copy during a contact tap, then open its destination; never send a message. */
export async function openCopiedBrowserLink(message: string, href: string, external = true): Promise<{copied:boolean;opened:boolean}> {
  let tab: Window | null = null;
  if (external) try { tab = window.open("about:blank", "_blank"); if (tab) tab.opener = null; } catch { /* Return the visible fallback. */ }
  const copied = await copyBrowserText(message);
  try {
    if (external) {
      if (!tab || tab.closed) throw Error("popup");
      tab.location.href = href;
    } else window.location.assign(href);
    return {copied,opened:true};
  } catch {
    try { tab?.close(); } catch { /* No permission to close the destination. */ }
    return {copied,opened:false};
  }
}
