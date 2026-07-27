import { fulfillBlueprintMediaSlotAction } from "@/app/revision-actions";
import type {
  BlueprintMediaSlot,
  BlueprintReadiness,
} from "@/lib/showroom-blueprint";

type MediaSlotView = BlueprintMediaSlot & {
  complete: boolean;
  previewUrl: string;
};

export default function BlueprintMediaBoard({
  requestId,
  revisionId,
  slots,
  readiness,
}: {
  requestId: number;
  revisionId: number;
  slots: MediaSlotView[];
  readiness: BlueprintReadiness;
}) {
  return (
    <section className="panel blueprint-media" id="media-plan">
      <div className="blueprint-section-head">
        <div>
          <p className="eyebrow">Media</p>
          <h2>Fill the recipe&apos;s image slots</h2>
          <p>
            Upload directly to the destination the AI selected. Required images
            must be complete before client review; optional slots can use their
            reviewed no-media treatment.
          </p>
        </div>
        <div className="blueprint-progress" aria-label="Media completion">
          <strong>{readiness.complete}/{readiness.total}</strong>
          <span>slots ready</span>
          <progress value={readiness.complete} max={Math.max(1, readiness.total)} />
        </div>
      </div>
      {slots.length ? (
        <div className="media-slot-grid">
          {slots.map((slot) => (
            <article className={`media-slot-card ${slot.complete ? "is-complete" : ""}`} key={slot.key}>
              <div className="media-slot-preview">
                {slot.previewUrl ? (
                  <img src={slot.previewUrl} alt={slot.altText || slot.label} />
                ) : (
                  <div className="media-slot-placeholder" aria-hidden="true">
                    <span>{slot.aspectRatio}</span>
                  </div>
                )}
                <span className={`slot-status ${slot.complete ? "ready" : slot.required ? "needed" : "optional"}`}>
                  {slot.complete ? "Ready" : slot.required ? "Needed" : "Optional"}
                </span>
              </div>
              <div className="media-slot-copy">
                <p className="eyebrow">{slot.ownerType} · {slot.aspectRatio}</p>
                <h3>{slot.label}</h3>
                <p>{slot.purpose}</p>
                {slot.classification === "illustrative" ? (
                  <small>Illustrative until staff accepts or replaces it.</small>
                ) : null}
              </div>
              <form action={fulfillBlueprintMediaSlotAction} className="media-slot-form">
                <input type="hidden" name="requestId" value={requestId} />
                <input type="hidden" name="revisionId" value={revisionId} />
                <input type="hidden" name="slotKey" value={slot.key} />
                <input type="hidden" name="label" value={slot.label} />
                <label htmlFor={`slot-${slot.key}`}>
                  {slot.complete ? "Replace image" : "Upload image"}
                </label>
                <input
                  id={`slot-${slot.key}`}
                  name="image"
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                />
                <label className="check-field">
                  <input type="checkbox" name="rights" required />
                  Authorized for this showroom
                </label>
                <button className="btn secondary">
                  {slot.complete ? "Replace" : "Add to slot"}
                </button>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <div className="media-plan-empty">
          <strong>No image checklist yet</strong>
          <p>
            Import the blueprint first. The AI recipe will create labeled image
            destinations here based on its chosen products and sections.
          </p>
        </div>
      )}
      {slots.length ? (
        <p className={readiness.reviewReady ? "notice" : "media-readiness-note"}>
          {readiness.reviewReady
            ? "All required media is ready for client review."
            : `${readiness.unresolvedRequired.length} required slot${readiness.unresolvedRequired.length === 1 ? "" : "s"} remaining.`}
        </p>
      ) : null}
    </section>
  );
}
