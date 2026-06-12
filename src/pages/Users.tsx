import {
  DataTable,
  DeleteButton,
  Feedback,
  IconActionButton,
  InputEmail,
  InputPassword,
  InputText,
  MultiSelect,
  PageContent,
  SidePanel,
  StatusChip,
  Toast,
  Toggle,
  useTranslation,
  type ChColumn,
} from "@custhome/ui";
import type { AdminUser } from "../api/admin";
import { statusTone } from "../lib/status";
import { useUsers } from "../hooks/useUsers";
import { useUserEditForm } from "../hooks/useUserEditForm";

export default function Users() {
  const { t } = useTranslation();
  const { users, loading, loadError, feedback, setFeedback, toast, setToast, setStatus, editUser, assignRoles, changePassword, updateWhitelist, remove } =
    useUsers();

  const edit = useUserEditForm({ editUser, assignRoles, changePassword, updateWhitelist });

  const handleDeleteUser = async () => {
    if (!edit.editing) return;
    const ok = await remove(edit.editing.user_id);
    if (ok) edit.cancelEdit();
  };

  const columns: ChColumn<AdminUser>[] = [
    { key: "name", header: t("admin.users.col.name"), sortable: true, width: "18%" },
    { key: "email", header: t("admin.users.col.email"), sortable: true, width: "24%" },
    {
      key: "status",
      header: t("admin.users.col.status"),
      width: "13%",
      render: (u) => <StatusChip tone={statusTone[u.status]} label={t(`admin.status.${u.status}`)} />,
    },
    {
      key: "roles",
      header: t("admin.users.col.roles"),
      width: "21%",
      render: (u) => (u.roles.length ? u.roles.join(", ") : t("admin.users.noRoles")),
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
          color="accent"
          label={u.status === "active" ? t("admin.users.action.disable") : t("admin.users.action.activate")}
        />
      ),
    },
  ];

  return (
    <PageContent title={t("admin.users.title")}>
      {loadError && <Feedback severity="error">{loadError}</Feedback>}
      {feedback && (
        <Feedback severity={feedback.severity} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Feedback>
      )}

      <SidePanel
        open={edit.editing !== null}
        onClose={edit.cancelEdit}
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
        <form
          onSubmit={(e) => { e.preventDefault(); void edit.submitEdit(); }}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <InputText
            label={t("admin.users.col.name")}
            value={edit.form.name}
            onChange={edit.form.setName}
            required
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
          <MultiSelect
            label={t("admin.users.roleLabel")}
            placeholder={t("admin.users.roleSelectPlaceholder")}
            options={edit.catalogue.map((role) => ({ value: role.name }))}
            value={edit.form.roles}
            onChange={edit.form.setRoles}
          />
        </form>

        <hr style={{ border: "none", borderTop: "1px solid var(--ch-palette-divider, #e6e3dc)", margin: "1.25rem 0" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <span style={{ fontWeight: 500 }}>{t("admin.users.whitelistOnly")}</span>
          <Toggle
            checked={edit.whitelistOnly}
            onChange={edit.setWhitelistOnly}
            color="accent"
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

      <DataTable
        columns={columns}
        rows={users}
        getRowKey={(u) => u.user_id}
        loading={loading}
        emptyMessage={t("admin.users.empty")}
        fixedLayout
        actionsWidth="10%"
        actions={(user) => (
          <div className="admin-actions">
            <IconActionButton icon="pencil" aria-label={t("admin.users.action.edit")} onClick={() => edit.startEdit(user)} />
          </div>
        )}
      />

      <Toast open={toast !== null} message={toast ?? ""} onClose={() => setToast(null)} />
    </PageContent>
  );
}
