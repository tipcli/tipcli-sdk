import { renderSponsorCard } from "./render";
import { fetchSponsor } from "./client";

type CliIo = {
  stderr: (line: string) => void;
  stdout: (line: string) => void;
};

type ParsedArgs = {
  command?: string;
  flags: Record<string, string | true>;
};

const sampleCard = {
  message: "Fast previews, clean deploys, and calm production launches.",
  sponsorName: "TipCLI Preview Sponsor",
  url: "https://tipcli.com",
};
const defaultApiBaseUrl = "https://tipcli.com";
const livePublisherKeyPattern = /^db_live_[A-Za-z0-9_-]{43}$/;

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const flags: Record<string, string | true> = {};

  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];

    if (!item?.startsWith("--")) {
      continue;
    }

    const key = item.slice(2);
    const next = rest[index + 1];

    if (!next || next.startsWith("--")) {
      flags[key] = true;
      continue;
    }

    flags[key] = next;
    index += 1;
  }

  return { command, flags };
}

function stringFlag(
  flags: ParsedArgs["flags"],
  key: string,
  fallback: string,
): string {
  const value = flags[key];

  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function displayUrlFrom(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

function usage(): string {
  return [
    "Usage: tipcli <command>",
    "",
    "Commands:",
    "  preview  Render a local sponsor card without contacting TipCLI",
    "  doctor   Check whether a publisher key can receive a test card",
    "  trust    Print the SDK privacy and delivery guarantees",
    "",
    "Preview flags:",
    "  --sponsor <name>   Sponsor name shown in the card",
    "  --message <text>   Sponsor message shown in the card",
    "  --url <url>        Sponsor destination URL",
    "",
    "Doctor flags:",
    "  --publisher-key <key>  Live publisher key from the TipCLI dashboard",
    "  --api-url <url>        TipCLI API origin, defaults to https://tipcli.com",
    "  --surface <name>       Surface to test, defaults to cli-doctor",
  ].join("\n");
}

function trustReceipt(): string {
  return [
    "TipCLI trust receipt",
    "",
    "The SDK:",
    "- Does not read source code",
    "- Does not collect terminal logs",
    "- Does not read .env files",
    "- Does not inspect package contents",
    "- Does not upload dependency lists",
    "- Does not fingerprint developers",
    "- Skips automatically in CI",
    "- Respects TIPCLI_DISABLED=1",
    "- Fails silently if the API is unavailable",
    "",
    "Network fields sent during live delivery:",
    "- publisherKey, surface, category, sdkVersion, anonymous session id",
    "- ci, deliveryMode, and sdkDisabled delivery flags",
  ].join("\n");
}

function previewCard(flags: ParsedArgs["flags"]): string {
  const sponsorName = stringFlag(flags, "sponsor", sampleCard.sponsorName);
  const message = stringFlag(flags, "message", sampleCard.message);
  const clickUrl = stringFlag(flags, "url", sampleCard.url);

  return renderSponsorCard({
    clickUrl,
    displayUrl: displayUrlFrom(clickUrl),
    message,
    sponsorName,
  });
}

async function runDoctor(flags: ParsedArgs["flags"], io: CliIo): Promise<number> {
  const publisherKey = stringFlag(flags, "publisher-key", "");

  if (!livePublisherKeyPattern.test(publisherKey)) {
    io.stderr(
      "Publisher key is missing or invalid. Pass --publisher-key db_live_...",
    );
    return 1;
  }

  const apiBaseUrl = stringFlag(flags, "api-url", defaultApiBaseUrl);
  const surface = stringFlag(flags, "surface", "cli-doctor");

  try {
    const card = await fetchSponsor({
      apiBaseUrl,
      deliveryMode: "test",
      publisherKey,
      sdkVersion: "0.1.1",
      sessionId: "tipcli-doctor",
      surface,
      timeoutMs: 3000,
    });

    if (!card) {
      io.stderr(
        "No test card returned. Check project status, serving mode, and dashboard eligibility.",
      );
      return 1;
    }

    io.stdout(`Test card received from ${apiBaseUrl}.`);
    io.stdout(renderSponsorCard(card));
    return 0;
  } catch {
    io.stderr(`Could not reach ${apiBaseUrl}.`);
    return 1;
  }
}

export async function runCli(
  argv: string[],
  io: CliIo = {
    stderr: (line) => console.error(line),
    stdout: (line) => console.log(line),
  },
): Promise<number> {
  const parsed = parseArgs(argv);

  if (!parsed.command || parsed.command === "help" || parsed.flags.help) {
    io.stdout(usage());
    return 0;
  }

  if (parsed.command === "preview") {
    io.stdout(previewCard(parsed.flags));
    return 0;
  }

  if (parsed.command === "doctor") {
    return runDoctor(parsed.flags, io);
  }

  if (parsed.command === "trust") {
    io.stdout(trustReceipt());
    return 0;
  }

  io.stderr(usage());
  return 1;
}
