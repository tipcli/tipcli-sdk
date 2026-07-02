import { randomBytes } from "node:crypto";
import { readSessionCache, writeSessionCache } from "./cache";

export function createAnonymousSessionId(): string {
  return `session_${randomBytes(16).toString("base64url")}`;
}

export async function getAnonymousSessionId(): Promise<string> {
  const cache = await readSessionCache();

  if (cache.sessionId) {
    return cache.sessionId;
  }

  const sessionId = createAnonymousSessionId();
  await writeSessionCache({ sessionId });

  return sessionId;
}
