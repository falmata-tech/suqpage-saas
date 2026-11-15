import { approvedDemoVideo } from './video/demo-video-catalog';
import { productVideo } from './video/product-video';

/** The public, reviewed S197 process-video cohort. Other demos and real tenants
 * are deliberately outside this finite operator path. */
export const PROCESS_MEDIA_TARGETS = [
 [1,'selam-weave'],
 [2,'afia-botanics'],
 [3,'warka-furniture'],
 [4,'addis-metalworks'],
 [8,'entoto-ceramics'],
 [9,'koba-leather'],
 [10,'nova-assembly'],
 [11,'demo-aster-device-workshop'],
 [12,'demo-lume-solar-repair'],
 [13,'demo-tana-radio-works'],
 [14,'demo-shewa-cable-studio'],
 [15,'demo-desta-appliance-repair'],
 [16,'demo-orbit-meter-workshop'],
 [17,'demo-kora-solar-lights'],
 [18,'demo-nile-sensor-studio'],
 [19,'demo-aloe-field-care'],
 [20,'demo-muna-botanical-studio'],
 [21,'demo-liya-soap-kitchen'],
 [22,'demo-biftu-natural-oils'],
 [23,'demo-hana-herbal-works'],
 [24,'demo-sena-body-care'],
 [25,'demo-meriem-hair-care'],
 [26,'demo-zema-plant-balms'],
 [30,'demo-kaffa-spice-kitchen'],
 [34,'demo-tena-food-kitchen'],
 [35,'demo-shewa-tool-workshop'],
 [36,'demo-rift-metal-studio'],
 [37,'demo-abay-machine-works'],
 [38,'demo-tana-welding-shop'],
 [39,'demo-bale-equipment-repair'],
 [40,'demo-dawa-hand-tools'],
 [41,'demo-kaffa-mill-workshop'],
 [42,'demo-sidama-fabrication'],
 [43,'demo-meda-furniture-studio'],
 [44,'demo-tullu-timber-works'],
 [45,'demo-buna-basket-house'],
 [47,'demo-aster-lighting-works'],
 [48,'demo-wabi-joinery-studio'],
 [49,'demo-sena-home-textiles'],
 [51,'demo-sora-workwear-studio'],
 [52,'demo-liya-textile-house'],
 [53,'demo-biftu-leather-goods'],
 [54,'demo-meda-uniform-works'],
 [55,'demo-kora-weaving-studio'],
 [56,'demo-ayni-garment-room'],
 [57,'demo-tana-cloth-house'],
 [58,'demo-zema-bag-studio'],
 [59,'demo-abay-electrical-assembly'],
 [60,'demo-netsa-hygiene-products'],
 [63,'demo-sheger-rebar-works'],
 [64,'demo-omo-packaging-factory'],
 [65,'demo-lemi-building-products'],
 [66,'demo-awash-garment-factory'],
] as const;

export type DemoProcessMediaCorrection = {
 kind:'process_media_correction'; direction:'apply'|'rollback'; operationKey:string;
 businessId:number; handle:string; ownerUserId:number; providerUserId:string;
 expectedHash:string; expectedContentVersion:number; expectedDraftVersion:number;
 expectedPageRevision:number; expectedStage:number; expectedCycle:number; expectedDueAt:number;
 processVideoBefore:string; processVideoAfter:string;
};

const invalid=():never=>{throw Error('Invalid reviewed demo process media correction.');};
const integer=(value:unknown,min:number)=>Number.isSafeInteger(value)&&Number(value)>=min?Number(value):invalid();
const checkedText=(value:unknown,pattern:RegExp)=>typeof value==='string'&&pattern.test(value)?value:invalid();

/** Admit only an exact target, same-business packaged asset, and a reversible
 * managed reference. Private request binding supplies the exact old ref. */
export function parseDemoProcessMediaCorrection(raw:unknown):DemoProcessMediaCorrection{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return invalid();
 const v=raw as Record<string,unknown>;
 const keys=['kind','direction','operationKey','businessId','handle','ownerUserId','providerUserId',
  'expectedHash','expectedContentVersion','expectedDraftVersion','expectedPageRevision',
  'expectedStage','expectedCycle','expectedDueAt','processVideoBefore','processVideoAfter'];
 if(Object.keys(v).some(key=>!keys.includes(key))||v.kind!=='process_media_correction'||
  (v.direction!=='apply'&&v.direction!=='rollback'))return invalid();
 const businessId=integer(v.businessId,1);
 const target=PROCESS_MEDIA_TARGETS.find(([id])=>id===businessId);
 if(!target||v.handle!==target[1])return invalid();
 const before=checkedText(v.processVideoBefore,/^(?:youtube:[A-Za-z0-9_-]{11}|demo:[a-z0-9-]{1,32})$/);
 const after=checkedText(v.processVideoAfter,/^(?:youtube:[A-Za-z0-9_-]{11}|demo:[a-z0-9-]{1,32})$/);
 const beforeVideo=productVideo(before),afterVideo=productVideo(after);
 if(before===after||v.direction==='apply'&&(
  beforeVideo.provider!=='youtube'||after!==`demo:business-${businessId}`||!approvedDemoVideo(after,businessId))||
  v.direction==='rollback'&&(
   before!==`demo:business-${businessId}`||!approvedDemoVideo(before,businessId)||afterVideo.provider!=='youtube'))return invalid();
 const expectedStage=integer(v.expectedStage,-1);
 if(expectedStage>5)return invalid();
 return {kind:'process_media_correction',direction:v.direction,
  operationKey:checkedText(v.operationKey,/^[a-zA-Z0-9_-]{12,64}$/),businessId,handle:target[1],
  ownerUserId:integer(v.ownerUserId,1),providerUserId:checkedText(v.providerUserId,/^[0-9a-f-]{32,64}$/i),
  expectedHash:checkedText(v.expectedHash,/^[0-9a-f]{64}$/),expectedContentVersion:integer(v.expectedContentVersion,1),
  expectedDraftVersion:integer(v.expectedDraftVersion,1),expectedPageRevision:integer(v.expectedPageRevision,1),
  expectedStage,expectedCycle:integer(v.expectedCycle,0),expectedDueAt:integer(v.expectedDueAt,0),
  processVideoBefore:before,processVideoAfter:after};
}
