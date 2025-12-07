import type { Pegawai } from "@/features/pegawai/types";
import {
  exportKehadiranData,
  getKehadiran,
} from "@/services/api/kehadiranService";
import type { Pagination } from "@/types/pagination.types";
import { useCallback, useState } from "react";

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

export type KehadiranData = {
  id: number;
  tanggal: string;
  jam_masuk: string;
  jam_pulang: string;
  pegawai: Pegawai;
};

export const useKehadiranManual = () => {
  const [kehadiran, setKehadiran] = useState<Pagination<KehadiranData> | null>(
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

export const useExportKehadiran = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportKehadiranExcel = useCallback(
    async ({
      name = "",
      search = "",
      fromDate = "",
      toDate = "",
    }: {
      name: string;
      search: string;
      fromDate: string;
      toDate: string;
    }) => {
      try {
        setLoading(true);
        setError(null);
        await exportKehadiranData(name, search, fromDate, toDate);
      } catch {
        setError("Gagal untuk mengekspor data.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    fetch: exportKehadiranExcel,
    loading,
    error,
  };
};
