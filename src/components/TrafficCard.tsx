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
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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
        </div>

        {loading ? (
          <Spinner />
        ) : error || !data ? (
          <Feedback severity="error">{t("admin.dashboard.trafficError")}</Feedback>
        ) : (
          <Stack gap="sm">
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <span style={{ color: "var(--ch-palette-text-secondary)" }}>
                {t("admin.dashboard.registrationsLabel")}
              </span>
              <strong style={{ fontSize: "1.25rem" }}>{data.registrations}</strong>
            </div>

            <p style={{ margin: "0.5rem 0 0", fontWeight: 600 }}>
              {t("admin.dashboard.connectedLabel")}
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {data.portals.map((p) => (
                <li
                  key={p.portal}
                  style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem" }}
                >
                  <span>{t(`admin.portal.label.${p.portal}`)}</span>
                  <strong>{p.connected_users}</strong>
                </li>
              ))}
            </ul>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
