import {
  AddButton,
  ConfirmDialog,
  DataTable,
  Feedback,
  IconActionButton,
  InputText,
  PageContent,
  useTranslation,
  type ChColumn,
} from "@custhome/ui";
import { useState } from "react";
import type { Role } from "../api/roles";
import { useRoles } from "../hooks/useRoles";
import { useRoleCreateForm } from "../hooks/useRoleCreateForm";
import { useConfirmDelete } from "../hooks/useConfirmDelete";

export default function Roles() {
  const { t } = useTranslation();
  const { roles, loading, loadError, feedback, setFeedback, create, remove } = useRoles();

  const form = useRoleCreateForm(create);
  const del = useConfirmDelete<Role>(async (role) => { await remove(role.id); });
  const [adding, setAdding] = useState(false);

  const columns: ChColumn<Role>[] = [
    { key: "name", header: t("admin.roles.col.name"), sortable: true },
  ];

  const cancelAdd = () => {
    setAdding(false);
    form.setName("");
  };

  const submitAdd = async () => {
    const ok = await form.submit();
    if (ok) setAdding(false);
  };

  return (
    <PageContent title={t("admin.roles.title")}>
      {loadError && <Feedback severity="error">{loadError}</Feedback>}
      {feedback && (
        <Feedback severity={feedback.severity} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Feedback>
      )}

      <DataTable
        columns={columns}
        rows={roles}
        getRowKey={(r) => r.id}
        loading={loading}
        emptyMessage={t("admin.roles.empty")}
        actions={(role) => (
          <IconActionButton icon="trash" variant="danger" aria-label={t("admin.roles.action.delete")} onClick={() => del.request(role)} />
        )}
      />

      {adding ? (
        <form
          onSubmit={(e) => { e.preventDefault(); void submitAdd(); }}
          style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", marginTop: "1rem" }}
        >
          <div style={{ flex: 1 }}>
            <InputText
              label={t("admin.roles.field.name")}
              value={form.name}
              onChange={form.setName}
              required
            />
          </div>
          <IconActionButton
            icon="cancel"
            variant="secondary"
            aria-label={t("admin.cancel")}
            onClick={cancelAdd}
            disabled={form.busy}
          />
          <IconActionButton
            icon="save"
            aria-label={t("admin.save")}
            onClick={() => void submitAdd()}
            disabled={form.busy}
          />
        </form>
      ) : (
        <div style={{ marginTop: "1rem" }}>
          <AddButton aria-label={t("admin.roles.create")} onClick={() => setAdding(true)} />
        </div>
      )}

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
