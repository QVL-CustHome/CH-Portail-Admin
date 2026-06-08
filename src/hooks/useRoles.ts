import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@custhome/ui";
import { ApiError } from "../api/client";
import { createRole, deleteRole, listRoles, type CreateRoleInput, type Role } from "../api/roles";

export interface RolesFeedback {
  severity: "success" | "error";
  message: string;
}

export function useRoles() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<RolesFeedback | null>(null);

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

  const run = useCallback(
    async (action: () => Promise<unknown>, successKey: string): Promise<boolean> => {
      try {
        await action();
        setFeedback({ severity: "success", message: t(successKey) });
        await reload();
        return true;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t("admin.roles.actionError");
        setFeedback({ severity: "error", message });
        return false;
      }
    },
    [reload, t]
  );

  const create = useCallback(
    (input: CreateRoleInput) => run(() => createRole(input), "admin.roles.created"),
    [run]
  );

  const remove = useCallback(
    (id: string) => run(() => deleteRole(id), "admin.roles.deleted"),
    [run]
  );

  return { roles, loading, loadError, feedback, setFeedback, reload, create, remove };
}
