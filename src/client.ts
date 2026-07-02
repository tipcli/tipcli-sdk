import type { ImpressionRequest, SponsorCard, SponsorRequest } from "./types";

async function withTimeout<T>(
  timeoutMs: number,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

function isSponsorCard(value: unknown): value is SponsorCard {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeCard = value as Partial<SponsorCard>;

  return (
    typeof maybeCard.campaignId === "string" &&
    typeof maybeCard.clickUrl === "string" &&
    typeof maybeCard.displayUrl === "string" &&
    typeof maybeCard.impressionToken === "string" &&
    typeof maybeCard.message === "string" &&
    (maybeCard.payable === undefined || typeof maybeCard.payable === "boolean") &&
    typeof maybeCard.sponsorName === "string"
  );
}

function apiUrl(apiBaseUrl: string, path: string): string {
  return `${apiBaseUrl.replace(/\/+$/, "")}${path}`;
}

export async function fetchSponsor(
  request: SponsorRequest,
): Promise<SponsorCard | null> {
  const body: Record<string, boolean | string> = {
    ci: request.ci ?? false,
    deliveryMode: request.deliveryMode ?? "live",
    publisherKey: request.publisherKey,
    sdkDisabled: request.sdkDisabled ?? false,
    sdkVersion: request.sdkVersion,
    sessionId: request.sessionId,
    surface: request.surface,
  };

  if (request.category) {
    body.category = request.category;
  }

  return withTimeout(request.timeoutMs, async (signal) => {
    const response = await fetch(apiUrl(request.apiBaseUrl, "/api/sponsor"), {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      signal,
    });

    if (!response.ok || response.status === 204) {
      return null;
    }

    const parsed: unknown = await response.json();

    return isSponsorCard(parsed) ? parsed : null;
  });
}

export async function recordImpression(
  request: ImpressionRequest,
): Promise<void> {
  await withTimeout(request.timeoutMs, async (signal) => {
    await fetch(apiUrl(request.apiBaseUrl, "/api/impression"), {
      body: JSON.stringify({ impressionToken: request.impressionToken }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      signal,
    });
  });
}
