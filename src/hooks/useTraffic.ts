import { useEffect, useState } from "react";
import { getTraffic, type TrafficPeriod, type TrafficResponse } from "../api/admin";

export function useTraffic(period: TrafficPeriod) {
  const [data, setData] = useState<TrafficResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getTraffic(period)
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period]);

  return { data, loading, error };
}
