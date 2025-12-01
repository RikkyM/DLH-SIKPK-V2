import { useCallback, useEffect, useState } from "react";
import type { Finger } from "../types";
import type { Pagination } from "@/types/pagination.types";
import { getFingerData } from "../services/api";

export const useFinger = (
  perPage: number = 50,
  page: number = 1,
  search: string = "",
  department: string = "",
  jabatan: string = "",
  shift: string = "",
  tanggal: string = "",
) => {
  const [finger, setFinger] = useState<Pagination<Finger> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFinger = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getFingerData(
        page,
        perPage,
        search,
        department,
        jabatan,
        shift,
        tanggal,
      );
      setFinger(res);
    } catch {
      setError("Gagal mengambil data finger.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, department, jabatan, shift, tanggal]);

  useEffect(() => {
    void getFinger();
  }, [getFinger]);

  return {
    finger,
    loading,
    error,
  };
};
