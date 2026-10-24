const associations = require('../../public/.well-known/assetlinks.json');
const policy = require('./release-policy.json');
const publicPaths = [
  { path: '/' }, { path: '/market' }, { path: '/featured' }, { path: '/about' },
  { path: '/login' }, { path: '/account' }, { path: '/transport-plan' }, { path: '/tracking' }, { pathPrefix: '/tracking/' }, { pathPrefix: '/@' },
];
function androidAppLinks(packageName) {
  if(packageName!=='com.mirtpage.app'||packageName!==policy.packageName)return [];
  const target=Object.hasOwn(policy.dataTargets,'mirtpage-production')?policy.dataTargets['mirtpage-production']:null;
  if(!target||target.apiOrigin!=='https://mirtpage.com')return [];
  const identity = associations.find(a => a.target?.namespace === 'android_app' && a.target.package_name === packageName);
  if (!identity || !identity.target.sha256_cert_fingerprints?.length) return [];
  for(const fingerprint of identity.target.sha256_cert_fingerprints)
    if(!/^(?:[A-F0-9]{2}:){31}[A-F0-9]{2}$/.test(fingerprint))throw Error('Invalid public signing fingerprint.');
  if(identity.target.sha256_cert_fingerprints.length!==1||identity.target.sha256_cert_fingerprints[0].replaceAll(':','')!==policy.certificateSha256)throw Error('Public signing association does not match the reviewed AfricMade signer.');
  return [{action:'VIEW',autoVerify:true,category:['BROWSABLE','DEFAULT'],data:publicPaths.map(path=>({scheme:'https',host:'mirtpage.com',...path}))}];
}
module.exports = { androidAppLinks };
