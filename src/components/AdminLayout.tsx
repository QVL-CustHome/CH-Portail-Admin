import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { PageScaffold, useTranslation, type ChNavbarItem } from "canopui";
import { useCurrentUser } from "../context/current-user";
import { logout } from "../api/auth";
import { navigateTo } from "../lib/navigation";
import { cguUrl, loginUrl } from "../lib/auth-redirect";
import LegalLinks from "./LegalLinks";

export default function AdminLayout() {
  const { t } = useTranslation();
  const me = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  const items: ChNavbarItem[] = [
    { label: t("admin.nav.dashboard"), href: "/dashboard", icon: "apps" },
    { label: t("admin.nav.users"), href: "/users", icon: "user" },
    { label: t("admin.nav.roles"), href: "/roles", icon: "shield" },
  ];

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigateTo(loginUrl());
    }
  }

  return (
    <PageScaffold
      navbarTitle="CustHome"
      title={t("admin.brand")}
      items={items}
      activeHref={location.pathname}
      onNavigate={(href) => navigate(href)}
      userName={me.name}
      onLogout={handleLogout}
      footer={<LegalLinks />}
      infoHref={cguUrl()}
      mobileFooterPlacement="settings"
    >
      <Outlet />
    </PageScaffold>
  );
}
