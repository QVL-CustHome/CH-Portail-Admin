import {
  Card,
  ConfirmDialog,
  DataTable,
  Feedback,
  Form,
  IconActionButton,
  InputEmail,
  InputPassword,
  InputText,
  MultiSelect,
  PageContent,
  StatusChip,
  Toggle,
  useTranslation,
  type ChColumn,
} from "@custhome/ui";
import type { AdminUser } from "../api/admin";
import { statusTone } from "../lib/status";
import { useUsers } from "../hooks/useUsers";
import { useUserEditForm } from "../hooks/useUserEditForm";
import { useConfirmDelete } from "../hooks/useConfirmDelete";

export default function Users() {
  const { t } = useTranslation();
  const { users, loading, loadError, feedback, setFeedback, setStatus, editUser, assignRoles, changePassword, remove } =
    useUsers();

  const edit = useUserEditForm({ editUser, assignRoles, changePassword });
  const del = useConfirmDelete<AdminUser>(async (user) => { await remove(user.user_id); });

  const columns: ChColumn<AdminUser>[] = [
    { key: "name", header: t("admin.users.col.name"), sortable: true, width: "20%" },
    { key: "email", header: t("admin.users.col.email"), sortable: true, width: "25%" },
    {
      key: "status",
      header: t("admin.users.col.status"),
      width: "15%",
      render: (u) => <StatusChip tone={statusTone[u.status]} label={t(`admin.status.${u.status}`)} />,
    },
    {
      key: "roles",
      header: t("admin.users.col.roles"),
      width: "20%",
      render: (u) => (u.roles.length ? u.roles.join(", ") : t("admin.users.noRoles")),
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

      {edit.editing && (
        <Card title={t("admin.users.editTitle")}>
          <Form onSubmit={edit.submitEdit} loading={edit.busy}>
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
            <div className="admin-actions">
              <IconActionButton icon="cancel" variant="secondary" aria-label={t("admin.cancel")} onClick={edit.cancelEdit} />
              <IconActionButton icon="save" aria-label={t("admin.save")} onClick={edit.submitEdit} />
            </div>
          </Form>
        </Card>
      )}

      <DataTable
        columns={columns}
        rows={users}
        getRowKey={(u) => u.user_id}
        loading={loading}
        emptyMessage={t("admin.users.empty")}
        fixedLayout
        actionsHeader={t("admin.users.col.actions")}
        actionsWidth="20%"
        actions={(user) => (
          <div className="admin-actions">
            <Toggle
              checked={user.status === "active"}
              onChange={(on) => setStatus(user.user_id, on ? "active" : "disabled")}
              size="small"
              color="secondary"
              label={user.status === "active" ? t("admin.users.action.disable") : t("admin.users.action.activate")}
            />
            <IconActionButton icon="pencil" aria-label={t("admin.users.action.edit")} onClick={() => edit.startEdit(user)} />
            <IconActionButton icon="trash" variant="danger" aria-label={t("admin.users.action.delete")} onClick={() => del.request(user)} />
          </div>
        )}
      />

      <ConfirmDialog
        open={del.target !== null}
        title={t("admin.users.deleteTitle")}
        message={del.target ? `${t("admin.users.deleteMessage")} (${del.target.email})` : undefined}
        confirmLabel={t("admin.confirm")}
        cancelLabel={t("admin.cancel")}
        destructive
        loading={del.busy}
        onConfirm={del.confirm}
        onCancel={del.cancel}
      />
    </PageContent>
  );
}
