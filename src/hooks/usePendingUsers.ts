import { useEffect, useState } from "react";
import { useTranslation } from "@custhome/ui";
import { listPendingUsers } from "../api/admin";

export function usePendingUsers() {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listPendingUsers()
      .then((res) => {
        if (!active) return;
        setCount(res.total);
        setError(null);
      })
      .catch(() => {
        if (active) setError(t("admin.dashboard.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  return { count, loading, error };
}
