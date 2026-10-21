let overlays = 0;
let generation = 0;
export function registerOverlay() { overlays++; generation++; let released=false; return () => { if(!released){released=true;overlays=Math.max(0,overlays-1);generation++;} }; }
export function overlayIsOpen() { return overlays>0; }
export function overlayGeneration() { return generation; }
