export type SdkPublishCheck = {
  detail?: string;
  name: string;
  ok: boolean;
};

export type SdkPublishAuditResult = {
  checks: SdkPublishCheck[];
  ok: boolean;
};

export type SdkPublishFileSystem = {
  exists(path: string): boolean;
  read(path: string): string;
};

type PackageJson = {
  description?: string;
  exports?: unknown;
  files?: unknown;
  keywords?: unknown;
  main?: string;
  name?: string;
  repository?: unknown;
  scripts?: unknown;
  type?: string;
  types?: string;
  version?: string;
};

const requiredDistFiles = [
  "dist/index.cjs",
  "dist/index.d.ts",
  "dist/index.js",
] as const;

function parsePackageJson(fs: SdkPublishFileSystem): PackageJson | null {
  try {
    return JSON.parse(fs.read("package.json")) as PackageJson;
  } catch {
    return null;
  }
}

function hasExportMap(packageJson: PackageJson): boolean {
  const exportsMap =
    packageJson.exports && typeof packageJson.exports === "object"
      ? (packageJson.exports as Record<string, unknown>)
      : null;
  const rootExport = exportsMap?.["."];

  if (!rootExport || typeof rootExport !== "object") {
    return false;
  }

  const rootExportMap = rootExport as Record<string, unknown>;

  return (
    rootExportMap["import"] === "./dist/index.js" &&
    rootExportMap["require"] === "./dist/index.cjs" &&
    rootExportMap["types"] === "./dist/index.d.ts"
  );
}

function hasTrustedPublishingRepository(packageJson: PackageJson): boolean {
  const repository =
    packageJson.repository && typeof packageJson.repository === "object"
      ? (packageJson.repository as Record<string, unknown>)
      : null;

  return (
    repository?.["type"] === "git" &&
    repository["url"] === "git+https://github.com/tipcli/tipcli-sdk.git"
  );
}

function checkPackageMetadata(
  packageJson: PackageJson | null,
): SdkPublishCheck {
  const missing: string[] = [];

  if (!packageJson) {
    return {
      detail: "package.json could not be parsed.",
      name: "package metadata",
      ok: false,
    };
  }

  if (packageJson.name !== "@tipcli/sdk") missing.push("name");
  if (!packageJson.version) missing.push("version");
  if (!packageJson.description?.includes("Privacy-safe"))
    missing.push("privacy-safe description");
  if (packageJson.type !== "module") missing.push("type module");
  if (packageJson.main !== "./dist/index.cjs") missing.push("main");
  if (packageJson.types !== "./dist/index.d.ts") missing.push("types");
  if (!hasExportMap(packageJson)) missing.push("exports");
  if (!hasTrustedPublishingRepository(packageJson))
    missing.push("repository.url");

  const keywords = Array.isArray(packageJson.keywords)
    ? packageJson.keywords
    : [];
  for (const keyword of ["cli", "privacy", "sponsorship", "terminal"]) {
    if (!keywords.includes(keyword)) missing.push(`keyword ${keyword}`);
  }

  return {
    detail: missing.length
      ? `Missing or invalid: ${missing.join(", ")}`
      : undefined,
    name: "package metadata",
    ok: missing.length === 0,
  };
}

function checkPublishedFiles(packageJson: PackageJson | null): SdkPublishCheck {
  const files = Array.isArray(packageJson?.files) ? packageJson.files : [];
  const missing = ["dist", "README.md", "SURFACE-POLICY.md", "LICENSE"].filter(
    (entry) => !files.includes(entry),
  );

  return {
    detail: missing.length
      ? `Missing package files entry: ${missing.join(", ")}`
      : undefined,
    name: "published files",
    ok: missing.length === 0,
  };
}

function checkConsumerSmokeScript(
  packageJson: PackageJson | null,
): SdkPublishCheck {
  const scripts =
    packageJson?.scripts && typeof packageJson.scripts === "object"
      ? (packageJson.scripts as Record<string, unknown>)
      : {};
  const ok =
    scripts["consumer:smoke"] === "pnpm build && tsx scripts/consumer-smoke.ts";

  return {
    detail: ok ? undefined : "Missing package script: consumer:smoke.",
    name: "consumer smoke script",
    ok,
  };
}

function checkReadme(fs: SdkPublishFileSystem): SdkPublishCheck {
  if (!fs.exists("README.md")) {
    return {
      detail: "README.md is required in the published package.",
      name: "README",
      ok: false,
    };
  }

  const readme = fs.read("README.md");
  const missing = [
    "Privacy-safe",
    "showSponsorCard",
    "TIPCLI_DISABLED=1",
  ].filter((needle) => !readme.includes(needle));

  return {
    detail: missing.length
      ? `Missing README guidance: ${missing.join(", ")}`
      : undefined,
    name: "README",
    ok: missing.length === 0,
  };
}

function checkBuildOutputs(fs: SdkPublishFileSystem): SdkPublishCheck {
  const missing = requiredDistFiles.filter((path) => !fs.exists(path));

  return {
    detail: missing.length
      ? `Missing build output: ${missing.join(", ")}`
      : undefined,
    name: "build outputs",
    ok: missing.length === 0,
  };
}

export function auditSdkPublishReadiness(
  fs: SdkPublishFileSystem,
): SdkPublishAuditResult {
  const packageJson = parsePackageJson(fs);
  const checks = [
    checkPackageMetadata(packageJson),
    checkPublishedFiles(packageJson),
    checkConsumerSmokeScript(packageJson),
    checkReadme(fs),
    checkBuildOutputs(fs),
  ];

  return {
    checks,
    ok: checks.every((check) => check.ok),
  };
}
