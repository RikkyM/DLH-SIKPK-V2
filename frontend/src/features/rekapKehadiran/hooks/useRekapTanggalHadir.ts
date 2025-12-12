import type { Pegawai } from "@/features/pegawai/types/pegawai.types";
import { http } from "@/services/api/http";
import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";

type RekapTanggalProps = {
  perPage: number;
  page: number;
  search: string;
  department: string;
  jabatan: string;
  korlap: string;
  fromDate?: string;
  toDate?: string;
};

export const useRekapTanggalHadir = ({
  perPage,
  page,
  search,
  department,
  jabatan,
  korlap,
  fromDate,
  toDate,
}: RekapTanggalProps) => {
  const [state, setState] = useState<{
    data: Pagination<Pegawai> | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const getRekapTanggal = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
    }));
    try {
      const res = await http.get("/api/v1/rekap-tanggal-hadir", {
        params: {
          per_page: perPage,
          page,
          search,
          department,
          jabatan,
          korlap,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        },
      });

      setState((prev) => ({
        ...prev,
        data: res.data,
        loading: false
      }))

      console.log(res);
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal mengambil data rekap tanggal hadir",
      }));
    }
  }, [perPage, page, search, department, jabatan, fromDate, korlap, toDate]);

  useEffect(() => {
    void getRekapTanggal();
  }, [getRekapTanggal]);

  return {
    datas: state.data,
    loading: state.loading,
    error: state.error,
  };
};
