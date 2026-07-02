import { afterEach, describe, expect, it, vi } from "vitest";
import { runCli } from "../src/cli";

describe("tipcli cli", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a local preview card without contacting the network", async () => {
    const output: string[] = [];
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const exitCode = await runCli(
      [
        "preview",
        "--name",
        "Northstar CLI",
        "--sponsor",
        "Neon",
        "--message",
        "Database branches for every preview deploy.",
        "--url",
        "https://neon.tech",
      ],
      {
        stderr: (line) => output.push(line),
        stdout: (line) => output.push(line),
      },
    );

    expect(exitCode).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(output.join("\n")).toContain("Sponsored by");
    expect(output.join("\n")).toContain("Neon");
    expect(output.join("\n")).toContain("Database branches");
    expect(output.join("\n")).toContain("neon.tech");
  });

  it("prints a trust receipt for the SDK privacy contract", async () => {
    const output: string[] = [];

    const exitCode = await runCli(["trust"], {
      stderr: (line) => output.push(line),
      stdout: (line) => output.push(line),
    });

    const rendered = output.join("\n");

    expect(exitCode).toBe(0);
    expect(rendered).toContain("TipCLI trust receipt");
    expect(rendered).toContain("Does not read source code");
    expect(rendered).toContain("Does not collect terminal logs");
    expect(rendered).toContain("Skips automatically in CI");
    expect(rendered).toContain("Respects TIPCLI_DISABLED=1");
  });

  it("prints usage for unknown commands", async () => {
    const output: string[] = [];

    const exitCode = await runCli(["wat"], {
      stderr: (line) => output.push(line),
      stdout: (line) => output.push(line),
    });

    expect(exitCode).toBe(1);
    expect(output.join("\n")).toContain("Usage: tipcli <command>");
  });

  it("rejects doctor checks without a live publisher key", async () => {
    const output: string[] = [];

    const exitCode = await runCli(["doctor", "--publisher-key", "nope"], {
      stderr: (line) => output.push(line),
      stdout: (line) => output.push(line),
    });

    expect(exitCode).toBe(1);
    expect(output.join("\n")).toContain("Publisher key is missing or invalid");
  });

  it("uses test delivery to verify that the API can return a card", async () => {
    const output: string[] = [];
    const fetchMock = vi.fn(async () =>
      Response.json({
        campaignId: "test-mode",
        clickUrl: "https://tipcli.com/advertiser-policy",
        displayUrl: "tipcli.com",
        impressionToken: "test-mode-no-impression-token",
        message: "Test sponsor card. This is not paid delivery.",
        sponsorName: "TipCLI test sponsor",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const exitCode = await runCli(
      [
        "doctor",
        "--publisher-key",
        "db_live_abcdefghijklmnopqrstuvwxyz12345678901234567",
        "--api-url",
        "https://tipcli.test",
      ],
      {
        stderr: (line) => output.push(line),
        stdout: (line) => output.push(line),
      },
    );

    expect(exitCode).toBe(0);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://tipcli.test/api/sponsor",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(output.join("\n")).toContain("Test card received");
  });
});
