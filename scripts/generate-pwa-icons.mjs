import {generateAfricMadeAssets} from './generate-africmade-assets.mjs';

// Compatibility command: current and saved legacy PWA paths share the approved
// AfricMade source rather than an old platform mark.
const check=process.argv.includes('--check');
generateAfricMadeAssets({check}).then(files=>console.log(JSON.stringify({checked:check,files})))
 .catch(error=>{console.error(error);process.exitCode=1;});
