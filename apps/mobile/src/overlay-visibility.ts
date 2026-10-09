let overlays = 0;
export function registerOverlay() { overlays++; let released=false; return () => { if(!released){released=true;overlays=Math.max(0,overlays-1);} }; }
export function overlayIsOpen() { return overlays>0; }
