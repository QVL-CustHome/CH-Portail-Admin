import { IconActionButton, Stack, useTranslation } from "@custhome/ui";

interface AllowedIpsListProps {
  allowedIps: string[];
  onRemoveIp: (ip: string) => void;
}

export default function AllowedIpsList({ allowedIps, onRemoveIp }: AllowedIpsListProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="sm">
      <span className="admin-label-medium">{t("admin.users.allowedIps")}</span>
      {allowedIps.length === 0 ? (
        <span className="admin-text-muted">{t("admin.users.noIps")}</span>
      ) : (
        <Stack gap="xs">
          {allowedIps.map((ip) => (
            <div key={ip} className="admin-ip-row">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap="sm"
                padding="xs"
              >
                <span className="admin-ip-value">{ip}</span>
                <IconActionButton
                  icon="close"
                  variant="secondary"
                  size={28}
                  aria-label={`${t("admin.users.removeIp")} ${ip}`}
                  onClick={() => onRemoveIp(ip)}
                />
              </Stack>
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
