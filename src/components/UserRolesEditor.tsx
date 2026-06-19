import { Checkbox, Stack, Toggle, useTranslation } from "@custhome/ui";
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
          <div key={portal} className="admin-roles-portal-card">
            <Stack gap="sm" padding="sm">
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap="md">
                <span className="admin-label-strong">{t(`admin.portal.label.${portal}`)}</span>
                <Toggle
                  checked={roles.includes(portal)}
                  onChange={() => onToggleRole(portal)}
                  color="primary"
                  label={t("admin.users.portalAccess")}
                />
              </Stack>
              {subs.length > 0 && (
                <Stack gap="xs">
                  <span className="admin-text-secondary">{t("admin.users.subRoles")}</span>
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
          </div>
        );
      })}
    </Stack>
  );
}
