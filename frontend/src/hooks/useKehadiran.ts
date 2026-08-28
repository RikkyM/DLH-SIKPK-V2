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
  korlap: string;
  fromDate: string;
  toDate: string;
  potongan: 'ada' | 'tidak ada' | string;
};

type Status = "mangkir" | "sesuai jam";
type StatusKerja = "status_masuk" | "status_pulang";

export type KehadiranData = {
  id: number;
  tanggal: string;
  jam_absen: string;
  jam_keluar: string;
  jam_masuk: string;
  jam_pulang: string;
  jam_telat: string;
  jam_pulang_cepat?: string;
  potongan_nominal?: number;
  upah_bersih: number;
  pegawai: Pegawai;
  keterangan: string;
} & Partial<Record<StatusKerja, Status>>;

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
      korlap,
      fromDate,
      toDate,
      potongan,
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
          korlap,
          fromDate,
          toDate,
          potongan
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
      korlap = '',
      fromDate = "",
      toDate = "",
    }: {
      name: string;
      search: string;
      department: string;
      jabatan: string;
      shift: string;
      tanggal?: string;
      korlap?: string;
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
          korlap,
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
