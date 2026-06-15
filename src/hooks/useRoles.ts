import { useCallback, useEffect, useState } from "react";
import { apiErrorMessage, useTranslation, type ChToastSeverity } from "@custhome/ui";
import { ApiError } from "../api/client";
import { createRole, deleteRole, listRoles, type CreateRoleInput, type Role } from "../api/roles";

export interface RolesToast {
  severity: ChToastSeverity;
  message: string;
}

export function useRoles() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<RolesToast | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRoles(await listRoles());
      setLoadError(null);
    } catch {
      setLoadError(t("admin.roles.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toastError = useCallback(
    (err: unknown) => {
      const fallback = err instanceof ApiError ? err.message : t("admin.roles.actionError");
      const code = err instanceof ApiError ? err.code : undefined;
      setToast({ severity: "error", message: apiErrorMessage(t, code, fallback) });
    },
    [t]
  );

  const run = useCallback(
    async (action: () => Promise<unknown>, successKey: string): Promise<boolean> => {
      try {
        await action();
        setToast({ severity: "success", message: t(successKey) });
        await reload();
        return true;
      } catch (err) {
        toastError(err);
        return false;
      }
    },
    [reload, t, toastError]
  );

  const create = useCallback(
    (input: CreateRoleInput) => run(() => createRole(input), "admin.roles.created"),
    [run]
  );

  const remove = useCallback(
    (id: string) => run(() => deleteRole(id), "admin.roles.deleted"),
    [run]
  );

  return { roles, loading, loadError, toast, setToast, reload, create, remove };
}
