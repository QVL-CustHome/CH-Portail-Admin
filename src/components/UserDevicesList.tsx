import { IconActionButton, Stack, useTranslation } from "canopui";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { UserDevice } from "../api/admin";

interface UserDevicesListProps {
  devices: UserDevice[];
  /** Sur un compte restreint, retirer le dernier appareil le verrouillerait
   *  définitivement : l'API refuse, autant ne pas proposer le geste. */
  canRevoke: boolean;
  onRevoke: (deviceId: string) => void;
}

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function UserDevicesList({ devices, canRevoke, onRevoke }: UserDevicesListProps) {
  const { t, locale } = useTranslation();

  return (
    <Stack gap="sm">
      <Typography component="span" color="text.primary" fontWeight={500}>
        {t("admin.users.devices")}
      </Typography>

      {devices.length === 0 ? (
        <Typography component="span" color="text.secondary">
          {t("admin.users.noDevices")}
        </Typography>
      ) : (
        <Stack gap="xs">
          {devices.map((device) => (
            <Box
              key={device.id}
              sx={{
                borderRadius: "var(--ch-radius-sm)",
                backgroundColor: "var(--ch-palette-surface-sunken)",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap="sm"
                padding="xs"
              >
                <Stack gap="xs">
                  <Typography component="span" color="text.primary">
                    {device.label || t("admin.users.unknownDevice")}
                  </Typography>
                  <Typography component="span" color="text.secondary" variant="body2">
                    {t("admin.users.deviceLastSeen")} {formatDate(device.last_seen, locale)}
                    {device.last_ip ? ` · ${device.last_ip}` : ""}
                  </Typography>
                </Stack>
                {canRevoke && (
                  <IconActionButton
                    icon="close"
                    variant="secondary"
                    size={28}
                    aria-label={`${t("admin.users.revokeDevice")} ${device.label}`}
                    onClick={() => onRevoke(device.id)}
                  />
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
