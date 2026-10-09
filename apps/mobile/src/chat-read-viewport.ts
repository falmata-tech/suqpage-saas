export type ChatReadViewport = {height:number;topInset:number;bottomInset:number;keyboardTop?:number;visibleTop?:number;visibleHeight?:number};
const finite=(value:number|undefined)=>typeof value==='number'&&Number.isFinite(value)&&value>=0?value:undefined;

/** Layout coordinates; no platform keyboard method or browser object required. */
export function chatReadBounds(input:ChatReadViewport){
  const top=finite(input.visibleTop)??0;
  const upper=Math.max(input.topInset+52,top);
  const lower=Math.min(input.height-input.bottomInset-64,
    finite(input.keyboardTop)??input.height,
    input.visibleHeight===undefined?input.height:top+(finite(input.visibleHeight)??0));
  return {upper,lower};
}
