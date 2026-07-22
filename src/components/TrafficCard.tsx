import {
  Card,
  Feedback,
  SegmentedControl,
  Spinner,
  Stack,
  useTranslation,
  type ChSegmentedControlOption,
} from "canopui";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { TrafficPeriod } from "../api/admin";
import { useTraffic } from "../hooks/useTraffic";

const PERIODS: TrafficPeriod[] = ["day", "week", "month", "year"];

export default function TrafficCard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TrafficPeriod>("week");
  const { data, loading, error } = useTraffic(period);

  const periodOptions: ChSegmentedControlOption<TrafficPeriod>[] = PERIODS.map((p) => ({
    value: p,
    label: t(`admin.dashboard.period.${p}`),
  }));

  return (
    <Card title={t("admin.dashboard.trafficTitle")}>
      <Stack gap="md">
        <SegmentedControl
          options={periodOptions}
          value={period}
          onChange={setPeriod}
          ariaLabel={t("admin.dashboard.trafficTitle")}
          size="small"
          fullWidth
        />

        {loading ? (
          <Spinner />
        ) : error || !data ? (
          <Feedback severity="error">{t("admin.dashboard.trafficError")}</Feedback>
        ) : (
          <Stack gap="sm">
            <Stack direction="row" alignItems="baseline" justifyContent="space-between" gap="md">
              <Typography component="span" color="text.secondary">
                {t("admin.dashboard.registrationsLabel")}
              </Typography>
              <Typography component="span" color="text.primary" fontWeight={700} fontSize="1.25rem">
                {data.registrations}
              </Typography>
            </Stack>

            <Typography component="span" color="text.primary" fontWeight={600}>
              {t("admin.dashboard.connectedLabel")}
            </Typography>
            <Stack gap="xs">
              {data.portals.map((p) => (
                <Stack
                  key={p.portal}
                  direction="row"
                  alignItems="baseline"
                  justifyContent="space-between"
                  gap="md"
                >
                  <Typography component="span" color="text.primary">
                    {t(`admin.portal.label.${p.portal}`)}
                  </Typography>
                  <Typography component="span" color="text.primary" fontWeight={600}>
                    {p.connected_users}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
