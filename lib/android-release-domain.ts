export type AndroidArtifactMetadata = {
  packageName: string;
  versionCode: number;
  debuggable: boolean;
  certificateSha256: readonly string[];
};
export type AndroidSigningPolicy = {packageName:string;certificateSha256:string|null};

export function signingFingerprint(value: string): string {
  const normalized=value.replaceAll(':','').toUpperCase();
  if(!/^[A-F0-9]{64}$/.test(normalized))throw Error('Invalid signing certificate fingerprint.');
  return normalized;
}
function validateMetadata(value:AndroidArtifactMetadata,policy:AndroidSigningPolicy,certificate:string){
  if(value.packageName!==policy.packageName)throw Error('APK package does not match the AfricMade app.');
  if(!Number.isSafeInteger(value.versionCode)||value.versionCode<1||value.versionCode>2147483647)throw Error('APK version code is invalid.');
  if(value.debuggable!==false)throw Error('Debug APKs must not be distributed as releases.');
  if(value.certificateSha256.length!==1||signingFingerprint(value.certificateSha256[0])!==certificate)throw Error('APK signing certificate does not match the reviewed policy.');
}
/** Admission compares inspected artifacts, never client-claimed version/signature snapshots. */
export function validateAndroidRelease(candidate:AndroidArtifactMetadata,policy:AndroidSigningPolicy,previous:AndroidArtifactMetadata|null,firstCanonicalRelease=false){
  if(policy.packageName!=='com.africmade.app'||!policy.certificateSha256)throw Error('Verify and pin the AfricMade signing certificate before distribution.');
  const certificate=signingFingerprint(policy.certificateSha256);
  validateMetadata(candidate,policy,certificate);
  if(previous){
    if(firstCanonicalRelease)throw Error('Choose a prior APK or first canonical release, not both.');
    validateMetadata(previous,policy,certificate);
    if(candidate.versionCode<=previous.versionCode)throw Error('New APK version must be newer than the prior canonical APK.');
  }else if(!firstCanonicalRelease)throw Error('Select the prior canonical APK, or explicitly select the first canonical release.');
  return {...candidate,certificateSha256:[certificate]};
}
