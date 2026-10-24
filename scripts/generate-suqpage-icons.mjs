import {generateAfricMadeAssets} from './generate-africmade-assets.mjs';

// Historical command name is kept for old instructions and saved shortcuts.
// It must never regenerate the previous SuqPage artwork.
const check=process.argv.includes('--check');
generateAfricMadeAssets({check}).then(files=>console.log(JSON.stringify({checked:check,files})))
 .catch(error=>{console.error(error);process.exitCode=1;});
