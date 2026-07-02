import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchSponsor, recordImpression } from "../src/client";

describe("SDK client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends only approved fields to the sponsor endpoint", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({
        campaignId: "campaign-1",
        clickUrl: "https://tipcli.test/api/click?token=abc",
        displayUrl: "neon.tech",
        impressionToken: "impression-token",
        message: "Database branches for every preview deploy.",
        sponsorName: "Neon",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchSponsor({
      apiBaseUrl: "https://tipcli.test",
      category: "database",
      publisherKey: "db_live_abcdefghijklmnopqrstuvwxyz12345678901234567",
      sdkVersion: "0.1.0",
      sessionId: "session_123",
      surface: "cli-startup",
      timeoutMs: 1000,
    });

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));
    expect(Object.keys(body).sort()).toEqual([
      "category",
      "ci",
      "deliveryMode",
      "publisherKey",
      "sdkDisabled",
      "sdkVersion",
      "sessionId",
      "surface",
    ]);
    expect(body).toMatchObject({
      ci: false,
      deliveryMode: "live",
      sdkDisabled: false,
    });
  });

  it("normalizes trailing slashes in sponsor API base URLs", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({
        campaignId: "campaign-1",
        clickUrl: "https://tipcli.test/api/click?token=abc",
        displayUrl: "neon.tech",
        impressionToken: "impression-token",
        message: "Database branches for every preview deploy.",
        sponsorName: "Neon",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchSponsor({
      apiBaseUrl: "https://tipcli.test/",
      publisherKey: "db_live_abcdefghijklmnopqrstuvwxyz12345678901234567",
      sdkVersion: "0.1.0",
      sessionId: "session_123",
      surface: "cli-startup",
      timeoutMs: 1000,
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://tipcli.test/api/sponsor",
    );
  });

  it("records impressions with only the token", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({ ok: true }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await recordImpression({
      apiBaseUrl: "https://tipcli.test",
      impressionToken: "impression-token",
      timeoutMs: 1000,
    });

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(JSON.parse(String(requestInit.body))).toEqual({
      impressionToken: "impression-token",
    });
  });

  it("normalizes trailing slashes in impression API base URLs", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({ ok: true }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await recordImpression({
      apiBaseUrl: "https://tipcli.test/",
      impressionToken: "impression-token",
      timeoutMs: 1000,
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://tipcli.test/api/impression",
    );
  });
});
