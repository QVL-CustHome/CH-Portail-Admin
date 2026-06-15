import {
  AddButton,
  BulletList,
  Card,
  ConfirmDialog,
  Feedback,
  IconActionButton,
  InputText,
  PageContent,
  Toast,
  useTranslation,
  type ChBulletListItem,
} from "@custhome/ui";
import { useState } from "react";
import { PORTALS, type Portal, type Role } from "../api/roles";
import { useRoles } from "../hooks/useRoles";
import { useConfirmDelete } from "../hooks/useConfirmDelete";

export default function Roles() {
  const { t } = useTranslation();
  const { roles, loading, loadError, toast, setToast, create, remove } = useRoles();
  const del = useConfirmDelete<Role>(async (role) => {
    await remove(role.id);
  });
  const [addingPortal, setAddingPortal] = useState<Portal | null>(null);
  const [draftName, setDraftName] = useState("");
  const [busy, setBusy] = useState(false);

  const subRolesFor = (portal: Portal) =>
    roles.filter((role) => role.portal === portal && role.kind === "sub");

  const startAdd = (portal: Portal) => {
    setAddingPortal(portal);
    setDraftName("");
  };

  const cancelAdd = () => {
    setAddingPortal(null);
    setDraftName("");
  };

  const addSubRole = async (portal: Portal) => {
    const name = draftName.trim();
    if (!name) return;
    setBusy(true);
    const ok = await create({ name, portal });
    setBusy(false);
    if (ok) cancelAdd();
  };

  return (
    <PageContent hideUtilitiesOnMobile>
      {loadError && <Feedback severity="error">{loadError}</Feedback>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {PORTALS.map((portal) => {
          const subs = subRolesFor(portal);
          const isAdding = addingPortal === portal;
          const items: ChBulletListItem[] = subs.map((role) => ({
            key: role.id,
            content: role.name,
            action: (
              <IconActionButton
                icon="trash"
                variant="danger"
                size={28}
                aria-label={t("admin.roles.action.delete")}
                onClick={() => del.request(role)}
              />
            ),
          }));
          if (isAdding) {
            items.push({
              key: "__new__",
              content: (
                <InputText
                  label={t("admin.roles.field.namePlaceholder")}
                  value={draftName}
                  onChange={setDraftName}
                  size="small"
                />
              ),
              action: (
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <IconActionButton
                    icon="save"
                    aria-label={t("admin.save")}
                    onClick={() => void addSubRole(portal)}
                    disabled={busy}
                  />
                  <IconActionButton
                    icon="cancel"
                    variant="secondary"
                    aria-label={t("admin.cancel")}
                    onClick={cancelAdd}
                  />
                </div>
              ),
            });
          }

          return (
            <Card
              key={portal}
              title={t(`admin.portal.label.${portal}`)}
              subtitle={t("admin.roles.portalRole", { role: portal })}
            >
              {loading ? null : items.length === 0 ? (
                <p style={{ color: "var(--ch-palette-text-secondary)", margin: "0 0 0.75rem" }}>
                  {t("admin.roles.noSubRoles")}
                </p>
              ) : (
                <div style={{ marginBottom: "0.75rem" }}>
                  <BulletList items={items} />
                </div>
              )}
              {!isAdding && (
                <AddButton
                  aria-label={t("admin.roles.addSubRole")}
                  onClick={() => startAdd(portal)}
                />
              )}
            </Card>
          );
        })}
      </div>

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

      <Toast
        open={toast !== null}
        message={toast?.message ?? ""}
        severity={toast?.severity}
        onClose={() => setToast(null)}
      />
    </PageContent>
  );
}
