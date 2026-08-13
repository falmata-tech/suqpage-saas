import Link from "next/link";
import { ClipboardList, Eye, Palette, SlidersHorizontal } from "lucide-react";

type WorkflowStep = "request" | "design" | "edit" | "preview";

export default function ClientWorkflowNav({
  requestId,
  revisionId,
  active,
  canEdit = true,
  canPreview = true,
}: {
  requestId: number;
  revisionId?: number;
  active: WorkflowStep;
  canEdit?: boolean;
  canPreview?: boolean;
}) {
  const steps = canEdit ? [
    { key: "request" as const, label: "Project", href: `/dashboard/requests/${requestId}`, icon: ClipboardList, available: true },
    { key: "design" as const, label: "AI redesign", href: revisionId ? `/dashboard/requests/${requestId}/revisions/${revisionId}/studio` : "", icon: Palette, available: Boolean(revisionId) },
    { key: "edit" as const, label: "Edit showroom", href: revisionId ? `/dashboard/requests/${requestId}/revisions/${revisionId}/edit` : "", icon: SlidersHorizontal, available: Boolean(revisionId) },
    { key: "preview" as const, label: "Preview", href: revisionId ? `/dashboard/requests/${requestId}/revisions/${revisionId}/preview` : "", icon: Eye, available: Boolean(revisionId && canPreview) },
  ] : [
    { key: "request" as const, label: "Project", href: `/dashboard/requests/${requestId}`, icon: ClipboardList, available: true },
    ...(revisionId && canPreview ? [{ key: "preview" as const, label: "Review preview", href: `/dashboard/requests/${requestId}/revisions/${revisionId}/preview`, icon: Eye, available: true }] : []),
  ];
  return (
    <nav className={`client-workflow-nav ${canEdit ? "staff" : "client"}`} aria-label="Showroom project navigation">
      {steps.map((step) => {
        const Icon = step.icon;
        const contents = <><Icon aria-hidden="true" size={17}/><b>{step.label}</b></>;
        return step.available ? (
          <Link key={step.key} href={step.href} aria-current={active === step.key ? "step" : undefined}>{contents}</Link>
        ) : (
          <span key={step.key} className="disabled" aria-disabled="true">{contents}</span>
        );
      })}
    </nav>
  );
}
