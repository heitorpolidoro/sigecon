import { describe, it, expect } from "vitest";
import i18n from "../index";

describe("i18n configuration", () => {
  it("should be initialized", () => {
    expect(i18n.isInitialized).toBe(true);
  });

  it("should have resources for en and pt", () => {
    expect(i18n.options.resources).toHaveProperty("en");
    expect(i18n.options.resources).toHaveProperty("pt");
  });

  it("should use en as default language", () => {
    expect(i18n.language).toBe("en");
  });

  it("should translate correctly", () => {
    // Just a simple check to see if translation works
    expect(i18n.t("common.appName")).toBeDefined();
  });
});
