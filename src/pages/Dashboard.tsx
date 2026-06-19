import {
  ApproveButton,
  Card,
  DataTable,
  DeleteButton,
  Feedback,
  PageContent,
  Toast,
  Toggle,
  useTranslation,
  type ChColumn,
} from "@custhome/ui";
import { useUsers } from "../hooks/useUsers";
import { useRegistrationSetting } from "../hooks/useRegistrationSetting";
import TrafficCard from "../components/TrafficCard";
import type { AdminUser } from "../api/admin";

export default function Dashboard() {
  const { t } = useTranslation();
  const { users, loading, loadError, toast, setToast, setStatus, remove } = useUsers();
  const registration = useRegistrationSetting();

  const pendingUsers = users.filter((u) => u.status === "pending_validation");

  const columns: ChColumn<AdminUser>[] = [
    { key: "name", header: t("admin.users.col.name"), sortable: true },
  ];

  const handleRegistrationToggle = async (on: boolean) => {
    const ok = await registration.toggle(on);
    setToast(
      ok
        ? {
            severity: "success",
            message: on
              ? t("admin.dashboard.registrationEnabled")
              : t("admin.dashboard.registrationDisabled"),
          }
        : { severity: "error", message: t("admin.dashboard.registrationError") }
    );
  };

  return (
    <PageContent hideUtilitiesOnMobile fillHeight>
      <div className="admin-registration-toggle">
        <Toggle
          checked={registration.enabled}
          onChange={handleRegistrationToggle}
          disabled={registration.loading || registration.saving}
          color="primary"
          label={t("admin.dashboard.registrationToggle")}
        />
        <span>{t("admin.dashboard.registrationToggle")}</span>
      </div>

      {loadError && <Feedback severity="error">{loadError}</Feedback>}

      <div className="admin-dashboard-grid">
        <TrafficCard />

        <Card title={t("admin.dashboard.pendingTitle")} fill>
          <DataTable
            columns={columns}
            rows={pendingUsers}
            getRowKey={(u) => u.user_id}
            loading={loading}
            emptyMessage={t("admin.dashboard.pendingEmpty")}
            stickyHeader
            fillHeight
            animateRows
            enableKeyboardNav
            actionsHeader={t("admin.users.col.actions")}
            actions={(user) => (
              <div className="admin-actions">
                <ApproveButton
                  aria-label={`${t("admin.dashboard.action.approve")} ${user.name}`}
                  onClick={() => void setStatus(user, "active")}
                />
                <DeleteButton
                  aria-label={`${t("admin.users.action.delete")} ${user.name}`}
                  confirmTitle={t("admin.dashboard.cancelTitle")}
                  confirmMessage={t("admin.users.deleteMessage")}
                  confirmLabel={t("admin.confirm")}
                  cancelLabel={t("admin.cancel")}
                  onConfirm={() => void remove(user.user_id)}
                />
              </div>
            )}
          />
        </Card>
      </div>

      <Toast
        open={toast !== null}
        message={toast?.message ?? ""}
        severity={toast?.severity}
        onClose={() => setToast(null)}
      />
    </PageContent>
  );
}
