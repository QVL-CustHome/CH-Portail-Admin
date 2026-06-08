import { useState } from "react";
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

export default function Roles() {
  const { t } = useTranslation();
  const { roles, loading, loadError, feedback, setFeedback, create, remove } = useRoles();

  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<Role | null>(null);

  async function submitCreate() {
    setBusy(true);
    const ok = await create({ name });
    setBusy(false);
    if (ok) setName("");
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setBusy(true);
    await remove(toDelete.id);
    setBusy(false);
    setToDelete(null);
  }

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
        <Form onSubmit={submitCreate} submitLabel={t("admin.roles.create")} loading={busy}>
          <InputText label={t("admin.roles.field.name")} value={name} onChange={setName} required />
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
            <Button size="small" variant="danger" onClick={() => setToDelete(role)}>
              {t("admin.roles.action.delete")}
            </Button>
          </div>
        )}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title={t("admin.roles.deleteTitle")}
        message={toDelete ? `${t("admin.roles.deleteMessage")} (${toDelete.name})` : undefined}
        confirmLabel={t("admin.confirm")}
        cancelLabel={t("admin.cancel")}
        destructive
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </PageContent>
  );
}
