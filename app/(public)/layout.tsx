import PublicAppShell from "@/components/PublicAppShell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicAppShell>{children}</PublicAppShell>;
}
