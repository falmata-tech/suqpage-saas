import path from 'node:path';
import {africmadeDerivatives,generateAfricMadeAssets} from './generate-africmade-assets.mjs';

// Compatibility entry point for old build instructions. All derivatives now
// come from the owner-supplied AfricMade art; it cannot restore an old logo.
export const mirtpageDerivatives=africmadeDerivatives;
export const generateMirtpageIcons=generateAfricMadeAssets;

if(process.argv[1]&&path.basename(process.argv[1])==='generate-mirtpage-icons.mjs'){
 const check=process.argv.includes('--check');
 generateAfricMadeAssets({check}).then(files=>console.log(JSON.stringify({checked:check,files})))
  .catch(error=>{console.error(error);process.exitCode=1;});
}
