import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Button, Heading, Icon, LanguageSelector, ThemeToggle, useTranslation } from "@custhome/ui";
import { useCurrentUser } from "../context/current-user";
import { logout } from "../api/auth";
import { navigateTo } from "../lib/navigation";
import { loginUrl } from "../lib/auth-redirect";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "admin-nav__link admin-nav__link--active" : "admin-nav__link";

export default function AdminLayout() {
  const { t } = useTranslation();
  const me = useCurrentUser();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigateTo(loginUrl());
    }
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-iconbtn"
          aria-label={t("admin.nav.open")}
          onClick={() => setMenuOpen(true)}
        >
          <Icon name="menu" size={24} />
        </button>
        <span className="admin-topbar__brand">{t("admin.brand")}</span>
      </header>

      <aside className={menuOpen ? "admin-sidebar admin-sidebar--open" : "admin-sidebar"}>
        <div className="admin-sidebar__head">
          <div className="admin-sidebar__brand">
            <Heading level={1} size={4}>
              {t("admin.brand")}
            </Heading>
          </div>
          <button
            type="button"
            className="admin-iconbtn admin-close"
            aria-label={t("admin.nav.close")}
            onClick={() => setMenuOpen(false)}
          >
            <Icon name="close" size={24} />
          </button>
        </div>
        <nav className="admin-nav" aria-label={t("admin.nav.label")}>
          <NavLink to="/dashboard" className={navLinkClass}>
            {t("admin.nav.dashboard")}
          </NavLink>
          <NavLink to="/users" className={navLinkClass}>
            {t("admin.nav.users")}
          </NavLink>
          <NavLink to="/roles" className={navLinkClass}>
            {t("admin.nav.roles")}
          </NavLink>
        </nav>
        <div className="admin-sidebar__footer">
          <span className="admin-sidebar__user">{me.name}</span>
          <Button variant="secondary" size="small" onClick={handleLogout}>
            {t("admin.logout")}
          </Button>
        </div>
      </aside>

      {menuOpen && (
        <div className="admin-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      <main className="admin-main">
        <Outlet />
      </main>
      <div className="admin-lang">
        <LanguageSelector />
      </div>
      <div className="admin-theme">
        <ThemeToggle />
      </div>
    </div>
  );
}
