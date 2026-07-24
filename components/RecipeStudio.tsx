"use client";

import { useRef, useState } from "react";
import {
  admitRecipeImageAction,
  importShowroomRecipeAction,
} from "@/app/revision-actions";

export default function RecipeStudio({
  requestId,
  revisionId,
  brief,
  initialRecipe,
}: {
  requestId: number;
  revisionId: number;
  brief: string;
  initialRecipe: string;
}) {
  const [recipe, setRecipe] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const download = (contents: string, name: string) => {
    const url = URL.createObjectURL(
      new Blob([contents], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="recipe-studio">
      <section className="panel recipe-step">
        <span className="step-number">0</span>
        <form action={admitRecipeImageAction} className="form-grid">
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="revisionId" value={revisionId} />
          <div className="field full">
            <h2>Admit private media first</h2>
            <p>
              Client request images are already available. Add any additional
              verified image before exporting so the AI can refer to its opaque
              asset key without receiving a storage path.
            </p>
          </div>
          <div className="field">
            <label htmlFor="recipe-media-label">Staff label</label>
            <input
              id="recipe-media-label"
              name="label"
              required
              maxLength={120}
              placeholder="Example: Approved wide workshop hero"
            />
          </div>
          <div className="field">
            <label htmlFor="recipe-media-file">JPEG, PNG, or WebP</label>
            <input
              id="recipe-media-file"
              name="image"
              type="file"
              required
              accept="image/jpeg,image/png,image/webp"
            />
          </div>
          <label className="check-field full">
            <input type="checkbox" name="rights" required />
            I confirm this image is authorized for this client showroom and the
            approved external AI conversation.
          </label>
          <div className="field full">
            <button className="btn secondary">Verify and add media</button>
          </div>
        </form>
      </section>
      <section className="panel recipe-step">
        <span className="step-number">1</span>
        <div>
          <h2>Export the AI brief</h2>
          <p>
            This contains the exact component bank, current content, permitted
            media keys, source facts, rules, and a complete valid example. It
            contains no passwords, sessions, raw storage paths, or other tenants.
          </p>
          <div className="inline-actions">
            <button
              type="button"
              className="btn"
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
        </div>
      </section>
      <section className="panel recipe-step">
        <span className="step-number">2</span>
        <div>
          <h2>Work in the approved external AI account</h2>
          <p>
            Explain the desired showroom in normal language and provide this
            brief. If the AI needs to see approved images, attach the same files
            manually in that conversation. SuqPage sends nothing automatically.
          </p>
          <details>
            <summary>Show complete valid recipe example</summary>
            <pre className="recipe-code">{initialRecipe}</pre>
          </details>
        </div>
      </section>
      <section className="panel recipe-step">
        <span className="step-number">3</span>
        <form action={importShowroomRecipeAction} className="form-grid">
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="revisionId" value={revisionId} />
          <div className="field full">
            <h2>Import the returned recipe</h2>
            <p>
              Paste JSON or choose a JSON file. SuqPage rejects unsupported
              fields, inventory, unsafe URLs, unknown assets, missing sources,
              silent removals, and incompatible design combinations.
            </p>
            <label htmlFor="recipe-file">Choose JSON file</label>
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
            <label htmlFor="showroom-recipe">Showroom recipe JSON</label>
            <textarea
              id="showroom-recipe"
              name="recipe"
              required
              value={recipe}
              onChange={(event) => setRecipe(event.target.value)}
              className="recipe-input"
              placeholder='{"schemaVersion":1,...}'
            />
            <small>{new Blob([recipe]).size.toLocaleString()} bytes · maximum 1 MiB</small>
          </div>
          <div className="field full">
            <button className="btn brand">Validate and open private preview</button>
          </div>
        </form>
      </section>
    </div>
  );
}
