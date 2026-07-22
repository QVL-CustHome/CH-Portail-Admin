import { useMemo } from "react";
import { useTranslation, type ChIconColor, type ChIconName } from "canopui";
import type { AccountStatus, AdminUser } from "../api/admin";

export interface DashboardStat {
  key: string;
  label: string;
  value: string;
  icon: ChIconName;
  iconColor: ChIconColor;
}

export function useDashboardStats(users: AdminUser[]): DashboardStat[] {
  const { t } = useTranslation();

  return useMemo(() => {
    const countByStatus = (status: AccountStatus) =>
      users.filter((user) => user.status === status).length;

    return [
      {
        key: "total",
        label: t("admin.dashboard.stat.total"),
        value: String(users.length),
        icon: "user",
        iconColor: "primary",
      },
      {
        key: "active",
        label: t("admin.dashboard.stat.active"),
        value: String(countByStatus("active")),
        icon: "check",
        iconColor: "success",
      },
      {
        key: "pending",
        label: t("admin.dashboard.stat.pending"),
        value: String(countByStatus("pending_validation")),
        icon: "info",
        iconColor: "warning",
      },
      {
        key: "disabled",
        label: t("admin.dashboard.stat.disabled"),
        value: String(countByStatus("disabled")),
        icon: "cancel",
        iconColor: "secondary",
      },
    ];
  }, [users, t]);
}
