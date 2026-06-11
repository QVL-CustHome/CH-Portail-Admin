import { describe, expect, it, afterEach } from "vitest";
import { loginUrl } from "./auth-redirect";

afterEach(() => {
  document.cookie = "ch_redirect=; path=/; max-age=0";
});

describe("loginUrl", () => {
  it("retourne l'URL du portail d'auth sans query param", () => {
    expect(loginUrl()).toBe("http://localhost:3200/login");
  });

  it("pose un cookie ch_redirect avec la page courante", () => {
    loginUrl();
    expect(document.cookie).toContain("ch_redirect=");
    const match = document.cookie.match(/ch_redirect=([^;]*)/);
    expect(decodeURIComponent(match![1])).toBe(window.location.href);
  });
});
