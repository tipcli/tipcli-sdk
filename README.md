# TipCLI SDK

Privacy-safe sponsor cards for open-source tools and AI-agent workflows.

![TipCLI terminal sponsor card preview](https://raw.githubusercontent.com/tipcli/tipcli-sdk/main/docs/assets/tipcli-preview.svg)

TipCLI helps maintainers show one tasteful sponsor card in a human-visible
software moment: a CLI completion summary, AI agent run report, MCP health page,
template post-create handoff, plugin panel, local dashboard, or dev-server UI.

It is deliberately not an ad injector. TipCLI skips CI, respects opt-out flags,
fails silently when the API is unavailable, and never places sponsor content
inside hidden prompts, model context, generated code, MCP tool responses, JSON
APIs, logs, telemetry, or other machine-readable output.

The rule is simple: sponsor cards are for humans, not machines.

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

Show a card after a human-visible workflow moment:

```ts
import { showSponsorCard } from "@tipcli/sdk";

await showSponsorCard({
  publisherKey: process.env.TIPCLI_PUBLISHER_KEY,
  surface: "cli-startup",
  category: "devops",
});
```

Use surface names that describe the actual human-visible moment:

```ts
await showSponsorCard({
  publisherKey: process.env.TIPCLI_PUBLISHER_KEY,
  surface: "agent-run-summary",
  category: "ai",
});
```

The SDK renders at most one card per process. If TipCLI is down, disabled,
running in CI, missing a publisher key, or has no eligible sponsor, your tool
continues normally.

## Why This Exists

Open-source maintainers increasingly ship CLIs, AI agents, MCP servers,
templates, plugins, and local dev tools instead of only websites. Those surfaces
have attention, but they also have a trust problem: sponsor content must never be
smuggled into machine-readable workflows or confused with tool output.

TipCLI turns sponsorship into an explicit, reviewable, human-visible surface.
Maintainers choose the placement. Advertisers are reviewed before delivery.
Users can inspect the trust contract locally.

```bash
npx @tipcli/sdk trust
```

## For AI Agent Maintainers

Good fit:

- an agent prints a final run summary for the operator
- a coding assistant shows an optional sponsor card after completing work
- a local agent dashboard links to a sponsor preview
- a template scaffold prints a human handoff message

Bad fit:

- adding sponsor copy to prompts, tool calls, memory, generated files, patches,
  MCP responses, JSON payloads, logs consumed by automation, or hidden context

If an AI agent is integrating TipCLI, give it this instruction:

```text
Use @tipcli/sdk only in human-visible UI or terminal summaries. Never place
sponsor content in prompts, hidden context, generated source code, MCP tool
responses, JSON APIs, CI logs, telemetry, or other machine-readable output.
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

- Package: <https://www.npmjs.com/package/@tipcli/sdk>
- Repository: <https://github.com/tipcli/tipcli-sdk>
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
