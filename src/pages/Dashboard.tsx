import { useNavigate } from "react-router-dom";
import { Button, Card, Feedback, PageContent, Spinner, Stack, useTranslation } from "@custhome/ui";
import { useCurrentUser } from "../context/current-user";
import { usePendingUsers } from "../hooks/usePendingUsers";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const me = useCurrentUser();
  const { count, loading, error } = usePendingUsers();

  return (
    <PageContent title={t("admin.dashboard.title")}>
      <p className="admin-welcome">
        {t("admin.dashboard.welcome")} {me.email}
      </p>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Feedback severity="error">{error}</Feedback>
      ) : count > 0 ? (
        <Card title={t("admin.dashboard.pendingTitle")}>
          <Stack gap="md">
            <Feedback severity="warning">
              {count} {t("admin.dashboard.pendingUnit")}
            </Feedback>
            <div className="admin-actions">
              <Button onClick={() => navigate("/users")}>{t("admin.dashboard.pendingCta")}</Button>
            </div>
          </Stack>
        </Card>
      ) : (
        <Feedback severity="success">{t("admin.dashboard.noPending")}</Feedback>
      )}
    </PageContent>
  );
}
