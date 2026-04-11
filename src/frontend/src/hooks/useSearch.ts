import { useMemo, useState } from "react";

export function useSearch<T extends Record<string, unknown>>(
  data: T[],
  searchKeys: (keyof T)[],
) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const lower = query.toLowerCase();
    return data.filter((item) =>
      searchKeys.some((key) => {
        const val = item[key];
        if (typeof val === "string") return val.toLowerCase().includes(lower);
        if (typeof val === "number") return String(val).includes(lower);
        return false;
      }),
    );
  }, [data, query, searchKeys]);

  return {
    query,
    setQuery,
    filtered,
    total: data.length,
    count: filtered.length,
  };
}
