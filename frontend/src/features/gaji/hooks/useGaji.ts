import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";
import type { Gaji } from "../types";
import { getGajiData } from "../services/api";

export const useGaji = (
  perPage: number = 50,
  page: number = 1,
  search: string = "",
  fromDate: string = "",
  toDate: string = "",
  department: string = "",
  shift: string = "",
  korlap: string = "",
  jabatan: string = "",
) => {
  const [gaji, setGaji] = useState<Pagination<Gaji> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getGaji = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getGajiData(
        page,
        perPage,
        search,
        fromDate,
        toDate,
        department,
        shift,
        korlap,
        jabatan,
      );
      setGaji(res);
    } catch {
      setError("Gagal mengambil data gaji.");
    } finally {
      setLoading(false);
    }
  }, [perPage, page, search, fromDate, toDate, department, shift, korlap, jabatan]);

  useEffect(() => {
    void getGaji();
  }, [getGaji]);

  return {
    gaji,
    loading,
    error,
  };
};
