import { useCallback, useEffect, useState } from "react";
import type { AdminUser } from "../api/admin";
import { listRoles, type Role } from "../api/roles";

interface UserEditActions {
  editUser: (id: string, name: string, email: string) => Promise<boolean>;
  assignRoles: (id: string, roles: string[]) => Promise<boolean>;
  changePassword: (id: string, password: string) => Promise<boolean>;
  updateWhitelist: (id: string, whitelistOnly: boolean, allowedIps: string[]) => Promise<boolean>;
  onUpdated?: (name: string) => void;
}

export function useUserEditForm(actions: UserEditActions) {
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [whitelistOnly, setWhitelistOnlyState] = useState(false);
  const [allowedIps, setAllowedIps] = useState<string[]>([]);
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
    setAllowedIps([...user.allowed_ips]);
  }, []);

  const cancelEdit = useCallback(() => setEditing(null), []);

  const setWhitelistOnly = useCallback(
    async (on: boolean) => {
      if (!editing) return;
      const ok = await actions.updateWhitelist(editing.user_id, on, allowedIps);
      if (ok) setWhitelistOnlyState(on);
    },
    [editing, allowedIps, actions]
  );

  const removeIp = useCallback(
    async (ip: string) => {
      if (!editing) return;
      const next = allowedIps.filter((entry) => entry !== ip);
      const ok = await actions.updateWhitelist(editing.user_id, whitelistOnly, next);
      if (ok) setAllowedIps(next);
    },
    [editing, allowedIps, whitelistOnly, actions]
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
    allowedIps,
    setWhitelistOnly,
    removeIp,
    catalogue,
    busy,
    startEdit,
    cancelEdit,
    submitEdit,
  };
}
