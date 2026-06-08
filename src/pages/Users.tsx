import { useEffect, useState } from "react";
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
import { listRoles, type Role } from "../api/roles";
import { statusTone } from "../lib/status";
import { useUsers } from "../hooks/useUsers";

export default function Users() {
  const { t } = useTranslation();
  const {
    users,
    loading,
    loadError,
    feedback,
    setFeedback,
    setStatus,
    editUser,
    assignRoles,
    changePassword,
    remove,
  } = useUsers();

  const [catalogue, setCatalogue] = useState<Role[]>([]);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [nameValue, setNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    listRoles()
      .then((roles) => {
        if (active) setCatalogue(roles);
      })
      .catch(() => {
        if (active) setCatalogue([]);
      });
    return () => {
      active = false;
    };
  }, []);

  function startEdit(user: AdminUser) {
    setEditing(user);
    setNameValue(user.name);
    setEmailValue(user.email);
    setPasswordValue("");
    setSelectedRoles([...user.roles]);
  }

  async function submitEdit() {
    if (!editing) return;
    setBusy(true);
    let ok = true;
    if (nameValue !== editing.name || emailValue !== editing.email) {
      ok = await editUser(editing.user_id, nameValue, emailValue);
    }
    if (ok) {
      ok = await assignRoles(editing.user_id, selectedRoles);
    }
    if (ok && passwordValue.trim() !== "") {
      ok = await changePassword(editing.user_id, passwordValue);
    }
    setBusy(false);
    if (ok) setEditing(null);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setBusy(true);
    await remove(toDelete.user_id);
    setBusy(false);
    setToDelete(null);
  }

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

  function rowActions(user: AdminUser) {
    return (
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
        <Button size="small" variant="secondary" onClick={() => startEdit(user)}>
          <Icon name="pencil" size={16} title={t("admin.users.action.edit")} />
        </Button>
        <Button size="small" variant="danger" onClick={() => setToDelete(user)}>
          <Icon name="trash" size={16} title={t("admin.users.action.delete")} />
        </Button>
      </div>
    );
  }

  return (
    <PageContent title={t("admin.users.title")}>
      {loadError && <Feedback severity="error">{loadError}</Feedback>}
      {feedback && (
        <Feedback severity={feedback.severity} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Feedback>
      )}

      {editing && (
        <Card title={t("admin.users.editTitle")}>
          <Form onSubmit={submitEdit} submitLabel={t("admin.save")} loading={busy}>
            <InputText
              label={t("admin.users.col.name")}
              value={nameValue}
              onChange={setNameValue}
              required
            />
            <InputEmail
              label={t("admin.users.col.email")}
              value={emailValue}
              onChange={setEmailValue}
              required
            />
            <InputPassword
              label={t("admin.users.passwordLabel")}
              value={passwordValue}
              onChange={setPasswordValue}
              autoComplete="new-password"
            />
            <MultiSelect
              label={t("admin.users.roleLabel")}
              placeholder={t("admin.users.roleSelectPlaceholder")}
              options={catalogue.map((role) => ({ value: role.name }))}
              value={selectedRoles}
              onChange={setSelectedRoles}
            />
          </Form>
          <div className="admin-actions">
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={busy}>
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
        actions={rowActions}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title={t("admin.users.deleteTitle")}
        message={toDelete ? `${t("admin.users.deleteMessage")} (${toDelete.email})` : undefined}
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
