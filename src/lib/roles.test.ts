import { describe, expect, it } from "vitest";
import { isPortalAdmin } from "./roles";
import type { Me } from "../api/auth";

function makeMe(overrides: Partial<Me> = {}): Me {
  return {
    user_id: "1",
    name: "Test",
    email: "a@b.c",
    roles: [],
    whitelist_only: false,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("isPortalAdmin", () => {
  it("accepte le role admin sur portail_admin", () => {
    expect(isPortalAdmin(makeMe({ roles: ["admin"] }))).toBe(true);
  });

  it("refuse un utilisateur sans role admin", () => {
    expect(isPortalAdmin(makeMe({ roles: ["editor"] }))).toBe(false);
  });

  it("refuse un role non-admin sur portail_admin", () => {
    expect(isPortalAdmin(makeMe({ roles: ["user"] }))).toBe(false);
  });
});
