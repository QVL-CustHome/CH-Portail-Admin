import { Checkbox, Stack, Toggle, useTranslation } from "canopui";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PORTALS, type Role } from "../api/roles";

interface UserRolesEditorProps {
  catalogue: Role[];
  roles: string[];
  onToggleRole: (roleName: string) => void;
}

export default function UserRolesEditor({ catalogue, roles, onToggleRole }: UserRolesEditorProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      {PORTALS.map((portal) => {
        const subs = catalogue.filter((role) => role.portal === portal && role.kind === "sub");
        return (
          <Box
            key={portal}
            sx={{
              border: "0.0625rem solid var(--ch-palette-divider)",
              borderRadius: "var(--ch-radius-md)",
            }}
          >
            <Stack gap="sm" padding="sm">
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap="md">
                <Typography component="span" color="text.primary" fontWeight={600}>
                  {t(`admin.portal.label.${portal}`)}
                </Typography>
                <Toggle
                  checked={roles.includes(portal)}
                  onChange={() => onToggleRole(portal)}
                  color="primary"
                  label={t("admin.users.portalAccess")}
                />
              </Stack>
              {subs.length > 0 && (
                <Stack gap="xs">
                  <Typography variant="body2" component="span" color="text.secondary">
                    {t("admin.users.subRoles")}
                  </Typography>
                  {subs.map((role) => (
                    <Checkbox
                      key={role.id}
                      checked={roles.includes(role.name)}
                      onChange={() => onToggleRole(role.name)}
                      label={role.name}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
