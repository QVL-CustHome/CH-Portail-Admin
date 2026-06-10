import {
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  Feedback,
  Form,
  Icon,
  InputEmail,
  InputPassword,
  InputText,
  MultiSelect,
  PageContent,
  StatusChip,
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
    { key: "name", header: t("admin.users.col.name"), sortable: true },
    { key: "email", header: t("admin.users.col.email"), sortable: true },
    {
      key: "status",
      header: t("admin.users.col.status"),
      render: (u) => <StatusChip tone={statusTone[u.status]} label={t(`admin.status.${u.status}`)} />,
    },
    {
      key: "roles",
      header: t("admin.users.col.roles"),
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
          <Form onSubmit={edit.submitEdit} submitLabel={t("admin.save")} loading={edit.busy}>
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
          </Form>
          <div className="admin-actions">
            <Button variant="secondary" onClick={edit.cancelEdit} disabled={edit.busy}>
              {t("admin.cancel")}
            </Button>
          </div>
        </Card>
      )}

      <DataTable
        columns={columns}
        rows={users}
        getRowKey={(u) => u.user_id}
        loading={loading}
        emptyMessage={t("admin.users.empty")}
        actions={(user) => (
          <div className="admin-actions">
            {user.status === "pending_validation" && (
              <Button size="small" onClick={() => setStatus(user.user_id, "active")}>
                {t("admin.users.action.validate")}
              </Button>
            )}
            {user.status === "active" && (
              <Button size="small" variant="secondary" onClick={() => setStatus(user.user_id, "disabled")}>
                {t("admin.users.action.disable")}
              </Button>
            )}
            {user.status === "disabled" && (
              <Button size="small" onClick={() => setStatus(user.user_id, "active")}>
                {t("admin.users.action.activate")}
              </Button>
            )}
            <Button size="small" variant="secondary" onClick={() => edit.startEdit(user)}>
              <Icon name="pencil" size={16} title={t("admin.users.action.edit")} />
            </Button>
            <Button size="small" variant="danger" onClick={() => del.request(user)}>
              <Icon name="trash" size={16} title={t("admin.users.action.delete")} />
            </Button>
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
