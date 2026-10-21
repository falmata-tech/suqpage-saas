import { canMaintainBasicProducts } from './capabilities';
import { runtimeGet,runtimeRun,runtimeTransaction } from './runtime-sql';
import { OwnerPageError } from './owner-page-domain';
import type { SessionUser } from './types';
import { currentBusinessAuthority } from './staff-business-authority';
export type CategoryChange={kind:'create'|'update'|'delete';businessId:number;id?:number;name?:string;slug?:string;sortOrder?:number;active?:boolean};
export async function changeProductCategory(actor:SessionUser,command:CategoryChange){
 const {businessId}=command;
 if(!Number.isSafeInteger(businessId)||businessId<1)throw new OwnerPageError('Business not found.',404);
 if(command.kind!=='delete'&&(!command.name?.trim()||command.name.length>100||!command.slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(command.slug)))throw new OwnerPageError('Add a category name and a valid address.');
 if(command.kind!=='create'&&(!Number.isSafeInteger(command.id)||command.id!<1))throw new OwnerPageError('Category not found.',404);
 return runtimeTransaction(async()=>{
  const authority=await currentBusinessAuthority(actor,businessId,true);
  if(!authority||!canMaintainBasicProducts(actor,businessId,authority==='staff'))throw new OwnerPageError('Category access is not available.',403);
  const locked=await runtimeRun('UPDATE businesses SET content_version=content_version WHERE id=?',[businessId]);if(!locked.changes)throw new OwnerPageError('Business not found.',404);
  if(command.kind!=='create'&&!await runtimeGet('SELECT 1 FROM categories WHERE id=? AND business_id=?',[command.id!,businessId]))throw new OwnerPageError('Category not found.',404);
  if(command.kind==='create')await runtimeRun('INSERT INTO categories(business_id,collection_id,name,slug,sort_order,is_active) VALUES(?,NULL,?,?,?,1)',[businessId,command.name!,command.slug!,command.sortOrder||0]);
  else if(command.kind==='update')await runtimeRun('UPDATE categories SET name=?,slug=?,sort_order=?,is_active=? WHERE id=? AND business_id=?',[command.name!,command.slug!,command.sortOrder||0,Number(command.active),command.id!,businessId]);
  else {await runtimeRun('UPDATE products SET category_id=NULL WHERE business_id=? AND category_id=?',[businessId,command.id!]);await runtimeRun('DELETE FROM categories WHERE business_id=? AND id=?',[businessId,command.id!]);}
  await runtimeRun('UPDATE businesses SET content_version=content_version+1 WHERE id=?',[businessId]);
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,?,?,'')",[actor.id,businessId,`category.${command.kind}`,JSON.stringify({categoryId:command.id||null})]);
 });
}
