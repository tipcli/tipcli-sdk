import { describe, expect, it } from "vitest";
import { createAnonymousSessionId } from "../src/session";

describe("createAnonymousSessionId", () => {
  it("creates a non-fingerprinting random session id", () => {
    const sessionId = createAnonymousSessionId();

    expect(sessionId).toMatch(/^session_[A-Za-z0-9_-]{22}$/);
  });
});
