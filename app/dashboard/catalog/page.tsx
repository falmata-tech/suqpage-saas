import Link from "next/link";
import {notFound} from "next/navigation";
import {getUiText} from "@/lib/i18n/server";
import {createCategoryAction,deleteCategoryAction,updateCategoryAction} from "@/app/actions";
import DashboardShell from "@/components/DashboardShell";
import FocusedEditForm from "@/components/FocusedEditForm";
import styles from "@/components/BusinessCatalog.module.css";
import {requireUser} from "@/lib/auth";
import {resolveProductBusiness as resolveBusiness} from "@/lib/dashboard";
import {runtimeCatalogByBusinessId} from "@/lib/catalog-runtime";

export const dynamic="force-dynamic";

export default async function CatalogPage({searchParams}:{searchParams:Promise<{
  business?:string;saved?:string;error?:string;edit?:string;view?:string;
}>}) {
  const t=await getUiText(),user=await requireUser(),query=await searchParams;
  const business=await resolveBusiness(user,query.business);
  if(!business)return null;
  const catalog=await runtimeCatalogByBusinessId(business.id,true);
  if(!catalog)notFound();
  const category=query.edit?catalog.categories.find(item=>String(item.id)===query.edit):undefined;
  if(query.edit&&!category)notFound();
  const listHref=`/dashboard/catalog?business=${business.id}`,productsHref=`/dashboard/products?business=${business.id}`;
  const creating=query.view==='new'&&!category,deleting=query.view==='delete'&&Boolean(category),editing=Boolean(category)||creating;
  const title=deleting?'Remove this category?':creating?'Add category':category?'Edit category':'Product categories';

  return <DashboardShell user={user} business={business}>
    <div className="navigation-trail"><nav aria-label={t('Breadcrumb')}><Link href={productsHref}>{t('Products')}</Link><span aria-hidden="true">/</span>{editing?<><Link href={listHref}>{t('Categories')}</Link><span aria-hidden="true">/</span></>:null}<span>{t(title)}</span></nav></div>
    <div className="dashboard-head standard-page-heading"><div><h1>{t(title)}</h1>{category?<p>{category.name}</p>:null}</div>{!editing?<Link className="btn brand" href={`${listHref}&view=new`}>{t('Add category')}</Link>:null}</div>
    {query.saved?<p className="notice">{t('Product categories saved.')}</p>:null}
    {query.error?<p className="error">{t(query.error)}</p>:null}
    {deleting&&category?<section className={`panel ${styles.editor}`}><p>{t('Products stay in your catalog without a category.')}</p><FocusedEditForm action={deleteCategoryAction} cancelHref={listHref} submitLabel="Delete" className="form-grid"><input type="hidden" name="businessId" value={business.id}/><input type="hidden" name="categoryId" value={category.id}/></FocusedEditForm></section>
    :editing?<section className={`panel ${styles.editor}`}><FocusedEditForm key={category?.id||'new'} action={creating?createCategoryAction:updateCategoryAction} cancelHref={listHref} submitLabel={creating?'Add category':'Save changes'} className="form-grid">
      <input type="hidden" name="businessId" value={business.id}/>{category?<input type="hidden" name="categoryId" value={category.id}/>:null}
      <label className="field full"><span>{t('Name')}</span><input name="name" required maxLength={100} defaultValue={category?.name||''}/></label>
      <label className="field"><span>{t('Slug')}</span><input name="slug" maxLength={80} defaultValue={category?.slug||''}/></label>
      <label className="field"><span>{t('Sort order')}</span><input name="sortOrder" type="number" defaultValue={category?.sort_order||0}/></label>
      {category?<label className="field full"><span><input type="checkbox" name="isActive" defaultChecked={Boolean(category.is_active)}/> {t('Active')}</span></label>:null}
    </FocusedEditForm>{category?<div className={styles.remove}><Link className="small-btn danger" href={`${listHref}&edit=${category.id}&view=delete`}>{t('Delete')}</Link></div>:null}</section>
    :catalog.categories.length?<section className={`panel ${styles.list}`} aria-label={t('Categories')}>{catalog.categories.map(item=><article className={styles.row} key={item.id}><div><h2>{item.name}</h2><p>{t('Products')}: {catalog.products.filter(product=>product.category_id===item.id).length} · {t('Sort')}: {item.sort_order}</p></div><span className={`badge ${item.is_active?'active':'draft'}`}>{t(item.is_active?'Active':'Inactive')}</span><Link className="small-btn" href={`${listHref}&edit=${item.id}`} aria-label={`${t('Edit')} ${item.name}`}>{t('Edit')}</Link></article>)}</section>
    :<section className="empty-state"><h2>{t('Categories')}</h2><Link className="btn brand" href={`${listHref}&view=new`}>{t('Add category')}</Link></section>}
  </DashboardShell>;
}
