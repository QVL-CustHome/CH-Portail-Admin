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
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem",
                borderRadius: "var(--ch-radius-sm)",
                backgroundColor: "var(--ch-palette-surface-sunken)",
              }}
            >
              {/* minWidth 0 : sans lui, une adresse IPv6 refuse de se replier
                  et pousse la croix hors de la carte sur mobile. */}
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography color="text.primary" noWrap>
                  {device.label || t("admin.users.unknownDevice")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("admin.users.deviceLastSeen")} {formatDate(device.last_seen, locale)}
                </Typography>
                {device.last_ip && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component="div"
                    sx={{ fontFamily: "monospace", overflowWrap: "anywhere" }}
                  >
                    {device.last_ip}
                  </Typography>
                )}
              </Box>

              {canRevoke && (
                <Box sx={{ flexShrink: 0 }}>
                  <IconActionButton
                    icon="close"
                    variant="secondary"
                    size={28}
                    aria-label={`${t("admin.users.revokeDevice")} ${device.label}`}
                    onClick={() => onRevoke(device.id)}
                  />
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
