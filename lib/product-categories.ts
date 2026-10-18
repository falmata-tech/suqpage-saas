import { canMaintainBasicProducts } from './capabilities';
import { runtimeGet,runtimeRun,runtimeTransaction } from './runtime-sql';
import { OwnerPageError } from './owner-page-domain';
import type { SessionUser } from './types';
export type CategoryChange={kind:'create'|'update'|'delete';businessId:number;id?:number;name?:string;slug?:string;sortOrder?:number;active?:boolean};
export async function changeProductCategory(actor:SessionUser,command:CategoryChange){
 const {businessId}=command;
 if(!Number.isSafeInteger(businessId)||businessId<1)throw new OwnerPageError('Business not found.',404);
 if(command.kind!=='delete'&&(!command.name?.trim()||command.name.length>100||!command.slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(command.slug)))throw new OwnerPageError('Add a category name and a valid address.');
 if(command.kind!=='create'&&(!Number.isSafeInteger(command.id)||command.id!<1))throw new OwnerPageError('Category not found.',404);
 return runtimeTransaction(async()=>{
  // Use the same transaction lock as staff queue/assignment changes. A retained
  // editor association must never turn a scoped chat agent into a catalog editor.
  await runtimeGet("SELECT pg_advisory_xact_lock(hashtextextended(current_schema() || ':support-work',0))");
  const current=await runtimeGet<SessionUser>(`SELECT u.id,u.business_id,p.access_role,COALESCE(s.queue_scope,'all') staff_queue_scope
    FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    LEFT JOIN support_agent_settings s ON s.user_id=u.id WHERE u.id=? FOR SHARE OF u,p`,[actor.id]);
  const assigned=current?.access_role==='team_member'&&Boolean(await runtimeGet('SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=? AND active=1',[actor.id,businessId]));
  if(!current||!canMaintainBasicProducts(current,businessId,assigned))throw new OwnerPageError('Category access is not available.',403);
  const locked=await runtimeRun('UPDATE businesses SET content_version=content_version WHERE id=?',[businessId]);if(!locked.changes)throw new OwnerPageError('Business not found.',404);
  if(command.kind!=='create'&&!await runtimeGet('SELECT 1 FROM categories WHERE id=? AND business_id=?',[command.id!,businessId]))throw new OwnerPageError('Category not found.',404);
  if(command.kind==='create')await runtimeRun('INSERT INTO categories(business_id,collection_id,name,slug,sort_order,is_active) VALUES(?,NULL,?,?,?,1)',[businessId,command.name!,command.slug!,command.sortOrder||0]);
  else if(command.kind==='update')await runtimeRun('UPDATE categories SET name=?,slug=?,sort_order=?,is_active=? WHERE id=? AND business_id=?',[command.name!,command.slug!,command.sortOrder||0,Number(command.active),command.id!,businessId]);
  else {await runtimeRun('UPDATE products SET category_id=NULL WHERE business_id=? AND category_id=?',[businessId,command.id!]);await runtimeRun('DELETE FROM categories WHERE business_id=? AND id=?',[businessId,command.id!]);}
  await runtimeRun('UPDATE businesses SET content_version=content_version+1 WHERE id=?',[businessId]);
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,?,?,'')",[actor.id,businessId,`category.${command.kind}`,JSON.stringify({categoryId:command.id||null})]);
 });
}
