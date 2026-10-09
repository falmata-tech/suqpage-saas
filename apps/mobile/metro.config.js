const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
// Public UI catalogs and pure video contracts live outside the app workspace.
config.watchFolders = [...new Set([...(config.watchFolders || []), require("node:path").resolve(__dirname, "../../lib/i18n"), require("node:path").resolve(__dirname, "../../lib/video"), require("node:path").resolve(__dirname,"../../lib/map")])];
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
