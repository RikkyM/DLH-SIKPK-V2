import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";
import type { ShiftKerja } from "../types/types";
import { getShiftKerjaData } from "@/services/api/shiftKerjaService";

export const useShiftKerja = (perPage = 10, page = 1, search = "") => {
  const [shift, setShift] = useState<Pagination<ShiftKerja> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getShiftKerja = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getShiftKerjaData(page, perPage, search);
      setShift(res);
    } catch {
      setError("Gagal mengambil data shift kerja.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    void getShiftKerja();
  }, [getShiftKerja]);

  return {
    shift,
    loading,
    error,
  };
};
