import { describe, expect, it } from "vitest";

import {
  createSessionToken,
  verifyPasswordConstantTime,
  verifySessionToken,
} from "~/server/utils/admin-auth";
import { buildCsvDocument, escapeCsvCell } from "~/utils/csv";

describe("admin authentication helpers", () => {
  it("verifies passwords in constant time", () => {
    expect(verifyPasswordConstantTime("correct-horse-battery", "correct-horse-battery")).toBe(true);
    expect(verifyPasswordConstantTime("wrong-password", "correct-horse-battery")).toBe(false);
    expect(verifyPasswordConstantTime("", "correct-horse-battery")).toBe(false);
    expect(verifyPasswordConstantTime("anything", "")).toBe(false);
  });

  it("creates and validates HMAC-signed session tokens", () => {
    const secret = "test-session-secret-32-bytes-minimum";
    const now = 1_700_000_000_000;
    const token = createSessionToken(secret, 3600, now);

    expect(verifySessionToken(token, secret, now + 1000)).toBe(true);
    expect(verifySessionToken(token, "wrong-secret", now + 1000)).toBe(false);
    expect(verifySessionToken(token, secret, now + 3601 * 1000)).toBe(false);
    expect(verifySessionToken("invalid.token.parts", secret, now)).toBe(false);
    expect(verifySessionToken(undefined, secret, now)).toBe(false);
  });

  it("rejects tampered session payloads", () => {
    const secret = "test-session-secret-32-bytes-minimum";
    const now = 1_700_000_000_000;
    const token = createSessionToken(secret, 3600, now);
    const [, sig] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ iat: Math.floor(now / 1000), exp: Math.floor(now / 1000) + 999999 }),
      "utf8",
    ).toString("base64url");

    expect(verifySessionToken(`${tamperedPayload}.${sig}`, secret, now)).toBe(false);
  });
});

describe("CSV export sanitization", () => {
  it("neutralizes formula injection characters and quotes cells", () => {
    expect(escapeCsvCell("=CMD('calc')")).toBe("\"'=CMD('calc')\"");
    expect(escapeCsvCell("+1234")).toBe('"\'+1234"');
    expect(escapeCsvCell("-1234")).toBe('"\'-1234"');
    expect(escapeCsvCell("@SUM(A1)")).toBe('"\'@SUM(A1)"');
    expect(escapeCsvCell('He said "hi"')).toBe('"He said ""hi"""');
  });

  it("builds CRLF-separated CSV documents", () => {
    const csv = buildCsvDocument(["Department", "Notes"], [["Home Affairs", "Long queue"]]);
    expect(csv).toBe('"Department","Notes"\r\n"Home Affairs","Long queue"');
  });
});
