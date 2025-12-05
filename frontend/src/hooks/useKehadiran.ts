import { getKehadiran } from "@/services/api/kehadiranService";
import type { Kehadiran } from "@/types/kehadiran.types";
import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";

export type KehadiranParams = {
  page: number;
  perPage: number;
  search: string;
  department: string;
  jabatan: string;
  shift: string;
  fromDate: string;
  toDate: string;
};

export const useKehadiran = (
  perPage = 50,
  page = 1,
  search = "",
  department = "",
  jabatan = "",
  shift = "",
  fromDate = "",
  toDate = "",
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

      const data = await getKehadiran(
        page,
        perPage,
        search,
        department,
        jabatan,
        shift,
        fromDate,
        toDate,
      );
      setKehadiran(data);
    } catch {
      setError("Gagal mengambil data kehadiran");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, department, jabatan, shift, fromDate, toDate]);

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

export const useKehadiranManual = () => {
  const [kehadiran, setKehadiran] = useState<Pagination<Kehadiran> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async ({
      page,
      perPage,
      search,
      department,
      jabatan,
      shift,
      fromDate,
      toDate,
    }: KehadiranParams) => {
      try {
        setLoading(true);
        setError(null);

        const data = await getKehadiran(
          page,
          perPage,
          search,
          department,
          jabatan,
          shift,
          fromDate,
          toDate,
        );

        setKehadiran(data);
      } catch {
        setError("Gagal mengambil data kehadiran");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    kehadiran,
    loading,
    error,
    refetch,
  };
};
