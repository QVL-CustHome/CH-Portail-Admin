import { useCallback, useEffect, useState } from "react";
import type { AdminUser, UserDevice } from "../api/admin";
import { listRoles, type Role } from "../api/roles";

interface UserEditActions {
  editUser: (id: string, name: string, email: string) => Promise<boolean>;
  assignRoles: (id: string, roles: string[]) => Promise<boolean>;
  changePassword: (id: string, password: string) => Promise<boolean>;
  updateWhitelist: (id: string, whitelistOnly: boolean) => Promise<boolean>;
  revokeDevice: (id: string, deviceId: string) => Promise<boolean>;
  onUpdated?: (name: string) => void;
}

export function useUserEditForm(actions: UserEditActions) {
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [whitelistOnly, setWhitelistOnlyState] = useState(false);
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [busy, setBusy] = useState(false);
  const [catalogue, setCatalogue] = useState<Role[]>([]);

  useEffect(() => {
    let active = true;
    listRoles()
      .then((r) => { if (active) setCatalogue(r); })
      .catch(() => { if (active) setCatalogue([]); });
    return () => { active = false; };
  }, []);

  const startEdit = useCallback((user: AdminUser) => {
    setEditing(user);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRoles([...user.roles]);
    setWhitelistOnlyState(user.whitelist_only);
    setDevices([...user.devices]);
  }, []);

  const cancelEdit = useCallback(() => setEditing(null), []);

  const setWhitelistOnly = useCallback(
    async (on: boolean) => {
      if (!editing) return;
      const ok = await actions.updateWhitelist(editing.user_id, on);
      if (ok) setWhitelistOnlyState(on);
    },
    [editing, actions]
  );

  const revokeDevice = useCallback(
    async (deviceId: string) => {
      if (!editing) return;
      const ok = await actions.revokeDevice(editing.user_id, deviceId);
      if (ok) setDevices((current) => current.filter((device) => device.id !== deviceId));
    },
    [editing, actions]
  );

  const submitEdit = useCallback(async () => {
    if (!editing) return;
    setBusy(true);
    let ok = true;
    if (name !== editing.name || email !== editing.email) {
      ok = await actions.editUser(editing.user_id, name, email);
    }
    if (ok) {
      ok = await actions.assignRoles(editing.user_id, roles);
    }
    if (ok && password.trim() !== "") {
      ok = await actions.changePassword(editing.user_id, password);
    }
    setBusy(false);
    if (ok) {
      actions.onUpdated?.(name);
      setEditing(null);
    }
  }, [editing, name, email, password, roles, actions]);

  return {
    editing,
    form: { name, setName, email, setEmail, password, setPassword, roles, setRoles },
    whitelistOnly,
    devices,
    setWhitelistOnly,
    revokeDevice,
    catalogue,
    busy,
    startEdit,
    cancelEdit,
    submitEdit,
  };
}
