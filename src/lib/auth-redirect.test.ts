import { describe, expect, it } from "vitest";
import { loginUrl } from "./auth-redirect";

describe("loginUrl", () => {
  it("pointe vers le login du portail d'auth avec la page courante en redirect", () => {
    expect(loginUrl()).toBe(
      `http://localhost:3200/login?redirect=${encodeURIComponent(window.location.href)}`
    );
  });
});
