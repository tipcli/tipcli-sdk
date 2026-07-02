import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

type SessionCache = {
  sessionId?: string;
};

function cacheDirectory(): string {
  if (process.env.TIPCLI_CACHE_DIR) {
    return process.env.TIPCLI_CACHE_DIR;
  }

  if (process.env.DEVBILLBOARD_CACHE_DIR) {
    return process.env.DEVBILLBOARD_CACHE_DIR;
  }

  if (process.env.XDG_CACHE_HOME) {
    return join(process.env.XDG_CACHE_HOME, "tipcli");
  }

  return join(homedir(), ".cache", "tipcli");
}

function cachePath(): string {
  return join(cacheDirectory(), "session.json");
}

export async function readSessionCache(): Promise<SessionCache> {
  try {
    const raw = await readFile(cachePath(), "utf8");
    const parsed = JSON.parse(raw) as SessionCache;

    return typeof parsed.sessionId === "string" ? parsed : {};
  } catch {
    return {};
  }
}

export async function writeSessionCache(cache: SessionCache): Promise<void> {
  try {
    await mkdir(cacheDirectory(), { recursive: true });
    await writeFile(cachePath(), JSON.stringify(cache), "utf8");
  } catch {
    // Cache failure must never affect the host CLI.
  }
}
