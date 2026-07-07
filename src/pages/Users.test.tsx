import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChI18nProvider, ChThemeProvider } from "canopui";
import { defaultLocale, messages } from "../i18n/messages";
import Users from "./Users";
import * as adminApi from "../api/admin";
import * as rolesApi from "../api/roles";

vi.mock("../api/admin");
vi.mock("../api/roles", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/roles")>();
  return { ...actual, listRoles: vi.fn(), createRole: vi.fn(), deleteRole: vi.fn() };
});

const pendingUser: adminApi.AdminUser = {
  user_id: "1",
  name: "Attente",
  email: "attente@test.fr",
  roles: [],
  status: "pending_validation",
  whitelist_only: false,
  allowed_ips: [],
  created_at: "2026-01-01T00:00:00Z",
};

const subRole: rolesApi.Role = {
  id: "r1",
  name: "viewer",
  portal: "admin",
  kind: "sub",
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
  it("affiche les utilisateurs chargés", async () => {
    renderUsers();
    expect(await screen.findByText("attente@test.fr")).toBeInTheDocument();
  });

  it("affiche le statut dans le panneau d'édition", async () => {
    const user = userEvent.setup();
    renderUsers();
    await screen.findByText("attente@test.fr");
    await user.click(screen.getByRole("button", { name: "Éditer" }));
    await screen.findByText("Modifier l'utilisateur");
    const panel = document.querySelector(".MuiDrawer-paper") as HTMLElement;
    expect(within(panel).getByText("En attente")).toBeInTheDocument();
  });

  it("active un compte en attente via le toggle", async () => {
    const user = userEvent.setup();
    renderUsers();
    await screen.findByText("attente@test.fr");

    await user.click(screen.getByRole("switch", { name: "Activer" }));

    expect(await screen.findByText("Attente a été activé")).toBeInTheDocument();
    expect(adminApi.updateUserStatus).toHaveBeenCalledWith("1", "active");
  });

  it("supprime un compte après confirmation depuis le panneau d'édition", async () => {
    const user = userEvent.setup();
    renderUsers();
    await screen.findByText("attente@test.fr");

    await user.click(screen.getByRole("button", { name: "Éditer" }));
    await user.click(await screen.findByRole("button", { name: "Supprimer" }));
    expect(await screen.findByText("Supprimer Attente ?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(adminApi.deleteUser).toHaveBeenCalledWith("1");
  });

  it("attribue l'accès à un portail depuis l'édition", async () => {
    const user = userEvent.setup();
    renderUsers();
    await screen.findByText("attente@test.fr");

    await user.click(screen.getByRole("button", { name: "Éditer" }));
    const accessToggles = await screen.findAllByRole("switch", { name: "Accès au portail" });
    await user.click(accessToggles[0]);
    await user.click(screen.getByLabelText("Enregistrer"));

    expect(adminApi.updateUserRoles).toHaveBeenCalledWith("1", ["admin"]);
  });

  it("attribue un sous-rôle depuis l'édition", async () => {
    vi.mocked(rolesApi.listRoles).mockResolvedValue([subRole]);
    const user = userEvent.setup();
    renderUsers();
    await screen.findByText("attente@test.fr");

    await user.click(screen.getByRole("button", { name: "Éditer" }));
    await user.click(await screen.findByRole("checkbox", { name: "viewer" }));
    await user.click(screen.getByLabelText("Enregistrer"));

    expect(adminApi.updateUserRoles).toHaveBeenCalledWith("1", ["viewer"]);
  });
});
