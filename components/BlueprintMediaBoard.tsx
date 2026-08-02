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
          <p className="eyebrow">Showroom images</p>
          <h2>Complete the image checklist</h2>
          <p>
            Upload each image where the design requires it. Required images
            must be ready before client review; optional spaces may use their
            approved fallback design.
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
                  <small>Illustrative image. Review or replace it before publication.</small>
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
                    {slot.complete ? "Replace" : "Add image"}
                </button>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <div className="media-plan-empty">
          <strong>The image checklist is not ready yet</strong>
          <p>
            Import the showroom design first. MirtPage will then show every
            labeled image needed for its products and sections.
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
