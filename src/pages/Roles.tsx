import {
  AddButton,
  BulletList,
  Card,
  CardGrid,
  ConfirmDialog,
  Feedback,
  IconActionButton,
  InputText,
  PageContent,
  Stack,
  Toast,
  useTranslation,
  type ChBulletListItem,
} from "canopui";
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

      <CardGrid minItemWidth="17.5rem" gap="md">
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
                <Stack direction="row" gap="xs">
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
                </Stack>
              ),
            });
          }

          return (
            <Card
              key={portal}
              title={t(`admin.portal.label.${portal}`)}
              subtitle={t("admin.roles.portalRole", { role: portal })}
            >
              <Stack gap="sm">
                {loading ? null : items.length === 0 ? (
                  <span className="admin-text-muted">{t("admin.roles.noSubRoles")}</span>
                ) : (
                  <BulletList items={items} />
                )}
                {!isAdding && (
                  <AddButton
                    aria-label={t("admin.roles.addSubRole")}
                    onClick={() => startAdd(portal)}
                  />
                )}
              </Stack>
            </Card>
          );
        })}
      </CardGrid>

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
