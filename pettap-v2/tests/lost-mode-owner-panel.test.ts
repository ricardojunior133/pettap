import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { presentLostModeOwner } from "@/features/lost-mode/components/lost-mode-owner-presenter";

describe("Lost Mode owner panel presenter", () => {
  it("maps the normal state to a confirmed report flow with an optional private note", () => {
    const view = presentLostModeOwner(false);
    expect(view.statusMessage).toContain("not currently marked as missing"); expect(view.primaryAction).toBe("Report as missing");
    expect(view.confirmation).toContain("public profile will change immediately"); expect(view.formFields).toEqual(["petId", "details"]);
    expect(view.gpsMessage).toContain("does not provide GPS"); expect(view.privacyMessage).toContain("privacy preferences");
  });
  it("maps Lost state to a recovery confirmation with no user-provided status", () => {
    const view = presentLostModeOwner(true);
    expect(view.statusMessage).toContain("currently in Lost Mode"); expect(view.primaryAction).toBe("Mark as safe");
    expect(view.formFields).toEqual(["petId"]); expect(view.formFields).not.toContain("accountId"); expect(view.formFields).not.toContain("status");
  });
  it("uses only the existing actions, accessible feedback, confirmation forms and pending disabling", () => {
    const source = readFileSync("features/lost-mode/components/lost-mode-owner-panel.tsx", "utf8");
    expect(source).toContain("enableLostModeAction"); expect(source).toContain("disableLostModeAction");
    expect(source).toContain("aria-live=\"polite\""); expect(source).toContain("disabled={pending}");
    expect(source).toContain('name="petId"'); expect(source).toContain('name="details"');
    expect(source).not.toContain('name="accountId"'); expect(source).not.toContain('name="status"');
  });
});
