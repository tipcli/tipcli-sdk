# TipCLI Human-Visible Sponsorship Policy

Version: `human-visible-v1`

TipCLI sponsor cards belong in human-visible software moments. They must never be hidden inside machine output, model context, generated code, automation logs, or tool responses.

## Allowed

- The sponsor card is visible to a human before or after a workflow moment.
- The placement is clearly labeled as sponsored.
- The maintainer controls the placement and can remove it.
- The card is non-blocking and the tool keeps working when TipCLI is unavailable.
- The placement can be reviewed before payable delivery starts.

Examples:

- CLI startup or command-completion output.
- AI agent run summaries visible to the operator.
- MCP setup pages, health pages, inspector pages, or tool-discovery pages.
- Template or starter post-create handoff screens.
- Plugin panels and local developer dashboards.

## Blocked

- Hidden prompts, agent memory, LLM context, or generated-code injection.
- Sponsor content inside MCP tool responses.
- Sponsor content inside JSON APIs, CI output, logs used by automation, or other machine-readable output.
- Placements that impersonate errors, dependency warnings, security alerts, maintainer messages, or package-manager notices.
- Payable delivery from fixtures, tests, CI, disabled mode, internal demos, or invisible machine calls.

## Review Rule

When in doubt, TipCLI treats the surface as non-payable until an operator can verify that the sponsor card is visible to a human and does not pollute machine-readable workflow output.

## Why This Exists

Developer tooling has already rejected surprise ads in dependency install output. TipCLI is deliberately constrained in the opposite direction: no install hooks, no fake warnings, no hidden workflow manipulation, no source-code access, no terminal-log upload, and no sponsor copy inside model or MCP payloads.

This policy is the product boundary. If a placement needs hidden context, behavioral targeting, or machine-consumed injection to work, it is not a TipCLI placement.
