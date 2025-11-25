import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";
import type { Jabatan } from "../types/types";
import { getJabatanData } from "@/services/api/jabatanService";

export const useJabatan = (perPage = 10, page = 1, search = "") => {
  const [jabatan, setJabatan] = useState<Pagination<Jabatan> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getJabatan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getJabatanData(page, perPage, search);
      setJabatan(res);
    } catch {
      setError("Gagal mengambil data jabatan.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    void getJabatan();
  }, [getJabatan]);

  return {
    jabatan,
    loading,
    error,
  };
};
