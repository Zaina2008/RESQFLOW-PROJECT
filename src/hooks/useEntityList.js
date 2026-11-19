import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Loads one page of an entity. The query/options are stringified so the effect
 * re-runs only when the filter actually changes.
 */
export function useEntityList(entity, query = {}, options = { sort: "-created_date", limit: 100 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const key = JSON.stringify([query, options]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.entities[entity].filter(query, options);
      setItems(Array.isArray(response) ? response : response?.items ?? []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [entity, key]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, error, reload };
}
