import {
  DataTable,
  DeleteButton,
  Divider,
  Feedback,
  IconActionButton,
  InputEmail,
  InputPassword,
  InputText,
  Legend,
  NAME_REGEX,
  PageContent,
  SidePanel,
  Stack,
  StatusChip,
  Toast,
  Toggle,
  useTranslation,
  type ChColumn,
} from "@custhome/ui";
import type { AdminUser } from "../api/admin";
import { PORTALS } from "../api/roles";
import { statusTone } from "../lib/status";
import { useUsers } from "../hooks/useUsers";
import { useUserEditForm } from "../hooks/useUserEditForm";
import UserRolesEditor from "../components/UserRolesEditor";
import AllowedIpsList from "../components/AllowedIpsList";

export default function Users() {
  const { t } = useTranslation();
  const { users, loading, loadError, toast, setToast, setStatus, editUser, assignRoles, changePassword, updateWhitelist, remove } =
    useUsers();

  const edit = useUserEditForm({
    editUser,
    assignRoles,
    changePassword,
    updateWhitelist,
    onUpdated: (name) =>
      setToast({ severity: "success", message: `${name} ${t("admin.users.updated")}` }),
  });

  const handleDeleteUser = async () => {
    if (!edit.editing) return;
    const ok = await remove(edit.editing.user_id);
    if (ok) edit.cancelEdit();
  };

  const toggleRole = (roleName: string) => {
    const has = edit.form.roles.includes(roleName);
    edit.form.setRoles(
      has ? edit.form.roles.filter((r) => r !== roleName) : [...edit.form.roles, roleName]
    );
  };

  const handlePanelClose = () => {
    setToast({ severity: "info", message: t("admin.users.unsavedChanges") });
    edit.cancelEdit();
  };

  const columns: ChColumn<AdminUser>[] = [
    { key: "name", header: t("admin.users.col.name"), sortable: true, width: "18%" },
    { key: "email", header: t("admin.users.col.email"), sortable: true, width: "24%", hideOnMobile: true },
    {
      key: "roles",
      header: t("admin.users.col.roles"),
      width: "21%",
      hideOnMobile: true,
      render: (u) => {
        const portalRoles = u.roles.filter((r) => (PORTALS as readonly string[]).includes(r));
        return portalRoles.length
          ? portalRoles.map((r) => t(`admin.portal.label.${r}`)).join(", ")
          : t("admin.users.noPortalRoles");
      },
    },
    {
      key: "active",
      header: t("admin.users.col.active"),
      width: "14%",
      align: "center",
      render: (u) => (
        <Toggle
          checked={u.status === "active"}
          onChange={(on) => setStatus(u, on ? "active" : "disabled")}
          size="small"
          color="primary"
          label={u.status === "active" ? t("admin.users.action.disable") : t("admin.users.action.activate")}
        />
      ),
    },
  ];

  return (
    <PageContent hideUtilitiesOnMobile fillHeight>
      {loadError && <Feedback severity="error">{loadError}</Feedback>}

      <SidePanel
        open={edit.editing !== null}
        onClose={handlePanelClose}
        title={t("admin.users.editTitle")}
        footer={
          <Stack direction="row" justifyContent="end" gap="sm">
            <IconActionButton icon="save" aria-label={t("admin.save")} onClick={edit.submitEdit} disabled={edit.busy} />
            <DeleteButton
              aria-label={t("admin.users.action.delete")}
              confirmTitle={edit.editing ? `${t("admin.users.action.delete")} ${edit.editing.name} ?` : undefined}
              confirmMessage={t("admin.users.deleteMessage")}
              confirmLabel={t("admin.confirm")}
              cancelLabel={t("admin.cancel")}
              disabled={edit.busy}
              onConfirm={handleDeleteUser}
            />
          </Stack>
        }
      >
        {edit.editing && (
          <Stack direction="row" alignItems="center" gap="sm">
            <span className="admin-label-medium">{t("admin.users.col.status")}</span>
            <StatusChip
              tone={statusTone[edit.editing.status]}
              label={t(`admin.status.${edit.editing.status}`)}
            />
          </Stack>
        )}

        <Stack
          as="form"
          gap="md"
          onSubmit={(e) => { e.preventDefault(); void edit.submitEdit(); }}
        >
          <InputText
            label={t("admin.users.col.name")}
            value={edit.form.name}
            onChange={edit.form.setName}
            required
            pattern={NAME_REGEX}
            patternMessage={t("admin.users.nameInvalid")}
          />
          <InputEmail
            label={t("admin.users.col.email")}
            value={edit.form.email}
            onChange={edit.form.setEmail}
            required
          />
          <InputPassword
            label={t("admin.users.passwordLabel")}
            value={edit.form.password}
            onChange={edit.form.setPassword}
            autoComplete="new-password"
          />
          <UserRolesEditor
            catalogue={edit.catalogue}
            roles={edit.form.roles}
            onToggleRole={toggleRole}
          />
        </Stack>

        <Divider spacing="lg" />

        <Stack gap="md">
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap="md">
            <span className="admin-label-medium">{t("admin.users.whitelistOnly")}</span>
            <Toggle
              checked={edit.whitelistOnly}
              onChange={edit.setWhitelistOnly}
              color="primary"
              label={t("admin.users.whitelistOnly")}
            />
          </Stack>

          <AllowedIpsList allowedIps={edit.allowedIps} onRemoveIp={edit.removeIp} />
        </Stack>
      </SidePanel>

      <Stack gap="md" fill>
        <Legend
          items={[
            { status: "warning", label: t("admin.status.pending_validation") },
            { status: "neutral", label: t("admin.status.disabled") },
          ]}
        />

        <DataTable
          columns={columns}
          rows={users}
          getRowKey={(u) => u.user_id}
          loading={loading}
          emptyMessage={t("admin.users.empty")}
          fixedLayout
          stickyHeader
          fillHeight
          actionsWidth="10%"
          rowSx={(u) =>
            u.status === "disabled"
              ? { opacity: 0.5 }
              : u.status === "pending_validation"
                ? { "& td": { backgroundColor: "warning.main", color: "warning.contrastText", borderBottom: "none" } }
                : {}
          }
          actions={(user) => (
            <div className="admin-actions">
              <IconActionButton icon="pencil" aria-label={t("admin.users.action.edit")} onClick={() => edit.startEdit(user)} />
            </div>
          )}
        />
      </Stack>

      <Toast
        open={toast !== null}
        message={toast?.message ?? ""}
        severity={toast?.severity}
        onClose={() => setToast(null)}
      />
    </PageContent>
  );
}
