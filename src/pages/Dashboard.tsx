import { CardGrid, Feedback, PageContent, Toast, useTranslation } from "canopui";
import { useUsers } from "../hooks/useUsers";
import { useRegistrationSetting } from "../hooks/useRegistrationSetting";
import DashboardStats from "../components/DashboardStats";
import RegistrationToggleCard from "../components/RegistrationToggleCard";
import TrafficCard from "../components/TrafficCard";
import PendingUsersCard from "../components/PendingUsersCard";

export default function Dashboard() {
  const { t } = useTranslation();
  const { users, loading, loadError, toast, setToast, setStatus, remove } = useUsers();
  const registration = useRegistrationSetting();

  const pendingUsers = users.filter((u) => u.status === "pending_validation");

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
    <PageContent>
      {loadError && <Feedback severity="error">{loadError}</Feedback>}

      <DashboardStats users={users} />

      <RegistrationToggleCard
        enabled={registration.enabled}
        disabled={registration.loading || registration.saving}
        onChange={handleRegistrationToggle}
      />

      <CardGrid minItemWidth="26rem" gap="md">
        <TrafficCard />
        <PendingUsersCard
          users={pendingUsers}
          loading={loading}
          onApprove={(user) => void setStatus(user, "active")}
          onDelete={(userId) => void remove(userId)}
        />
      </CardGrid>

      <Toast
        open={toast !== null}
        message={toast?.message ?? ""}
        severity={toast?.severity}
        onClose={() => setToast(null)}
      />
    </PageContent>
  );
}
