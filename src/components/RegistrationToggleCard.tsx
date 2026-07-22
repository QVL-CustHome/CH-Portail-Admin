import { Card, Stack, Toggle, useTranslation } from "canopui";
import Typography from "@mui/material/Typography";

interface RegistrationToggleCardProps {
  enabled: boolean;
  disabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function RegistrationToggleCard({
  enabled,
  disabled,
  onChange,
}: RegistrationToggleCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap="md" wrap>
        <Typography component="span" color="text.primary" fontWeight={600}>
          {t("admin.dashboard.registrationToggle")}
        </Typography>
        <Toggle
          checked={enabled}
          onChange={onChange}
          disabled={disabled}
          color="primary"
          label={t("admin.dashboard.registrationToggle")}
        />
      </Stack>
    </Card>
  );
}
