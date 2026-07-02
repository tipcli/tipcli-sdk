import { describe, expect, it } from "vitest";
import { renderSponsorCard } from "../src/render";

describe("renderSponsorCard", () => {
  it("renders sponsor name, message, and display URL", () => {
    const rendered = renderSponsorCard({
      clickUrl: "https://tipcli.test/api/click?token=abc",
      displayUrl: "neon.tech",
      message: "Database branches for every preview deploy.",
      sponsorName: "Neon",
    });

    expect(rendered).toContain("Sponsored by");
    expect(rendered).toContain("Neon");
    expect(rendered).toContain("Database branches");
    expect(rendered).toContain("neon.tech");
  });
});
