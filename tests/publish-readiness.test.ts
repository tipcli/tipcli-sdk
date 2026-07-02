import { describe, expect, test } from "vitest";
import {
  auditSdkPublishReadiness,
  type SdkPublishFileSystem,
} from "../src/publish-readiness";

function memoryFs(files: Record<string, string>): SdkPublishFileSystem {
  return {
    exists(path) {
      return Object.prototype.hasOwnProperty.call(files, path);
    },
    read(path) {
      return files[path] ?? "";
    },
  };
}

const packageJson = JSON.stringify({
  description:
    "Privacy-safe sponsor cards for human-visible open-source software surfaces.",
  exports: {
    ".": {
      import: "./dist/index.js",
      require: "./dist/index.cjs",
      types: "./dist/index.d.ts",
    },
  },
  files: ["dist", "README.md", "SURFACE-POLICY.md", "LICENSE", "recipes"],
  keywords: [
    "ai-agents",
    "cli",
    "developer-tools",
    "mcp",
    "open-source",
    "privacy",
    "sponsorship",
    "terminal",
  ],
  main: "./dist/index.cjs",
  name: "@tipcli/sdk",
  repository: {
    type: "git",
    url: "git+https://github.com/tipcli/tipcli-sdk.git",
  },
  scripts: {
    "consumer:smoke": "pnpm build && tsx scripts/consumer-smoke.ts",
  },
  type: "module",
  types: "./dist/index.d.ts",
  version: "0.1.0",
});

describe("auditSdkPublishReadiness", () => {
  test("passes when npm-facing metadata, README, and build outputs are present", () => {
    const result = auditSdkPublishReadiness(
      memoryFs({
        "README.md":
          "Privacy-safe sponsored terminal cards\nTIPCLI_DISABLED=1\nshowSponsorCard",
        "dist/index.cjs": "",
        "dist/index.d.ts": "",
        "dist/index.js": "",
        "LICENSE": "",
        "package.json": packageJson,
        "SURFACE-POLICY.md": "",
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.checks.every((check) => check.ok)).toBe(true);
  });

  test("reports missing README and unsafe package metadata", () => {
    const result = auditSdkPublishReadiness(
      memoryFs({
        "package.json": JSON.stringify({
          name: "@tipcli/sdk",
          version: "0.1.0",
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(
      result.checks.filter((check) => !check.ok).map((check) => check.name),
    ).toEqual(
      expect.arrayContaining([
        "package metadata",
        "published files",
        "consumer smoke script",
        "README",
        "build outputs",
      ]),
    );
  });

  test("requires exact GitHub repository metadata for Trusted Publishing", () => {
    const result = auditSdkPublishReadiness(
      memoryFs({
        "README.md":
          "Privacy-safe sponsored terminal cards\nTIPCLI_DISABLED=1\nshowSponsorCard",
        "dist/index.cjs": "",
        "dist/index.d.ts": "",
        "dist/index.js": "",
        "package.json": JSON.stringify({
          ...JSON.parse(packageJson),
          repository: {
            type: "git",
            url: "git+https://github.com/someone-else/tipcli-sdk.git",
          },
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.checks).toContainEqual({
      detail: "Missing or invalid: repository.url",
      name: "package metadata",
      ok: false,
    });
  });
});
