const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
// Shared copy and pure UI/domain contracts live outside the app workspace.
// Watch lib so edits to storefront-copy.ts also invalidate the native preview.
config.watchFolders = [...new Set([...(config.watchFolders || []), require("node:path").resolve(__dirname, "../../lib")])];
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
