import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@custhome/ui";
import { ApiError } from "../api/client";
import {
  deleteUser,
  listUsers,
  updateUser,
  updateUserPassword,
  updateUserRoles,
  updateUserStatus,
  type AccountStatus,
  type AdminUser,
} from "../api/admin";

export interface UsersFeedback {
  severity: "success" | "error";
  message: string;
}

export function useUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<UsersFeedback | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
    async (action: () => Promise<unknown>, successKey: string): Promise<boolean> => {
      try {
        await action();
        setFeedback({ severity: "success", message: t(successKey) });
        await reload();
        return true;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t("admin.users.actionError");
        setFeedback({ severity: "error", message });
        return false;
      }
    },
    [reload, t]
  );

  const setStatus = useCallback(
    async (user: AdminUser, status: AccountStatus): Promise<boolean> => {
      try {
        await updateUserStatus(user.user_id, status);
        await reload();
        const key = status === "active" ? "admin.users.activated" : "admin.users.disabled";
        setToast(`${user.name} ${t(key)}`);
        return true;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : t("admin.users.actionError");
        setFeedback({ severity: "error", message });
        return false;
      }
    },
    [reload, t]
  );

  const editUser = useCallback(
    (id: string, name: string, email: string) =>
      run(() => updateUser(id, name, email), "admin.users.profileUpdated"),
    [run]
  );

  const assignRoles = useCallback(
    (id: string, roles: string[]) =>
      run(() => updateUserRoles(id, roles), "admin.users.rolesUpdated"),
    [run]
  );

  const changePassword = useCallback(
    (id: string, password: string) =>
      run(() => updateUserPassword(id, password), "admin.users.passwordUpdated"),
    [run]
  );

  const remove = useCallback(
    (id: string) => run(() => deleteUser(id), "admin.users.deleted"),
    [run]
  );

  return {
    users,
    loading,
    loadError,
    feedback,
    setFeedback,
    toast,
    setToast,
    reload,
    setStatus,
    editUser,
    assignRoles,
    changePassword,
    remove,
  };
}
