import {
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  Feedback,
  Form,
  InputText,
  PageContent,
  useTranslation,
  type ChColumn,
} from "@custhome/ui";
import type { Role } from "../api/roles";
import { useRoles } from "../hooks/useRoles";
import { useRoleCreateForm } from "../hooks/useRoleCreateForm";
import { useConfirmDelete } from "../hooks/useConfirmDelete";

export default function Roles() {
  const { t } = useTranslation();
  const { roles, loading, loadError, feedback, setFeedback, create, remove } = useRoles();

  const form = useRoleCreateForm(create);
  const del = useConfirmDelete<Role>(async (role) => { await remove(role.id); });

  const columns: ChColumn<Role>[] = [
    { key: "name", header: t("admin.roles.col.name"), sortable: true },
  ];

  return (
    <PageContent title={t("admin.roles.title")}>
      {loadError && <Feedback severity="error">{loadError}</Feedback>}
      {feedback && (
        <Feedback severity={feedback.severity} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Feedback>
      )}

      <Card title={t("admin.roles.createTitle")}>
        <Form onSubmit={form.submit} submitLabel={t("admin.roles.create")} loading={form.busy}>
          <InputText label={t("admin.roles.field.name")} value={form.name} onChange={form.setName} required />
        </Form>
      </Card>

      <DataTable
        columns={columns}
        rows={roles}
        getRowKey={(r) => r.id}
        loading={loading}
        emptyMessage={t("admin.roles.empty")}
        actions={(role) => (
          <div className="admin-actions">
            <Button size="small" variant="danger" onClick={() => del.request(role)}>
              {t("admin.roles.action.delete")}
            </Button>
          </div>
        )}
      />

      <ConfirmDialog
        open={del.target !== null}
        title={t("admin.roles.deleteTitle")}
        message={del.target ? `${t("admin.roles.deleteMessage")} (${del.target.name})` : undefined}
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
