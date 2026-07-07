import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChI18nProvider, ChThemeProvider } from "canopui";
import { defaultLocale, messages } from "../i18n/messages";
import { CurrentUserProvider } from "../context/CurrentUser";
import type { Me } from "../api/auth";
import Dashboard from "./Dashboard";
import * as adminApi from "../api/admin";
import type { AdminUser } from "../api/admin";

vi.mock("../api/admin");

const me: Me = {
  user_id: "1",
  name: "Admin",
  email: "admin@test.fr",
  roles: ["admin"],
  whitelist_only: false,
  created_at: "2026-01-01T00:00:00Z",
};

function user(overrides: Partial<AdminUser>): AdminUser {
  return {
    user_id: "u",
    name: "User",
    email: "user@test.fr",
    roles: [],
    status: "active",
    whitelist_only: false,
    allowed_ips: [],
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function listResponse(users: AdminUser[]) {
  return { users, page: 1, limit: 100, total: users.length };
}

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

describe("Dashboard", () => {
  beforeEach(() => {
    vi.mocked(adminApi.listUsers).mockReset();
    vi.mocked(adminApi.getRegistrationSetting).mockResolvedValue({ enabled: true });
    vi.mocked(adminApi.getTraffic).mockResolvedValue({
      period: "week",
      registrations: 0,
      portals: [],
    });
  });

  it("liste uniquement les comptes en attente dans la carte dédiée", async () => {
    vi.mocked(adminApi.listUsers).mockResolvedValue(
      listResponse([
        user({ user_id: "p1", name: "Pierre Pending", status: "pending_validation" }),
        user({ user_id: "a1", name: "Alice Active", status: "active" }),
      ])
    );
    renderDashboard();

    expect(await screen.findByText("Pierre Pending")).toBeInTheDocument();
    expect(screen.queryByText("Alice Active")).not.toBeInTheDocument();
    expect(screen.getByText("Comptes en attente")).toBeInTheDocument();
    expect(screen.getByText("Trafic")).toBeInTheDocument();
  });

  it("affiche un message vide quand aucun compte n'est en attente", async () => {
    vi.mocked(adminApi.listUsers).mockResolvedValue(
      listResponse([user({ user_id: "a1", name: "Alice Active", status: "active" })])
    );
    renderDashboard();

    expect(await screen.findByText("Aucun compte en attente.")).toBeInTheDocument();
  });
});
