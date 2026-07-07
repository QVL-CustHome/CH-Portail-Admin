import { useCallback, useEffect, useState } from "react";
import { apiErrorMessage, useTranslation, type ChToastSeverity } from "canopui";
import { ApiError } from "../api/client";
import {
  deleteUser,
  listUsers,
  updateUser,
  updateUserPassword,
  updateUserRoles,
  updateUserStatus,
  updateUserWhitelist,
  type AccountStatus,
  type AdminUser,
} from "../api/admin";

export interface UsersToast {
  severity: ChToastSeverity;
  message: string;
}

export function useUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<UsersToast | null>(null);

  const toastError = useCallback(
    (err: unknown) => {
      const fallback = err instanceof ApiError ? err.message : t("admin.users.actionError");
      const code = err instanceof ApiError ? err.code : undefined;
      setToast({ severity: "error", message: apiErrorMessage(t, code, fallback) });
    },
    [t]
  );

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUsers({ limit: 100 });
      setUsers(res.users);
      setLoadError(null);
    } catch {
      setLoadError(t("admin.users.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const run = useCallback(
    async (
      action: () => Promise<unknown>,
      successKey: string,
      options?: { silentSuccess?: boolean }
    ): Promise<boolean> => {
      try {
        await action();
        if (!options?.silentSuccess) {
          setToast({ severity: "success", message: t(successKey) });
        }
        await reload();
        return true;
      } catch (err) {
        toastError(err);
        return false;
      }
    },
    [reload, t, toastError]
  );

  const setStatus = useCallback(
    async (user: AdminUser, status: AccountStatus): Promise<boolean> => {
      try {
        await updateUserStatus(user.user_id, status);
        await reload();
        const key = status === "active" ? "admin.users.activated" : "admin.users.disabled";
        setToast({ severity: "success", message: `${user.name} ${t(key)}` });
        return true;
      } catch (err) {
        toastError(err);
        return false;
      }
    },
    [reload, t, toastError]
  );

  const editUser = useCallback(
    (id: string, name: string, email: string) =>
      run(() => updateUser(id, name, email), "admin.users.profileUpdated", { silentSuccess: true }),
    [run]
  );

  const assignRoles = useCallback(
    (id: string, roles: string[]) =>
      run(() => updateUserRoles(id, roles), "admin.users.rolesUpdated", { silentSuccess: true }),
    [run]
  );

  const changePassword = useCallback(
    (id: string, password: string) =>
      run(() => updateUserPassword(id, password), "admin.users.passwordUpdated", { silentSuccess: true }),
    [run]
  );

  const remove = useCallback(
    (id: string) => run(() => deleteUser(id), "admin.users.deleted"),
    [run]
  );

  const updateWhitelist = useCallback(
    async (id: string, whitelistOnly: boolean, allowedIps: string[]): Promise<boolean> => {
      try {
        await updateUserWhitelist(id, whitelistOnly, allowedIps);
        await reload();
        return true;
      } catch (err) {
        toastError(err);
        return false;
      }
    },
    [reload, toastError]
  );

  return {
    users,
    loading,
    loadError,
    toast,
    setToast,
    reload,
    setStatus,
    editUser,
    assignRoles,
    changePassword,
    updateWhitelist,
    remove,
  };
}
