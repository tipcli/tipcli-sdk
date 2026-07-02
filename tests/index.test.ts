import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalCi = process.env.CI;
const originalDisabled = process.env.TIPCLI_DISABLED;
const originalApiUrl = process.env.TIPCLI_API_URL;
const originalApiBaseUrl = process.env.TIPCLI_API_BASE_URL;

async function importFreshSdk() {
  vi.resetModules();
  return import("../src/index");
}

describe("showSponsorCard", () => {
  beforeEach(() => {
    delete process.env.CI;
    delete process.env.TIPCLI_API_URL;
    delete process.env.TIPCLI_API_BASE_URL;
    delete process.env.TIPCLI_DISABLED;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env.CI = originalCi;
    process.env.TIPCLI_API_URL = originalApiUrl;
    process.env.TIPCLI_API_BASE_URL = originalApiBaseUrl;
    process.env.TIPCLI_DISABLED = originalDisabled;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("does nothing in CI", async () => {
    process.env.CI = "1";
    const fetchMock = vi.fn();
    const logMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
    vi.stubGlobal("fetch", fetchMock);
    const { showSponsorCard } = await importFreshSdk();

    await showSponsorCard({
      publisherKey: "db_live_abcdefghijklmnopqrstuvwxyz12345678901234567",
      surface: "cli-startup",
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(logMock).not.toHaveBeenCalled();
  });

  it("does nothing when disabled", async () => {
    process.env.TIPCLI_DISABLED = "1";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { showSponsorCard } = await importFreshSdk();

    await showSponsorCard({
      publisherKey: "db_live_abcdefghijklmnopqrstuvwxyz12345678901234567",
      surface: "cli-startup",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never throws when the API is unavailable", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("network down");
    });
    vi.stubGlobal("fetch", fetchMock);
    const { showSponsorCard } = await importFreshSdk();

    await expect(
      showSponsorCard({
        publisherKey: "db_live_abcdefghijklmnopqrstuvwxyz12345678901234567",
        surface: "cli-startup",
      }),
    ).resolves.toBeUndefined();
  });

  it("prints one card and records one impression", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          campaignId: "campaign-1",
          clickUrl: "https://tipcli.test/api/click?token=abc",
          displayUrl: "neon.tech",
          impressionToken: "impression-token",
          message: "Database branches for every preview deploy.",
          sponsorName: "Neon",
        }),
      )
      .mockResolvedValueOnce(Response.json({ ok: true }));
    const logMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
    vi.stubGlobal("fetch", fetchMock);
    const { showSponsorCard } = await importFreshSdk();

    await showSponsorCard({
      apiBaseUrl: "https://tipcli.test",
      category: "database",
      publisherKey: "db_live_abcdefghijklmnopqrstuvwxyz12345678901234567",
      surface: "cli-startup",
    });

    expect(logMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("prints non-payable cards without recording an impression", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      Response.json({
        campaignId: "house-card",
        clickUrl: "https://tipcli.test/sponsors/apply",
        displayUrl: "tipcli.test",
        impressionToken: "non-payable-house-card",
        message: "This developer tool is looking for a sponsor.",
        payable: false,
        sponsorName: "Sponsor this tool",
      }),
    );
    const logMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
    vi.stubGlobal("fetch", fetchMock);
    const { showSponsorCard } = await importFreshSdk();

    await showSponsorCard({
      apiBaseUrl: "https://tipcli.test",
      category: "devops",
      publisherKey: "db_live_abcdefghijklmnopqrstuvwxyz12345678901234567",
      surface: "cli-startup",
    });

    expect(logMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uses the production Vercel API by default", async () => {
    const fetchMock = vi.fn<typeof fetch>(
      async () =>
        new Response(null, {
          status: 204,
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { showSponsorCard } = await importFreshSdk();

    await showSponsorCard({
      publisherKey: "db_live_abcdefghijklmnopqrstuvwxyz12345678901234567",
      surface: "cli-startup",
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://tipcli.com/api/sponsor");
  });
});
