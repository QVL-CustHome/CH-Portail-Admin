import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { CanopI18nProvider, CanopThemeProvider } from "canopui";
import { defaultLocale, messages } from "../i18n/messages";
import { CurrentUserProvider } from "../context/CurrentUser";
import type { Me } from "../api/auth";
import AdminLayout from "./AdminLayout";

vi.mock("../api/auth", () => ({ logout: vi.fn().mockResolvedValue(undefined) }));

vi.mock("../lib/navigation", () => ({ navigateTo: vi.fn() }));

type ThemeMode = "light" | "dark";

const me: Me = {
  user_id: "1",
  name: "Admin",
  email: "admin@test.fr",
  roles: ["admin"],
  whitelist_only: false,
  created_at: "2026-01-01T00:00:00Z",
};

function stubDesktopViewport() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function renderWithProviders(ui: ReactElement, mode: ThemeMode) {
  return render(
    <CanopI18nProvider locale={defaultLocale} messages={messages}>
      <CanopThemeProvider defaultMode={mode} storageKey={null}>
        <MemoryRouter>
          <CurrentUserProvider value={me}>{ui}</CurrentUserProvider>
        </MemoryRouter>
      </CanopThemeProvider>
    </CanopI18nProvider>,
  );
}

function canopyVideo(container: HTMLElement) {
  const video = container.querySelector("video");
  expect(video).not.toBeNull();
  return video as HTMLVideoElement;
}

function sourcesOf(video: HTMLVideoElement) {
  return Array.from(video.querySelectorAll("source")).map((source) => source.getAttribute("src") ?? "");
}

beforeEach(() => {
  stubDesktopViewport();
});

describe("AdminLayout - fond canopée", () => {
  describe.each<[ThemeMode, ThemeMode]>([
    ["light", "dark"],
    ["dark", "light"],
  ])("en thème %s", (mode, otherMode) => {
    it(`affiche la vidéo avec le poster canopy-${mode}`, () => {
      const { container } = renderWithProviders(<AdminLayout />, mode);

      const poster = canopyVideo(container).getAttribute("poster") ?? "";

      expect(poster).toMatch(new RegExp(`^/canopui/video/canopy-${mode}[^/]*\\.(jpg|jpeg|webp|png)$`));
    });

    it(`déclare des sources /canopui/video/canopy-${mode}.* uniquement`, () => {
      const { container } = renderWithProviders(<AdminLayout />, mode);

      const sources = sourcesOf(canopyVideo(container));

      expect(sources.length).toBeGreaterThan(0);
      sources.forEach((src) => {
        expect(src).toMatch(new RegExp(`^/canopui/video/canopy-${mode}\\.[a-z0-9]+$`));
        expect(src).not.toContain(`canopy-${otherMode}`);
      });
    });
  });
});

describe("AdminLayout - liens légaux", () => {
  it("expose une navigation « Liens légaux » avec les liens CGU et Mentions légales", () => {
    renderWithProviders(<AdminLayout />, "light");

    const nav = screen.getByRole("navigation", { name: "Liens légaux" });

    expect(within(nav).getByRole("link", { name: "Conditions générales d'utilisation" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Mentions légales" })).toBeInTheDocument();
  });
});
