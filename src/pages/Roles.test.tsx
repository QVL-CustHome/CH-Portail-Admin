import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChI18nProvider, ChThemeProvider } from "canopui";
import { defaultLocale, messages } from "../i18n/messages";
import Roles from "./Roles";
import * as rolesApi from "../api/roles";

vi.mock("../api/roles", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/roles")>();
  return { ...actual, listRoles: vi.fn(), createRole: vi.fn(), deleteRole: vi.fn() };
});

const subRole: rolesApi.Role = {
  id: "r1",
  name: "editor",
  portal: "admin",
  kind: "sub",
  created_at: "2026-01-01T00:00:00Z",
};

function renderRoles() {
  return render(
    <ChI18nProvider locale={defaultLocale} messages={messages}>
      <ChThemeProvider>
        <Roles />
      </ChThemeProvider>
    </ChI18nProvider>
  );
}

beforeEach(() => {
  vi.mocked(rolesApi.listRoles).mockResolvedValue([subRole]);
  vi.mocked(rolesApi.createRole).mockResolvedValue(subRole);
  vi.mocked(rolesApi.deleteRole).mockResolvedValue(undefined);
});

describe("Page Rôles", () => {
  it("affiche une card par portail et les sous-rôles", async () => {
    renderRoles();
    expect(await screen.findByText("editor")).toBeInTheDocument();
    expect(screen.getByText("Administration")).toBeInTheDocument();
    expect(screen.getByText("Drive")).toBeInTheDocument();
    expect(screen.getByText("Accueil")).toBeInTheDocument();
  });

  it("crée un sous-rôle dans un portail", async () => {
    const user = userEvent.setup();
    renderRoles();
    await screen.findByText("editor");

    await user.click(screen.getAllByRole("button", { name: "Ajouter un sous-rôle" })[0]);
    await user.type(screen.getByLabelText("Nom du rôle"), "viewer");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(rolesApi.createRole).toHaveBeenCalledWith({ name: "viewer", portal: "admin" });
  });

  it("supprime un sous-rôle après confirmation", async () => {
    const user = userEvent.setup();
    renderRoles();
    await screen.findByText("editor");

    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(await screen.findByText("Supprimer ce rôle ?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(rolesApi.deleteRole).toHaveBeenCalledWith("r1");
  });
});
