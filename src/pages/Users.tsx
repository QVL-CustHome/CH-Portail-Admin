import {
  Checkbox,
  DataTable,
  DeleteButton,
  Feedback,
  IconActionButton,
  InputEmail,
  InputPassword,
  InputText,
  Legend,
  NAME_REGEX,
  PageContent,
  SidePanel,
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
          <div className="admin-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
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
          </div>
        }
      >
        {edit.editing && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={{ fontWeight: 500 }}>{t("admin.users.col.status")}</span>
            <StatusChip
              tone={statusTone[edit.editing.status]}
              label={t(`admin.status.${edit.editing.status}`)}
            />
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); void edit.submitEdit(); }}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {PORTALS.map((portal) => {
              const subs = edit.catalogue.filter((r) => r.portal === portal && r.kind === "sub");
              return (
                <div
                  key={portal}
                  style={{
                    border: "1px solid var(--ch-palette-divider, #e6e3dc)",
                    borderRadius: 10,
                    padding: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                    <span style={{ fontWeight: 600 }}>{t(`admin.portal.label.${portal}`)}</span>
                    <Toggle
                      checked={edit.form.roles.includes(portal)}
                      onChange={() => toggleRole(portal)}
                      color="primary"
                      label={t("admin.users.portalAccess")}
                    />
                  </div>
                  {subs.length > 0 && (
                    <div style={{ marginTop: "0.6rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--ch-palette-text-secondary, #5a564e)" }}>
                        {t("admin.users.subRoles")}
                      </span>
                      {subs.map((role) => (
                        <Checkbox
                          key={role.id}
                          checked={edit.form.roles.includes(role.name)}
                          onChange={() => toggleRole(role.name)}
                          label={role.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </form>

        <hr style={{ border: "none", borderTop: "1px solid var(--ch-palette-divider, #e6e3dc)", margin: "1.25rem 0" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <span style={{ fontWeight: 500 }}>{t("admin.users.whitelistOnly")}</span>
          <Toggle
            checked={edit.whitelistOnly}
            onChange={edit.setWhitelistOnly}
            color="primary"
            label={t("admin.users.whitelistOnly")}
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <p style={{ fontWeight: 500, margin: "0 0 0.5rem" }}>{t("admin.users.allowedIps")}</p>
          {edit.allowedIps.length === 0 ? (
            <p style={{ color: "var(--ch-palette-text-secondary, #5a564e)", margin: 0 }}>
              {t("admin.users.noIps")}
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {edit.allowedIps.map((ip) => (
                <li
                  key={ip}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                    padding: "0.35rem 0.6rem",
                    borderRadius: 8,
                    background: "var(--ch-palette-background-default, #fbfaf9)",
                  }}
                >
                  <span style={{ fontFamily: "monospace" }}>{ip}</span>
                  <IconActionButton
                    icon="close"
                    variant="secondary"
                    size={28}
                    aria-label={`${t("admin.users.removeIp")} ${ip}`}
                    onClick={() => edit.removeIp(ip)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </SidePanel>

      <div style={{ marginBottom: "1rem" }}>
        <Legend
          items={[
            { status: "warning", label: t("admin.status.pending_validation") },
            { status: "neutral", label: t("admin.status.disabled") },
          ]}
        />
      </div>

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

      <Toast
        open={toast !== null}
        message={toast?.message ?? ""}
        severity={toast?.severity}
        onClose={() => setToast(null)}
      />
    </PageContent>
  );
}
