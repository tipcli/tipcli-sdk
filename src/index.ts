import { fetchSponsor, recordImpression } from "./client";
import { renderSponsorCard } from "./render";
import { getAnonymousSessionId } from "./session";
import type { ShowSponsorCardOptions } from "./types";

export type {
  TipCLICategory,
  ShowSponsorCardOptions,
  SponsorCard,
} from "./types";

const SDK_VERSION = "0.1.0";
const DEFAULT_TIMEOUT_MS = 1000;
const DEFAULT_API_BASE_URL = "https://tipcli.com";

let sponsorCardShown = false;

function apiBaseUrlFrom(options: ShowSponsorCardOptions): string {
  return (
    options.apiBaseUrl ??
    process.env.TIPCLI_API_URL ??
    process.env.TIPCLI_API_BASE_URL ??
    process.env.DEVBILLBOARD_API_URL ??
    process.env.DEVBILLBOARD_API_BASE_URL ??
    DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
}

function shouldSkip(options: ShowSponsorCardOptions): boolean {
  return (
    sponsorCardShown ||
    Boolean(process.env.CI) ||
    process.env.TIPCLI_DISABLED === "1" ||
    process.env.DEVBILLBOARD_DISABLED === "1" ||
    !options.publisherKey
  );
}

export async function showSponsorCard(
  options: ShowSponsorCardOptions,
): Promise<void> {
  if (shouldSkip(options)) {
    return;
  }

  const publisherKey = options.publisherKey;

  if (!publisherKey) {
    return;
  }

  try {
    const sponsor = await fetchSponsor({
      apiBaseUrl: apiBaseUrlFrom(options),
      category: options.category,
      deliveryMode: options.deliveryMode,
      publisherKey,
      sdkVersion: SDK_VERSION,
      sessionId: await getAnonymousSessionId(),
      surface: options.surface,
      timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });

    if (!sponsor) {
      return;
    }

    console.log(renderSponsorCard(sponsor));
    sponsorCardShown = true;

    if (sponsor.payable === false) {
      return;
    }

    await recordImpression({
      apiBaseUrl: apiBaseUrlFrom(options),
      impressionToken: sponsor.impressionToken,
      timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });
  } catch {
    return;
  }
}
