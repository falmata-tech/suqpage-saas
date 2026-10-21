/** Bounded presentation destinations; page storage and authorization remain unchanged. */
export const OWNER_PAGE_TASKS = [
  {key: 'about', label: 'About the business'},
  {key: 'cover', label: 'Cover photo'},
  {key: 'video', label: 'Business video'},
  {key: 'color', label: 'Page color'},
  {key: 'contacts', label: 'Public contact details'},
] as const;
export type OwnerPageTask = typeof OWNER_PAGE_TASKS[number]['key'];
export function ownerPageTask(value: unknown): OwnerPageTask {
  return OWNER_PAGE_TASKS.find(task => task.key === value)?.key || 'about';
}
export function ownerPageReturn(value: unknown): '/dashboard/profile' | '/dashboard/profile/showroom' {
  return value === 'profile' ? '/dashboard/profile' : '/dashboard/profile/showroom';
}
