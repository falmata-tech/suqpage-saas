/** Pure conversion for the native visual picker; persistence remains validated hex. */
export type HsvColor = { hue: number; saturation: number; brightness: number };
const clamp = (n: number, max: number) => Math.min(max, Math.max(0, n));
export function hsvToHex({ hue, saturation, brightness }: HsvColor): string {
  const h = ((hue % 360) + 360) % 360 / 60, s = clamp(saturation, 1), v = clamp(brightness, 1);
  const c = v * s, x = c * (1 - Math.abs(h % 2 - 1)), m = v - c;
  const rgb = h < 1 ? [c,x,0] : h < 2 ? [x,c,0] : h < 3 ? [0,c,x] : h < 4 ? [0,x,c] : h < 5 ? [x,0,c] : [c,0,x];
  return '#' + rgb.map(n => Math.round((n+m)*255).toString(16).padStart(2,'0')).join('').toUpperCase();
}
export function hexToHsv(value: string): HsvColor {
  const [r,g,b] = [1,3,5].map(i => parseInt(value.slice(i,i+2),16)/255);
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max-min;
  const hue = d === 0 ? 0 : 60 * (max === r ? ((g-b)/d + 6)%6 : max === g ? (b-r)/d+2 : (r-g)/d+4);
  return { hue, saturation: max ? d/max : 0, brightness: max };
}
