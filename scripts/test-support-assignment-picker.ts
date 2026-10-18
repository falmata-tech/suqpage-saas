import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";
import { chromium } from "playwright";
import type { SupportAssignmentPickerProps } from "../components/SupportAssignmentPicker";

type PickerSnapshot = {
  value: string;
  formValue: FormDataEntryValue | null;
  sameNode: boolean;
  options: Array<{ value: string; text: string; disabled: boolean }>;
};
type PickerHarness = {
  renderPicker: (props: SupportAssignmentPickerProps) => PickerSnapshot;
};

test("FE-019 saved assignment changes refresh the actual React select while unrelated refresh preserves manual intent", { timeout: 45_000 }, async () => {
  const bundle = await build({
    stdin: {
      contents: `
        import React from "react";
        import {createRoot} from "react-dom/client";
        import {flushSync} from "react-dom";
        import SupportAssignmentPicker from "./components/SupportAssignmentPicker";
        const root=createRoot(document.getElementById("root"));
        window.renderPicker=props=>{
          const previous=document.querySelector("select");
          flushSync(()=>root.render(<form><SupportAssignmentPicker {...props}/></form>));
          const select=document.querySelector("select");
          return {
            value:select.value,
            formValue:new FormData(select.form).get("assignedUserId"),
            sameNode:select===previous,
            options:Array.from(select.options,option=>({value:option.value,text:option.text,disabled:option.disabled})),
          };
        };`,
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
  });
  const browser = await chromium.launch({ headless: true, timeout: 20_000 });
  try {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const render = (props: SupportAssignmentPickerProps) => page.evaluate(props => (window as unknown as PickerHarness).renderPicker(props), props);
    const fixture: SupportAssignmentPickerProps = {
      conversationId: 41,
      assignedUserId: 1,
      assignedUserName: "First agent",
      agents: [
        { userId: 1, name: "First agent", openConversations: 137 },
        { userId: 2, name: "Second agent", openConversations: 136 },
        { userId: 3, name: "Third agent", openConversations: 135 },
      ],
      label: "Assign support agent",
      waitingLabel: "Waiting queue",
      pausedLabel: "Paused",
    };
    let result = await render(fixture);
    assert.equal(result.value, "1");
    assert.ok(result.options.some(option => option.text === "First agent (137)"), "Actual workload remains visible above 100, without a denominator");
    await page.locator("select").selectOption("2");
    result = await render({ ...fixture, agents: fixture.agents.map(agent => ({ ...agent, openConversations: agent.openConversations + 1 })) });
    assert.equal(result.value, "2", "Ordinary server-prop refresh must preserve an intentional unsaved choice");
    assert.equal(result.sameNode, true);
    result = await render({ ...fixture, assignedUserId: 3, assignedUserName: "Third agent" });
    assert.equal(result.value, "3", "Changed saved assignment must replace the stale browser selection");
    assert.equal(result.formValue, "3");
    assert.equal(result.sameNode, false);
    result = await render({ ...fixture, assignedUserId: null, assignedUserName: null });
    assert.equal(result.value, "");
    assert.equal(result.formValue, "");
    await page.locator("select").selectOption("2");
    result = await render({ ...fixture, conversationId: 42, assignedUserId: null, assignedUserName: null });
    assert.equal(result.value, "", "Another waiting case must not inherit an unsaved selection");
    result = await render({ ...fixture, agents: fixture.agents.filter(agent => agent.userId !== 1) });
    assert.equal(result.value, "1", "A paused saved assignee remains visible");
    assert.equal(result.formValue, "1", "The retained option must be submittable so Save cannot unintentionally unassign");
    assert.deepEqual(result.options.find(option => option.value === "1"), { value: "1", text: "First agent (Paused)", disabled: false });
    result = await render({ ...fixture, conversationId: 43, assignedUserId: 2, assignedUserName: "Second agent", agents: fixture.agents.filter(agent => agent.userId !== 1) });
    assert.ok(!result.options.some(option => option.value === "1"), "Paused staff cannot become a new alternative for another case");
    assert.deepEqual(errors, [], "Actual React rendering must not throw browser errors");
  } finally {
    await browser.close();
  }
});
