import Link from 'next/link';
import styles from './StaffWorkspaceNavigation.module.css';

/** These are peer tasks inside Staff, not a second global application menu. */
export default function StaffWorkspaceNavigation({active,accountsLabel,workloadLabel}:{
  active:'accounts'|'workload';accountsLabel:string;workloadLabel:string;
}) {
  return <nav className={styles.sections} aria-label={accountsLabel}>
    <Link href="/dashboard/admin/staff" aria-current={active==='accounts'?'page':undefined}>{accountsLabel}</Link>
    <Link href="/dashboard/support/agents" aria-current={active==='workload'?'page':undefined}>{workloadLabel}</Link>
  </nav>;
}
