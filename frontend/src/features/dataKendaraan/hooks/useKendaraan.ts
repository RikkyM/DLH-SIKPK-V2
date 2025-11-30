import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";
import type { Kendaraan } from "../types";
import { getKendaraanData } from "../services/api";

export const useKendaraan = (
  perPage = 50,
  page = 1,
  search = "",
  department = "",
  jenis_kendaraan = "",
) => {
  const [kendaraan, setKendaraan] = useState<Pagination<Kendaraan> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getKendaraan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getKendaraanData(
        page,
        perPage,
        search,
        department,
        jenis_kendaraan,
      );
      setKendaraan(res);
    } catch {
      setError("Gagal mengambil data kendaraan.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, department, jenis_kendaraan]);

  useEffect(() => {
    void getKendaraan();
  }, [getKendaraan]);

  return {
    kendaraan,
    loading,
    error,
  };
};
