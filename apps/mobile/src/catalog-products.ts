import type {Offering,Shop} from '@suqpage/contracts';
import {isPublicProduct} from '../../../lib/offerings';

export function visibleCatalogProduct(product:Offering):boolean {
  return product.published&&isPublicProduct({offering_kind:product.kind});
}
export function inquiryCatalogProduct(product:Offering):boolean {
  return visibleCatalogProduct(product)&&['available','limited'].includes(product.availability);
}
type ProductSelection={product:Offering;quantity:string;options:Record<string,string>};
/** Rehydrate local selections from current public products before any handoff. */
export function restoreCatalogSelections(shop:Shop,selections:readonly ProductSelection[]):ProductSelection[] {
  return selections.flatMap(selection=>{
    const product=shop.products.find(item=>item.id===selection.product.id&&inquiryCatalogProduct(item));
    if(!product||Object.keys(selection.options).length!==product.options.length||product.options.some(group=>!group.values.includes(selection.options[group.name])))return [];
    return [{...selection,product}];
  });
}
