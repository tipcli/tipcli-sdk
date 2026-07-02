export type TipCLICategory =
  | "frontend"
  | "backend"
  | "database"
  | "ai"
  | "infra"
  | "security"
  | "devops"
  | "other";

export type ShowSponsorCardOptions = {
  publisherKey?: string;
  surface: string;
  category?: TipCLICategory;
  apiBaseUrl?: string;
  timeoutMs?: number;
  silent?: boolean;
  deliveryMode?: "live" | "test";
};

export type SponsorCard = {
  campaignId: string;
  clickUrl: string;
  displayUrl: string;
  impressionToken: string;
  message: string;
  payable?: boolean;
  sponsorName: string;
};

export type SponsorRequest = {
  apiBaseUrl: string;
  category?: TipCLICategory;
  ci?: boolean;
  deliveryMode?: "live" | "test";
  publisherKey: string;
  sdkDisabled?: boolean;
  sdkVersion: string;
  sessionId: string;
  surface: string;
  timeoutMs: number;
};

export type ImpressionRequest = {
  apiBaseUrl: string;
  impressionToken: string;
  timeoutMs: number;
};
