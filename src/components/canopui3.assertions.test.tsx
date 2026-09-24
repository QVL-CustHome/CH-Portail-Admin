import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CanopApiError, CanopI18nProvider, CanopThemeProvider } from "canopui";
import { defaultLocale, messages } from "../i18n/messages";
import type { AdminUser, UserDevice } from "../api/admin";
import { ApiError } from "../api/client";
import { getMe } from "../api/auth";
import { navigateTo } from "../lib/navigation";
import { loginUrl } from "../lib/auth-redirect";
import PendingUsersCard from "./PendingUsersCard";
import UserDevicesList from "./UserDevicesList";
import RequireAdmin from "./RequireAdmin";
import Users from "../pages/Users";
import * as adminApi from "../api/admin";
import * as rolesApi from "../api/roles";

vi.mock("../api/auth", () => ({ getMe: vi.fn(), logout: vi.fn() }));
vi.mock("../lib/navigation", () => ({ navigateTo: vi.fn() }));
vi.mock("../api/admin");
vi.mock("../api/roles", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/roles")>();
  return { ...actual, listRoles: vi.fn(), createRole: vi.fn(), deleteRole: vi.fn() };
});

const pendingUser: AdminUser = {
  user_id: "1",
  name: "Attente",
  email: "attente@test.fr",
  roles: [],
  status: "pending_validation",
  whitelist_only: false,
  devices: [],
  created_at: "2026-01-01T00:00:00Z",
};

const device: UserDevice = {
  id: "d1",
  label: "Firefox sur Linux",
  first_seen: "2026-02-01T10:00:00Z",
  last_seen: "2026-08-01T10:00:00Z",
  last_ip: "192.0.2.0/24",
};

function renderWithProviders(ui: ReactElement) {
  return render(
    <CanopI18nProvider locale={defaultLocale} messages={messages}>
      <CanopThemeProvider storageKey={null}>{ui}</CanopThemeProvider>
    </CanopI18nProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PendingUsersCard", () => {
  it("propose « Approuver <nom> » et « Supprimer <nom> » pour chaque compte en attente", async () => {
    const onApprove = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <PendingUsersCard users={[pendingUser]} loading={false} onApprove={onApprove} onDelete={onDelete} />,
    );

    await user.click(screen.getByRole("button", { name: "Approuver Attente" }));
    expect(onApprove).toHaveBeenCalledWith(pendingUser);

    expect(screen.getByRole("button", { name: "Supprimer Attente" })).toBeInTheDocument();
  });
});

describe("UserDevicesList", () => {
  it("affiche « Révoquer cet appareil <label> » quand canRevoke est vrai", async () => {
    const onRevoke = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<UserDevicesList devices={[device]} canRevoke onRevoke={onRevoke} />);

    await user.click(screen.getByRole("button", { name: "Révoquer cet appareil Firefox sur Linux" }));

    expect(onRevoke).toHaveBeenCalledWith("d1");
  });

  it("n'affiche aucun bouton de révocation quand canRevoke est faux", () => {
    renderWithProviders(<UserDevicesList devices={[device]} canRevoke={false} onRevoke={vi.fn()} />);

    expect(screen.getByText("Firefox sur Linux")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Révoquer cet appareil/ })).not.toBeInTheDocument();
  });
});

describe("RequireAdmin", () => {
  it("expose un ApiError compatible CanopApiError", () => {
    expect(new ApiError(401, "x")).toBeInstanceOf(CanopApiError);
  });

  it("redirige vers le login quand getMe renvoie un ApiError 401", async () => {
    vi.mocked(getMe).mockRejectedValue(new ApiError(401, "x"));

    renderWithProviders(
      <MemoryRouter>
        <Routes>
          <Route element={<RequireAdmin />}>
            <Route path="/" element={<p>Contenu protégé</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(navigateTo).toHaveBeenCalledWith(loginUrl()));
    expect(screen.queryByText("Contenu protégé")).not.toBeInTheDocument();
  });
});

describe("Users - panneau et légende", () => {
  beforeEach(() => {
    vi.mocked(adminApi.listUsers).mockResolvedValue({ users: [pendingUser], page: 1, limit: 100, total: 1 });
    vi.mocked(rolesApi.listRoles).mockResolvedValue([]);
  });

  it("affiche « En attente » et « Désactivé » dans la légende", async () => {
    renderWithProviders(<Users />);

    await screen.findByText("attente@test.fr");

    const legend = screen.getByRole("list");

    expect(within(legend).getByText("En attente")).toBeInTheDocument();
    expect(within(legend).getByText("Désactivé")).toBeInTheDocument();
  });

  it("propose « Éditer » sur la ligne puis « Enregistrer » et « Supprimer » dans le panneau", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Users />);
    await screen.findByText("attente@test.fr");

    await user.click(screen.getByRole("button", { name: "Éditer" }));
    const panel = await screen.findByRole("dialog");

    expect(within(panel).getByRole("button", { name: "Enregistrer" })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Supprimer" })).toBeInTheDocument();
  });
});
