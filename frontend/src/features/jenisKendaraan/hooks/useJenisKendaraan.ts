import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";
import type { JenisKendaraan } from "../types/types";
import { getJenisKendaraanList } from "../service/api";

export const useJenisKendaraan = (perPage = 10, page = 1, search = "") => {
  const [jenis, setJenis] = useState<Pagination<JenisKendaraan> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getJenisKendaraan = useCallback(async () => {
    try {
        setLoading(true);
      setError(null);
      const res = await getJenisKendaraanList(page, perPage, search);
      setJenis(res);
    } catch {
      setError("Gagal mengambil data jenis kendaraan.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    void getJenisKendaraan();
  }, [getJenisKendaraan]);

  return {
    jenis,
    loading,
    error,
  };
};
