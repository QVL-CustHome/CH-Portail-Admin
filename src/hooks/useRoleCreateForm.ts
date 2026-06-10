import { useCallback, useState } from "react";
import type { CreateRoleInput } from "../api/roles";

export function useRoleCreateForm(create: (input: CreateRoleInput) => Promise<boolean>) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = useCallback(async () => {
    setBusy(true);
    const ok = await create({ name });
    setBusy(false);
    if (ok) setName("");
  }, [name, create]);

  return { name, setName, busy, submit };
}
