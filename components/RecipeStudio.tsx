"use client";

import { useRef, useState } from "react";
import {
  admitRecipeImageAction,
  admitRecipeYouTubeAction,
  importShowroomRecipeAction,
} from "@/app/revision-actions";

export default function RecipeStudio({
  requestId,
  revisionId,
  brief,
  initialRecipe,
  youtubeEnabled,
}: {
  requestId: number;
  revisionId: number;
  brief: string;
  initialRecipe: string;
  youtubeEnabled: boolean;
}) {
  const [recipe, setRecipe] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const download = (contents: string, name: string) => {
    const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="recipe-studio">
      <nav className="studio-progress" aria-label="Showroom production stages">
        {["Brief", "Blueprint", "Media", "Preview", "Review"].map((label, index) => (
          <a href={index === 2 ? "#media-plan" : `#studio-${index + 1}`} key={label}>
            <span>{index + 1}</span>
            {label}
          </a>
        ))}
      </nav>

      <section className="panel recipe-step" id="studio-1">
        <span className="step-number">1</span>
        <div>
          <p className="eyebrow">Brief</p>
          <h2>Give the AI the complete showroom contract</h2>
          <p>
            The brief includes the current content, dynamic limits, component
            bank, source facts, and allowed private media descriptors. It
            excludes credentials, storage paths, and other tenants.
          </p>
          <div className="inline-actions">
            <button
              type="button"
              className="btn brand"
              onClick={async () => {
                await navigator.clipboard.writeText(brief);
                setCopied(true);
              }}
            >
              {copied ? "Brief copied" : "Copy AI brief"}
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => download(brief, `suqpage-brief-${requestId}.json`)}
            >
              Download brief
            </button>
          </div>
          <details className="studio-details">
            <summary>Complete valid recipe example</summary>
            <pre className="recipe-code">{initialRecipe}</pre>
          </details>
        </div>
      </section>

      <section className="panel recipe-step" id="studio-2">
        <span className="step-number">2</span>
        <form action={importShowroomRecipeAction} className="form-grid">
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="revisionId" value={revisionId} />
          <div className="field full">
            <p className="eyebrow">Blueprint</p>
            <h2>Import the AI&apos;s complete plan</h2>
            <p>
              The AI can choose dynamic products, sections, and labeled image
              destinations. Images that do not exist yet belong in the media
              plan, so the layout can be reviewed before photography is ready.
            </p>
            <label htmlFor="recipe-file">Choose recipe JSON</label>
            <input
              ref={fileInput}
              id="recipe-file"
              type="file"
              accept="application/json,.json"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) setRecipe(await file.text());
              }}
            />
          </div>
          <div className="field full">
            <label htmlFor="showroom-recipe">Recipe JSON</label>
            <textarea
              id="showroom-recipe"
              name="recipe"
              required
              value={recipe}
              onChange={(event) => setRecipe(event.target.value)}
              className="recipe-input"
              placeholder='{"schemaVersion":1,"content":{...},"design":{...},"mediaPlan":[...]}'
            />
            <small>{new Blob([recipe]).size.toLocaleString()} bytes · maximum 1 MiB</small>
          </div>
          <div className="field full">
            <button className="btn brand">Validate blueprint and open preview</button>
          </div>
        </form>
      </section>

      <details className="panel reference-media">
        <summary>Add reference media before blueprinting</summary>
        <p>
          This is optional. Use it when the AI should assign an image that the
          client has already approved; otherwise import the blueprint first and
          fill its labeled slots below.
        </p>
        <form action={admitRecipeImageAction} className="form-grid">
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="revisionId" value={revisionId} />
          <div className="field">
            <label htmlFor="recipe-media-label">Reference label</label>
            <input id="recipe-media-label" name="label" required maxLength={120} placeholder="Approved workshop photograph" />
          </div>
          <div className="field">
            <label htmlFor="recipe-media-file">JPEG, PNG, or WebP</label>
            <input id="recipe-media-file" name="image" type="file" required accept="image/jpeg,image/png,image/webp" />
          </div>
          <label className="check-field full">
            <input type="checkbox" name="rights" required />
            Authorized for this showroom and the approved AI conversation
          </label>
          <div className="field full"><button className="btn secondary">Verify reference image</button></div>
        </form>
        {youtubeEnabled ? (
          <form action={admitRecipeYouTubeAction} className="form-grid">
            <input type="hidden" name="requestId" value={requestId} />
            <input type="hidden" name="revisionId" value={revisionId} />
            <div className="field">
              <label htmlFor="recipe-youtube-label">Video label</label>
              <input id="recipe-youtube-label" name="youtubeLabel" required maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="recipe-youtube-url">YouTube watch or share URL</label>
              <input id="recipe-youtube-url" name="youtubeUrl" type="url" required maxLength={500} />
            </div>
            <label className="check-field full">
              <input type="checkbox" name="youtubeRights" required />
              Authorized for this showroom
            </label>
            <div className="field full"><button className="btn secondary">Validate video</button></div>
          </form>
        ) : null}
      </details>
    </div>
  );
}
