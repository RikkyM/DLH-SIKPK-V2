import { useCallback, useEffect, useState } from "react";
import type { UnitKerja } from "../types";
import { getUnitKerjaData } from "../services/api";
import type { Pagination } from "@/types/pagination.types";

export const useUnitKerja = (
  perPage: number = 25,
  page = 1,
  search: string = "",
) => {
  const [unit, setUnit] = useState<Pagination<UnitKerja> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUnitKerja = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUnitKerjaData(page, perPage, search);
      setUnit(res);
    } catch {
      setError("Gagal mengambil data unit kerja");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    void getUnitKerja();
  }, [getUnitKerja]);

  return {
    unit,
    loading,
    error,
  };
};
