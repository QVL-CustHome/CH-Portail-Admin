import {
  ApproveButton,
  Card,
  DataTable,
  DeleteButton,
  Stack,
  useTranslation,
  type ChColumn,
} from "canopui";
import type { AdminUser } from "../api/admin";

interface PendingUsersCardProps {
  users: AdminUser[];
  loading: boolean;
  onApprove: (user: AdminUser) => void;
  onDelete: (userId: string) => void;
}

export default function PendingUsersCard({
  users,
  loading,
  onApprove,
  onDelete,
}: PendingUsersCardProps) {
  const { t } = useTranslation();

  const columns: ChColumn<AdminUser>[] = [
    { key: "name", header: t("admin.users.col.name"), sortable: true },
  ];

  return (
    <Card title={t("admin.dashboard.pendingTitle")}>
      <DataTable
        columns={columns}
        rows={users}
        getRowKey={(u) => u.user_id}
        loading={loading}
        emptyMessage={t("admin.dashboard.pendingEmpty")}
        stickyHeader
        animateRows
        enableKeyboardNav
        actionsHeader={t("admin.users.col.actions")}
        actions={(user) => (
          <Stack direction="row" gap="xs" justifyContent="end" wrap>
            <ApproveButton
              aria-label={`${t("admin.dashboard.action.approve")} ${user.name}`}
              onClick={() => onApprove(user)}
            />
            <DeleteButton
              aria-label={`${t("admin.users.action.delete")} ${user.name}`}
              confirmTitle={t("admin.dashboard.cancelTitle")}
              confirmMessage={t("admin.users.deleteMessage")}
              confirmLabel={t("admin.confirm")}
              cancelLabel={t("admin.cancel")}
              onConfirm={() => onDelete(user.user_id)}
            />
          </Stack>
        )}
      />
    </Card>
  );
}
