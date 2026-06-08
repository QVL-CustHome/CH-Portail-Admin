import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChI18nProvider, ChThemeProvider } from "@custhome/ui";
import { defaultLocale, messages } from "../i18n/messages";
import { CurrentUserProvider } from "../context/CurrentUser";
import type { Me } from "../api/auth";
import Dashboard from "./Dashboard";
import * as adminApi from "../api/admin";

vi.mock("../api/admin");

const me: Me = {
  user_id: "1",
  name: "Admin",
  email: "admin@test.fr",
  roles: ["admin"],
  whitelist_only: false,
  created_at: "2026-01-01T00:00:00Z",
};

function renderDashboard() {
  return render(
    <ChI18nProvider locale={defaultLocale} messages={messages}>
      <ChThemeProvider>
        <MemoryRouter>
          <CurrentUserProvider value={me}>
            <Dashboard />
          </CurrentUserProvider>
        </MemoryRouter>
      </ChThemeProvider>
    </ChI18nProvider>
  );
}

function pendingResponse(total: number) {
  return { users: [], page: 1, limit: 20, total };
}

describe("Dashboard", () => {
  beforeEach(() => {
    vi.mocked(adminApi.listPendingUsers).mockReset();
  });

  it("affiche l'alerte et le CTA quand des comptes sont en attente", async () => {
    vi.mocked(adminApi.listPendingUsers).mockResolvedValue(pendingResponse(3));
    renderDashboard();

    expect(await screen.findByText(/3 compte/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voir les utilisateurs" })).toBeInTheDocument();
  });

  it("affiche un message rassurant quand aucun compte n'est en attente", async () => {
    vi.mocked(adminApi.listPendingUsers).mockResolvedValue(pendingResponse(0));
    renderDashboard();

    expect(
      await screen.findByText("Aucun compte en attente de validation.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Voir les utilisateurs" })).not.toBeInTheDocument();
  });
});
