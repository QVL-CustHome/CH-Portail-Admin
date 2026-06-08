import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Feedback, Spinner, useTranslation } from "@custhome/ui";
import { getMe, type Me } from "../api/auth";
import { ApiError } from "../api/client";
import { isPortalAdmin } from "../lib/roles";
import { navigateTo } from "../lib/navigation";
import { loginUrl } from "../lib/auth-redirect";
import { CurrentUserProvider } from "../context/CurrentUser";

type GuardState =
  | { status: "loading" }
  | { status: "ok"; me: Me }
  | { status: "forbidden" }
  | { status: "error" };

export default function RequireAdmin() {
  const { t } = useTranslation();
  const [state, setState] = useState<GuardState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    getMe()
      .then((me) => {
        if (!active) return;
        setState(isPortalAdmin(me) ? { status: "ok", me } : { status: "forbidden" });
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          navigateTo(loginUrl());
          return;
        }
        setState({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    return <Spinner fullPage label={t("admin.loading")} />;
  }
  if (state.status === "error") {
    return <Feedback severity="error">{t("admin.guard.loadError")}</Feedback>;
  }
  if (state.status === "forbidden") {
    return <Navigate to="/forbidden" replace />;
  }
  return (
    <CurrentUserProvider value={state.me}>
      <Outlet />
    </CurrentUserProvider>
  );
}
