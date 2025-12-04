import { getRekapKehadiranData } from "@/services/api/kehadiranService";
import type { Kehadiran } from "@/types/kehadiran.types";
import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";

export const useRekapKehadiran = (
  perPage = 50,
  page = 1,
  search = "",
  department = "",
  jabatan = "",
  shift = "",
  tanggal = "",
) => {
  const [rekap, setRekap] = useState<Pagination<Kehadiran> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRekapKehadiran = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getRekapKehadiranData(
        page,
        perPage,
        search,
        department,
        jabatan,
        shift,
        tanggal,
      );
      setRekap(data);
    } catch {
      setError("Gagal mengambil data kehadiran");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, department, jabatan, shift, tanggal]);

  useEffect(() => {
    void getRekapKehadiran();
  }, [getRekapKehadiran]);

  return {
    rekap,
    loading,
    error,
  };
};
