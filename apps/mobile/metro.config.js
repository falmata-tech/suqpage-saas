const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
// Web keeps its patched React release. Native and all its hoisted dependencies
// must resolve the one React version pinned by this Expo SDK, including JSX.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (/^(react|react-dom)(\/|$)/.test(moduleName)) {
    return {
      type: "sourceFile",
      filePath: require.resolve(moduleName, { paths: [__dirname] }),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};
module.exports = config;
