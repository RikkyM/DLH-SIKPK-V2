import { useCallback, useEffect, useState } from "react";
import type { Pagination } from "@/types/pagination.types";
import { getFingerData } from "../services/api";
import type { Kehadiran } from "@/types/kehadiran.types";

export const useFinger = (
  perPage: number = 50,
  page: number = 1,
  search: string = "",
  department: string = "",
  jabatan: string = "",
  shift: string = "",
  tanggal: string = "",
) => {
  const [kehadiran, setKehadiran] = useState<Pagination<Kehadiran> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKehadiran = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getFingerData(
        page,
        perPage,
        search,
        department,
        jabatan,
        shift,
        tanggal,
      );
      setKehadiran(data);
    } catch {
      setError("Gagal mengambil data kehadiran");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, department, jabatan, shift, tanggal]);

  useEffect(() => {
    void fetchKehadiran();
  }, [fetchKehadiran]);

  return {
    kehadiran,
    loading,
    error,
    refetch: fetchKehadiran,
  };
};
