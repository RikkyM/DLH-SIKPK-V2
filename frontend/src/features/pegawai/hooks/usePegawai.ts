import { useCallback, useEffect, useState } from "react";
import type { Pegawai } from "../types";
import { getPegawaiList } from "../services/api";

export const usePegawai = (perPage = 10) => {
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPegawai = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const data = await getPegawaiList(perPage);
      setPegawai(data);
    } catch {
      setError("Gagal mengambil data pegawai.");
    } finally {
      setLoading(false);
    }
  }, [perPage]);

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
