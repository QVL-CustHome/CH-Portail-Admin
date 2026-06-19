import { Navigate, Outlet } from "react-router-dom";
import { RouteGuard, useTranslation } from "@custhome/ui";
import { getMe, type Me } from "../api/auth";
import { ApiError } from "../api/client";
import { isPortalAdmin } from "../lib/roles";
import { navigateTo } from "../lib/navigation";
import { loginUrl } from "../lib/auth-redirect";

export default function RequireAdmin() {
  const { t } = useTranslation();
  return (
    <RouteGuard<Me>
      fetchUser={getMe}
      hasAccess={isPortalAdmin}
      isUnauthorizedError={(error) =>
        error instanceof ApiError && error.status === 401
      }
      onUnauthorized={() => navigateTo(loginUrl())}
      loadingLabel={t("admin.loading")}
      errorLabel={t("admin.guard.loadError")}
      renderForbidden={() => <Navigate to="/forbidden" replace />}
      renderAuthorized={() => <Outlet />}
    />
  );
}
