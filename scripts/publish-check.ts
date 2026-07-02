#!/usr/bin/env tsx

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  auditSdkPublishReadiness,
  type SdkPublishFileSystem,
} from "../src/publish-readiness";

const root = process.cwd();

const fs: SdkPublishFileSystem = {
  exists(path) {
    return existsSync(join(root, path));
  },
  read(path) {
    return readFileSync(join(root, path), "utf8");
  },
};

const result = auditSdkPublishReadiness(fs);

for (const check of result.checks) {
  const marker = check.ok ? "PASS" : "FAIL";
  const detail = check.detail ? ` - ${check.detail}` : "";
  console.log(`${marker} ${check.name}${detail}`);
}

if (!result.ok) {
  process.exit(1);
}
