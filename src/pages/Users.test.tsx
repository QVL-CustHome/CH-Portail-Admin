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
  devices: [],
  created_at: "2026-01-01T00:00:00Z",
};

const appareil: adminApi.UserDevice = {
  id: "d1",
  label: "Chrome sur Windows",
  first_seen: "2026-02-01T10:00:00Z",
  last_seen: "2026-08-01T10:00:00Z",
  last_ip: "2a01:e0a:edb:c3f0::/64",
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
  vi.mocked(adminApi.updateUserWhitelist).mockResolvedValue({
    ...pendingUser,
    whitelist_only: true,
  });
  vi.mocked(adminApi.revokeUserDevice).mockResolvedValue(pendingUser);
  vi.mocked(rolesApi.listRoles).mockResolvedValue([]);
});

async function ouvrirEdition(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByText("attente@test.fr");
  await user.click(screen.getByRole("button", { name: "Éditer" }));
  await screen.findByText("Modifier l'utilisateur");
}

describe("Appareils reconnus", () => {
  it("liste les appareils avec leur dernière connexion", async () => {
    vi.mocked(adminApi.listUsers).mockResolvedValue({
      users: [{ ...pendingUser, devices: [appareil] }],
      page: 1,
      limit: 100,
      total: 1,
    });
    const user = userEvent.setup();
    renderUsers();
    await ouvrirEdition(user);

    const panel = screen.getByRole("dialog");
    expect(within(panel).getByText("Chrome sur Windows")).toBeInTheDocument();
    expect(within(panel).getByText(/2a01:e0a:edb:c3f0/)).toBeInTheDocument();
  });

  it("révoque un appareil", async () => {
    vi.mocked(adminApi.listUsers).mockResolvedValue({
      users: [{ ...pendingUser, devices: [appareil] }],
      page: 1,
      limit: 100,
      total: 1,
    });
    const user = userEvent.setup();
    renderUsers();
    await ouvrirEdition(user);

    await user.click(
      await screen.findByRole("button", { name: "Révoquer cet appareil Chrome sur Windows" })
    );
    expect(adminApi.revokeUserDevice).toHaveBeenCalledWith("1", "d1");
  });

  // Sans appareil reconnu, activer la restriction enfermerait le compte
  // dehors : le geste ne doit pas être proposé.
  it("interdit la restriction tant qu'aucun appareil n'est reconnu", async () => {
    const user = userEvent.setup();
    renderUsers();
    await ouvrirEdition(user);

    const restriction = screen.getByRole("switch", {
      name: "Restreindre aux appareils autorisés",
    });
    expect(restriction).toBeDisabled();
    expect(
      screen.getByText(/Impossible tant qu'aucun appareil n'est reconnu/)
    ).toBeInTheDocument();
  });

  it("permet la restriction dès qu'un appareil est reconnu", async () => {
    vi.mocked(adminApi.listUsers).mockResolvedValue({
      users: [{ ...pendingUser, devices: [appareil] }],
      page: 1,
      limit: 100,
      total: 1,
    });
    const user = userEvent.setup();
    renderUsers();
    await ouvrirEdition(user);

    await user.click(
      screen.getByRole("switch", { name: "Restreindre aux appareils autorisés" })
    );
    expect(adminApi.updateUserWhitelist).toHaveBeenCalledWith("1", true);
  });
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
    const panel = screen.getByRole("dialog");
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
