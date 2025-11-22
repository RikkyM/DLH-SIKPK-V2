import { useCallback, useEffect, useState } from "react";
import { getPegawaiList } from "../services/api";
import type { Pagination } from "@/types/pagination.types";
import type { Pegawai } from "../types";

export const usePegawai = (perPage = 10, page = 1, search = "", department = '') => {
  const [pegawai, setPegawai] = useState<Pagination<Pegawai> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPegawai = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        setError(null);
        const res = await getPegawaiList(page, perPage, search, department);
        setPegawai(res);
      } catch {
        setError("Gagal mengambil data pegawai.");
      } finally {
        setLoading(false);
      }
    },
    [page, perPage, search, department]
  );

  useEffect(() => {
    void getPegawai(true);
  }, [getPegawai]);

  const refetch = useCallback(() => getPegawai(false), [getPegawai]);

  return {
    pegawai,
    loading,
    error,
    refetch,
  };
};
