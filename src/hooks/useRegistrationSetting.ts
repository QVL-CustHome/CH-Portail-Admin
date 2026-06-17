import { useCallback, useEffect, useState } from "react";
import { getRegistrationSetting, setRegistrationSetting } from "../api/admin";

export function useRegistrationSetting() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getRegistrationSetting()
      .then((res) => {
        if (active) setEnabled(res.enabled);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggle = useCallback(async (next: boolean): Promise<boolean> => {
    setSaving(true);
    const previous = next;
    try {
      const res = await setRegistrationSetting(next);
      setEnabled(res.enabled);
      return true;
    } catch {
      setEnabled(!previous);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { enabled, loading, saving, toggle };
}
