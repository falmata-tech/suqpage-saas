"use client";

import { useRef, useState } from "react";
import {
  admitRecipeYouTubeAction,
  importShowroomRecipeAction,
} from "@/app/revision-actions";

export default function RecipeStudio({
  requestId,
  revisionId,
  brief,
  briefIntent,
  currentRecipe,
  initialRecipe,
  youtubeEnabled,
}: {
  requestId: number;
  revisionId: number;
  brief: string;
  briefIntent: "initial_showroom" | "showroom_change";
  currentRecipe: string;
  initialRecipe: string;
  youtubeEnabled: boolean;
}) {
  const [recipe, setRecipe] = useState("");
  const [copied, setCopied] = useState<"brief" | "current" | null>(null);
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
        {[
          ["Brief", "#studio-1"],
          ["Import", "#studio-2"],
          ["Images", "#media-plan"],
          ["Edit", "#showroom-editing"],
          ["Preview", "#showroom-preview-action"],
        ].map(([label, href], index) => (
          <a href={href} key={label}>
            <span>{index + 1}</span>
            {label}
          </a>
        ))}
      </nav>

      <section className="panel recipe-step" id="studio-1">
        <span className="step-number">1</span>
        <div>
          <p className="eyebrow">Brief</p>
          <h2>{briefIntent === "initial_showroom" ? "Prepare the AI initial design brief" : "Prepare the AI change brief"}</h2>
          <p>
            The brief includes current content, design choices, image options,
            and all required rules. It excludes credentials, private storage
            details, and information from other businesses.
          </p>
          <div className="inline-actions">
            <button
              type="button"
              className="btn brand"
              onClick={async () => {
                await navigator.clipboard.writeText(brief);
                setCopied("brief");
              }}
            >
              {copied === "brief" ? "Brief copied" : "Copy AI brief"}
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => download(brief, `mirtpage-brief-${requestId}.json`)}
            >
              Download brief
            </button>
          </div>
          <div className="studio-current-export">
            <p className="eyebrow">Current showroom</p>
            <h3>Continue from the latest design</h3>
            <p>
              This complete design file includes the latest staff, client,
              offering, content, and media changes. Give it to the AI
              with the change brief when revising an existing showroom.
            </p>
            <div className="inline-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(currentRecipe);
                  setCopied("current");
                }}
              >
                {copied === "current" ? "Current design copied" : "Copy current design"}
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => download(currentRecipe, `mirtpage-current-showroom-${requestId}.json`)}
              >
                Download current design
              </button>
            </div>
          </div>
          <details className="studio-details">
            <summary>Complete design-file example</summary>
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
            <p className="eyebrow">Showroom design</p>
            <h2>Import the AI&apos;s complete design</h2>
            <p>
              The AI can choose dynamic products, sections, and labeled image
              spaces. Images that do not exist yet remain on the image checklist,
              so the layout can be reviewed before photography is ready.
            </p>
            <label htmlFor="recipe-file">Choose showroom design file</label>
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
            <label htmlFor="showroom-recipe">Showroom design JSON</label>
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
            <button className="btn brand">Check design and open preview</button>
          </div>
        </form>
      </section>

      {youtubeEnabled ? <details className="panel reference-media">
        <summary>Connect a business video</summary>
        <p>
          Use this after import when the design includes a process or offering
          video. MirtPage validates the YouTube link; select it later from the
          relevant showroom or offering field.
        </p>
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
      </details> : null}
    </div>
  );
}
