// DEP-053: disposable Android debug testing, never a production build profile.
function nativeQaConfig(config, env) {
  const profile = env.AFRICMADE_MOBILE_BUILD_PROFILE || env.SUQPAGE_MOBILE_BUILD_PROFILE || 'development';
  if (env.AFRICMADE_NATIVE_QA !== '1' || profile !== 'development' ||
      env.EXPO_PUBLIC_API_ORIGIN !== 'http://10.0.2.2:3000' || env.EXPO_PUBLIC_NATIVE_MAP_FIXTURE !== '1') {
    throw Error('Native QA requires explicit development, emulator-local API and synthetic map settings.');
  }
  const forbidden = ['EAS_BUILD', 'EAS_BUILD_PROFILE', 'EAS_BUILD_PLATFORM', 'EXPO_TOKEN',
    'EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'AFRICMADE_MOBILE_DATA_TARGET', 'SUQPAGE_MOBILE_DATA_TARGET',
    'AFRICMADE_GOOGLE_SERVICES_FILE', 'SUQPAGE_GOOGLE_SERVICES_FILE', 'MIRTPAGE_GOOGLE_SERVICES_FILE'];
  if (forbidden.some(key => Boolean(env[key]))) throw Error('Native QA cannot contain hosted, Auth, Firebase or release inputs.');
  const extra = {...config.extra};
  delete extra.eas;
  return {...config, name: 'AfricMade QA', slug: 'africmade-qa', owner: undefined,
    android: {...config.android, package: 'com.africmade.qa', scheme: 'africmade-qa',
      googleServicesFile: undefined, intentFilters: [], versionCode: 1},
    ios: {...config.ios, bundleIdentifier: 'com.africmade.qa', scheme: 'africmade-qa'},
    plugins: [...(config.plugins || []), 'expo-dev-client'], extra};
}
module.exports = {nativeQaConfig};
