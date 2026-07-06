import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ChI18nProvider, ChThemeProvider } from "@custhome/ui";
import { defaultLocale, messages } from "../i18n/messages";
import { CurrentUserProvider } from "../context/CurrentUser";
import type { Me } from "../api/auth";
import AdminLayout from "./AdminLayout";

vi.mock("../api/auth", () => ({ logout: vi.fn().mockResolvedValue(undefined) }));

vi.mock("../lib/navigation", () => ({ navigateTo: vi.fn() }));

const CGU_LABEL = "Conditions générales d'utilisation";
const NOTICE_LABEL = "Mentions légales";

const me: Me = {
  user_id: "1",
  name: "Admin",
  email: "admin@test.fr",
  roles: ["admin"],
  whitelist_only: false,
  created_at: "2026-01-01T00:00:00Z",
};

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
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

function renderLayout() {
  return render(
    <ChI18nProvider locale={defaultLocale} messages={messages}>
      <ChThemeProvider>
        <MemoryRouter>
          <CurrentUserProvider value={me}>
            <AdminLayout />
          </CurrentUserProvider>
        </MemoryRouter>
      </ChThemeProvider>
    </ChI18nProvider>,
  );
}

async function openSettingsMenu() {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText("Ouvrir le menu"));
  return screen.findByRole("presentation");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Admin - footer legal (SCRUM-299)", () => {
  describe("AC1 desktop (>48rem)", () => {
    beforeEach(() => {
      mockMatchMedia(false);
    });

    it("affiche un footer avec les liens CGU et mentions legales", () => {
      renderLayout();

      expect(screen.getByRole("link", { name: CGU_LABEL })).toBeVisible();
      expect(screen.getByRole("link", { name: NOTICE_LABEL })).toBeVisible();
    });
  });

  describe("AC2 mobile (<=48rem)", () => {
    beforeEach(() => {
      mockMatchMedia(true);
    });

    it("ne rend aucun lien legal en dehors du menu reglages", () => {
      renderLayout();

      expect(screen.queryByRole("link", { name: CGU_LABEL })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: NOTICE_LABEL })).not.toBeInTheDocument();
    });

    it("expose un unique bouton info-lien legal dans le menu reglages, sans liens directs", async () => {
      renderLayout();

      const menu = await openSettingsMenu();

      expect(within(menu).queryByRole("link", { name: CGU_LABEL })).not.toBeInTheDocument();
      expect(within(menu).queryByRole("link", { name: NOTICE_LABEL })).not.toBeInTheDocument();

      const info = within(menu).getByRole("link", { name: /informations l[ée]gales/i });
      const href = info.getAttribute("href") ?? "";
      expect(href).toMatch(/^https?:\/\//);
      expect(href.endsWith("/cgu")).toBe(true);
    });
  });

  describe("AC3 cibles des liens", () => {
    beforeEach(() => {
      mockMatchMedia(false);
    });

    it("pointe vers la page CGU du portail authent avec ancre mentions legales", () => {
      renderLayout();

      const cgu = screen.getByRole("link", { name: CGU_LABEL });
      const notice = screen.getByRole("link", { name: NOTICE_LABEL });
      const cguHref = cgu.getAttribute("href") ?? "";
      const noticeHref = notice.getAttribute("href") ?? "";

      expect(cguHref).toMatch(/^https?:\/\//);
      expect(cguHref.endsWith("/cgu")).toBe(true);
      expect(noticeHref).toBe(`${cguHref}#mentions-legales`);
    });

    it("construit les URLs depuis VITE_AUTH_PORTAL_URL", async () => {
      vi.stubEnv("VITE_AUTH_PORTAL_URL", "https://auth.example.test");
      vi.resetModules();
      const { cguUrl } = await import("../lib/auth-redirect");

      expect(cguUrl().startsWith("https://auth.example.test")).toBe(true);
      expect(cguUrl().endsWith("/cgu")).toBe(true);
      expect(cguUrl("mentions-legales")).toBe(`${cguUrl()}#mentions-legales`);
    });
  });
});
