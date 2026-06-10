import { useCallback, useState } from "react";

export function useConfirmDelete<T>(onConfirm: (item: T) => Promise<void>) {
  const [target, setTarget] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);

  const request = useCallback((item: T) => setTarget(item), []);
  const cancel = useCallback(() => setTarget(null), []);

  const confirm = useCallback(async () => {
    if (!target) return;
    setBusy(true);
    await onConfirm(target);
    setBusy(false);
    setTarget(null);
  }, [target, onConfirm]);

  return { target, busy, request, confirm, cancel };
}
