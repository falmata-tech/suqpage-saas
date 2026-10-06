const associations = require('../../public/.well-known/assetlinks.json');
const publicPaths = [
  { path: '/' }, { path: '/market' }, { path: '/featured' }, { path: '/about' },
  { path: '/login' }, { path: '/account' }, { pathPrefix: '/@' },
];
function androidAppLinks(packageName) {
  const identity = associations.find(a => a.target?.namespace === 'android_app' && a.target.package_name === packageName);
  if (!identity || !identity.target.sha256_cert_fingerprints?.length) return [];
  for(const fingerprint of identity.target.sha256_cert_fingerprints)
    if(!/^(?:[A-F0-9]{2}:){31}[A-F0-9]{2}$/.test(fingerprint))throw Error('Invalid public signing fingerprint.');
  return [{action:'VIEW',autoVerify:true,category:['BROWSABLE','DEFAULT'],data:publicPaths.map(path=>({scheme:'https',host:'suqpage.com',...path}))}];
}
module.exports = { androidAppLinks };
