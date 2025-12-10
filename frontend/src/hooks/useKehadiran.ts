import type { Pegawai } from "@/features/pegawai/types/pegawai.types";
import {
  exportKehadiranData,
  exportKehadiranPerTanggalData,
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
      department = "",
      jabatan = "",
      shift = "",
      tanggal = "",
      fromDate = "",
      toDate = "",
    }: {
      name: string;
      search: string;
      department: string;
      jabatan: string;
      shift: string;
      tanggal?: string;
      fromDate?: string;
      toDate?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);
        await exportKehadiranData(
          name,
          search,
          department,
          jabatan,
          shift,
          tanggal,
          fromDate,
          toDate,
        );
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

export const useExportKehadiranPerTanggal = () => {
  type RequestState = {
    loading: boolean;
    error: string | null;
  };

  const [state, setState] = useState<RequestState>({
    loading: false,
    error: null,
  });

  const exportKehadiranPerTanggalExcel = useCallback(
    async ({
      search = "",
      department = "",
      jabatan = "",
      shift = "",
      korlap = "",
      tanggal = "",
    }: {
      search: string;
      department: string;
      jabatan: string;
      shift: string;
      korlap?: string;
      tanggal: string;
    }) => {
      setState({ loading: true, error: null });
      try {
        await exportKehadiranPerTanggalData(
          search,
          department,
          jabatan,
          shift,
          korlap,
          tanggal,
        );
        setState((prev) => ({ ...prev, loading: false }));
      } catch {
        setState({
          loading: false,
          error: "Gagal untuk mengekspor data.",
        });
      }
    },
    [],
  );

  return {
    loading: state.loading,
    error: state.error,
    fetch: exportKehadiranPerTanggalExcel,
  };
};
