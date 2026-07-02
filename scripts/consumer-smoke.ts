#!/usr/bin/env tsx

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function run(command: string, args: string[], cwd: string) {
  execFileSync(command, args, {
    cwd,
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_fund: "false",
    },
    stdio: "inherit",
  });
}

const packageRoot = process.cwd();
const workspace = mkdtempSync(join(tmpdir(), "tipcli-sdk-consumer-"));

try {
  const packOutput = execFileSync(
    "npm",
    ["pack", "--pack-destination", workspace],
    {
      cwd: packageRoot,
      encoding: "utf8",
    },
  ).trim();
  const tarball = join(workspace, packOutput.split(/\r?\n/).at(-1) ?? "");

  writeFileSync(
    join(workspace, "package.json"),
    JSON.stringify(
      {
        private: true,
        scripts: {
          smoke: "node index.mjs",
        },
        type: "module",
      },
      null,
      2,
    ),
  );
  run("npm", ["install", tarball], workspace);

  writeFileSync(
    join(workspace, "index.mjs"),
    [
      "import { showSponsorCard } from '@tipcli/sdk';",
      "if (typeof showSponsorCard !== 'function') throw new Error('showSponsorCard export missing');",
      "process.env.TIPCLI_DISABLED = '1';",
      "await showSponsorCard({ publisherKey: 'pk_live_smoke', surface: 'consumer-smoke' });",
    ].join("\n"),
  );
  run("npm", ["run", "smoke"], workspace);

  console.log("SDK consumer smoke passed.");
} finally {
  rmSync(workspace, { force: true, recursive: true });
}
