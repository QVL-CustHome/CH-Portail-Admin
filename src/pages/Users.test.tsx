import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChI18nProvider, ChThemeProvider } from "@custhome/ui";
import { defaultLocale, messages } from "../i18n/messages";
import Users from "./Users";
import * as adminApi from "../api/admin";
import * as rolesApi from "../api/roles";

vi.mock("../api/admin");
vi.mock("../api/roles");

const pendingUser: adminApi.AdminUser = {
  user_id: "1",
  name: "Attente",
  email: "attente@test.fr",
  roles: [],
  status: "pending_validation",
  whitelist_only: false,
  created_at: "2026-01-01T00:00:00Z",
};

const adminRole: rolesApi.Role = {
  id: "r1",
  name: "admin",
  created_at: "2026-01-01T00:00:00Z",
};

function renderUsers() {
  return render(
    <ChI18nProvider locale={defaultLocale} messages={messages}>
      <ChThemeProvider>
        <Users />
      </ChThemeProvider>
    </ChI18nProvider>
  );
}

beforeEach(() => {
  vi.mocked(adminApi.listUsers).mockResolvedValue({
    users: [pendingUser],
    page: 1,
    limit: 100,
    total: 1,
  });
  vi.mocked(adminApi.updateUserStatus).mockResolvedValue({ ...pendingUser, status: "active" });
  vi.mocked(adminApi.updateUserRoles).mockResolvedValue({
    ...pendingUser,
    roles: ["admin"],
  });
  vi.mocked(adminApi.deleteUser).mockResolvedValue(undefined);
  vi.mocked(rolesApi.listRoles).mockResolvedValue([]);
});

describe("Page Utilisateurs", () => {
  it("affiche les utilisateurs chargés avec leur statut", async () => {
    renderUsers();
    expect(await screen.findByText("attente@test.fr")).toBeInTheDocument();
    expect(screen.getByText("En attente")).toBeInTheDocument();
  });

  it("valide un compte en attente", async () => {
    const user = userEvent.setup();
    renderUsers();
    await screen.findByText("attente@test.fr");

    await user.click(screen.getByRole("button", { name: "Valider" }));

    expect(await screen.findByText("Statut mis à jour.")).toBeInTheDocument();
    expect(adminApi.updateUserStatus).toHaveBeenCalledWith("1", "active");
  });

  it("supprime un compte après confirmation", async () => {
    const user = userEvent.setup();
    renderUsers();
    await screen.findByText("attente@test.fr");

    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(await screen.findByText("Supprimer ce compte ?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(adminApi.deleteUser).toHaveBeenCalledWith("1");
  });

  it("attribue un rôle depuis l'édition de l'utilisateur", async () => {
    vi.mocked(rolesApi.listRoles).mockResolvedValue([adminRole]);
    const user = userEvent.setup();
    renderUsers();
    await screen.findByText("attente@test.fr");

    await user.click(screen.getByRole("button", { name: "Éditer" }));
    await user.click(await screen.findByText("Ajouter un rôle…"));
    await user.click(await screen.findByRole("option", { name: "admin" }));
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(adminApi.updateUserRoles).toHaveBeenCalledWith("1", ["admin"]);
  });
});
