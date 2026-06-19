import { Button, Card, Feedback, Spinner, Stack, useTranslation } from "@custhome/ui";
import { useState } from "react";
import type { TrafficPeriod } from "../api/admin";
import { useTraffic } from "../hooks/useTraffic";

const PERIODS: TrafficPeriod[] = ["day", "week", "month", "year"];

export default function TrafficCard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TrafficPeriod>("week");
  const { data, loading, error } = useTraffic(period);

  return (
    <Card title={t("admin.dashboard.trafficTitle")}>
      <Stack gap="md">
        <Stack direction="row" gap="sm" wrap>
          {PERIODS.map((p) => (
            <Button
              key={p}
              size="small"
              variant={p === period ? "primary" : "secondary"}
              onClick={() => setPeriod(p)}
            >
              {t(`admin.dashboard.period.${p}`)}
            </Button>
          ))}
        </Stack>

        {loading ? (
          <Spinner />
        ) : error || !data ? (
          <Feedback severity="error">{t("admin.dashboard.trafficError")}</Feedback>
        ) : (
          <Stack gap="sm">
            <Stack direction="row" alignItems="baseline" justifyContent="space-between" gap="md">
              <span className="admin-text-muted">{t("admin.dashboard.registrationsLabel")}</span>
              <strong className="admin-text-metric">{data.registrations}</strong>
            </Stack>

            <span className="admin-label-strong">{t("admin.dashboard.connectedLabel")}</span>
            <Stack gap="xs">
              {data.portals.map((p) => (
                <Stack
                  key={p.portal}
                  direction="row"
                  alignItems="baseline"
                  justifyContent="space-between"
                  gap="md"
                >
                  <span>{t(`admin.portal.label.${p.portal}`)}</span>
                  <strong>{p.connected_users}</strong>
                </Stack>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
