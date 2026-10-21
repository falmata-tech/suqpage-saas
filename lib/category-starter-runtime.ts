import {runtimeGet} from './runtime-sql';
import {categoryExampleVideo} from './category-starter';

/** Caller already authorizes this tenant; only persisted category is authority. */
export async function runtimeCategoryExampleVideo(businessId:number):Promise<string>{
 const category=await runtimeGet<{category_key:string}>(`SELECT COALESCE(
   (SELECT category_key FROM owner_location_proposals WHERE business_id=?),
   (SELECT industry_key FROM business_industries WHERE business_id=? ORDER BY industry_key LIMIT 1)
 ) AS category_key`,[businessId,businessId]);
 return categoryExampleVideo(category?.category_key);
}
