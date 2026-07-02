# TipCLI SDK

Privacy-safe sponsorship for human-visible open-source software surfaces: CLIs,
AI agents, MCP servers, templates, plugins, local dashboards, dev servers, and
automation summaries.

TipCLI renders at most one tasteful sponsor card per process. It skips in CI,
respects opt-out flags, fails silently if the API is unavailable, and never
places sponsor content into hidden model context or machine-readable output.

## Try it in 10 seconds

Render a local-only sponsor card:

```bash
npx @tipcli/sdk preview \
  --sponsor "Neon" \
  --message "Database branches for every preview deploy." \
  --url https://neon.tech
```

Print the privacy and delivery contract:

```bash
npx @tipcli/sdk trust
```

Check a live publisher key with non-payable test delivery:

```bash
npx @tipcli/sdk doctor --publisher-key "$TIPCLI_PUBLISHER_KEY"
```

`preview` and `trust` are local-only. `doctor` contacts the TipCLI API with
`deliveryMode: "test"` so it can verify setup without reserving inventory,
creating payout evidence, or counting as paid delivery.

## Install

```bash
pnpm add @tipcli/sdk
```

```ts
import { showSponsorCard } from "@tipcli/sdk";

await showSponsorCard({
  publisherKey: process.env.TIPCLI_PUBLISHER_KEY,
  surface: "cli-startup",
  category: "devops",
});
```

Use surface names that describe the human-visible moment:

```ts
await showSponsorCard({
  publisherKey: process.env.TIPCLI_PUBLISHER_KEY,
  surface: "agent-run-summary",
  category: "ai",
});
```

## Where sponsor cards belong

Good surfaces:

- CLI startup or completion summaries
- AI agent run summaries shown to a human
- MCP setup or health pages shown in a browser
- template post-create handoffs
- plugin panels and local dashboards
- package docs, examples, and opt-in demos

Bad surfaces:

- hidden prompts
- LLM context windows
- generated source code
- MCP tool responses
- JSON APIs
- CI logs
- telemetry payloads
- any place the user cannot clearly see and understand

The rule is simple: ads can be shown to humans, not smuggled into machines.

## Privacy

The SDK does not collect source code, terminal logs, environment files, package
contents, dependency lists, or device fingerprints.

Live delivery sends only:

- `publisherKey`
- `surface`
- `category`
- `sdkVersion`
- anonymous session id
- delivery flags: `ci`, `deliveryMode`, and `sdkDisabled`

TipCLI also skips automatically when `process.env.CI` is set.

Users can disable sponsor cards explicitly:

```bash
TIPCLI_DISABLED=1 your-command
```

## Payable delivery

Local rendering is not payout evidence. TipCLI treats delivery as potentially
payable only when all of these are true:

- the project has passed TipCLI review
- the integration uses a live publisher key from the project dashboard
- a paid reviewed campaign matches the project category and placement
- the request is not CI, disabled, test, fixture, or internal delivery
- delivery is verified by TipCLI and connected to payout evidence
- publisher payout readiness is clear

Use local API overrides and disabled/test modes freely while integrating. They
are intentionally non-payable.

## Recipes

- [`recipes/commander-cli.ts`](recipes/commander-cli.ts): show a card after a
  CLI command completes.
- [`recipes/agent-run-summary.ts`](recipes/agent-run-summary.ts): show a card
  in a human-readable AI agent summary.
- [`recipes/mcp-health-page.ts`](recipes/mcp-health-page.ts): link to a TipCLI
  preview from an MCP server health page.
- [`recipes/template-postcreate.ts`](recipes/template-postcreate.ts): show a
  card after a project template finishes scaffolding.

## Public trust surfaces

- Public registry: <https://tipcli.com/registry>
- Surface policy: <https://tipcli.com/surface-policy>
- Local copy: [`SURFACE-POLICY.md`](SURFACE-POLICY.md)

If the registry has zero reviewed paid campaigns, it says so. TipCLI should be
boring where trust is concerned.

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
npm pack --dry-run
```

Use a custom API endpoint while developing:

```bash
TIPCLI_API_URL=http://localhost:3000 your-command
```

Local API overrides must not be used as launch evidence or payout evidence.
