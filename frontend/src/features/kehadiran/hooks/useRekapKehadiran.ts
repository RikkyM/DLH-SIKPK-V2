import type { Pegawai } from "@/features/pegawai/types/pegawai.types";
import { getRekapKehadiranData } from "@/services/api/kehadiranService";
import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";

export const useRekapKehadiran = (
  perPage = 50,
  page = 1,
  search = "",
  department = "",
  jabatan = "",
  shift = "",
  korlap = '',
  tanggal = "",
) => {
  const [rekap, setRekap] = useState<Pagination<Pegawai> | null>(null);
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
        korlap,
        tanggal,
      );
      setRekap(data);
    } catch {
      setError("Gagal mengambil data kehadiran");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, department, jabatan, shift, korlap, tanggal]);

  useEffect(() => {
    void getRekapKehadiran();
  }, [getRekapKehadiran]);

  return {
    rekap,
    loading,
    error,
  };
};
