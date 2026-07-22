import { IconActionButton, Stack, useTranslation } from "canopui";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface AllowedIpsListProps {
  allowedIps: string[];
  onRemoveIp: (ip: string) => void;
}

export default function AllowedIpsList({ allowedIps, onRemoveIp }: AllowedIpsListProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="sm">
      <Typography component="span" color="text.primary" fontWeight={500}>
        {t("admin.users.allowedIps")}
      </Typography>
      {allowedIps.length === 0 ? (
        <Typography component="span" color="text.secondary">
          {t("admin.users.noIps")}
        </Typography>
      ) : (
        <Stack gap="xs">
          {allowedIps.map((ip) => (
            <Box
              key={ip}
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
                <Typography component="span" color="text.primary" fontFamily="monospace">
                  {ip}
                </Typography>
                <IconActionButton
                  icon="close"
                  variant="secondary"
                  size={28}
                  aria-label={`${t("admin.users.removeIp")} ${ip}`}
                  onClick={() => onRemoveIp(ip)}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
