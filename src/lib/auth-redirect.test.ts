import { describe, expect, it, afterEach } from "vitest";
import { REDIRECT_INTENT_PARAM } from "canopui";
import { loginUrl } from "./auth-redirect";

afterEach(() => {
  document.cookie = "ch_redirect=; path=/; max-age=0";
});

describe("loginUrl", () => {
  it("retourne l'URL du portail d'auth avec le marqueur redirect=1", () => {
    expect(loginUrl()).toBe("http://localhost:3200/login?redirect=1");
  });

  it("expose le marqueur d'intention de redirection sur l'URL de login", () => {
    const url = new URL(loginUrl());
    expect(url.searchParams.get(REDIRECT_INTENT_PARAM)).toBe("1");
  });

  it("pose un cookie ch_redirect avec la page courante", () => {
    loginUrl();
    expect(document.cookie).toContain("ch_redirect=");
    const match = document.cookie.match(/ch_redirect=([^;]*)/);
    expect(decodeURIComponent(match![1])).toBe(window.location.href);
  });
});
