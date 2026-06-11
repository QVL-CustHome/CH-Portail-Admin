import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChI18nProvider, ChThemeProvider } from "@custhome/ui";
import { defaultLocale, messages } from "../i18n/messages";
import Roles from "./Roles";
import * as rolesApi from "../api/roles";

vi.mock("../api/roles");

const role: rolesApi.Role = {
  id: "r1",
  name: "admin",
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
  vi.mocked(rolesApi.listRoles).mockResolvedValue([role]);
  vi.mocked(rolesApi.createRole).mockResolvedValue(role);
  vi.mocked(rolesApi.deleteRole).mockResolvedValue(undefined);
});

describe("Page Rôles", () => {
  it("liste les rôles du catalogue", async () => {
    renderRoles();
    expect(await screen.findByText("admin")).toBeInTheDocument();
  });

  it("crée un rôle (nom seul)", async () => {
    const user = userEvent.setup();
    renderRoles();
    await screen.findByText("admin");

    await user.click(screen.getByRole("button", { name: "Créer le rôle" }));
    await user.type(screen.getByRole("textbox"), "editor");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(rolesApi.createRole).toHaveBeenCalledWith({ name: "editor" });
  });

  it("supprime un rôle après confirmation", async () => {
    const user = userEvent.setup();
    renderRoles();
    await screen.findByText("admin");

    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(await screen.findByText("Supprimer ce rôle ?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(rolesApi.deleteRole).toHaveBeenCalledWith("r1");
  });
});
