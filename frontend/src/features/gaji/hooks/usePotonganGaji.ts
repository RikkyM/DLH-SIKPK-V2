import type { Pagination } from "@/types/pagination.types";
import type { Gaji } from "../types";
import { useCallback, useEffect, useState } from "react";
import { http } from "@/services/api/http";

type State = {
  data:
    | (Pagination<Gaji & { upah_bersih: number | null; upah_kotor: number | null; jumlah_telat?: string; jumlah_pulcet?: string; jumlah_mangkir?: string; }> & {
        total_upah_bersih?: number | null;
        total_gaji_harian?: number | null;
        total_potongan?: number | null;
      })
    | null;
  loading: boolean;
  error: string | null;
};

export const usePotonganGaji = (
  perPage: number = 50,
  page: number = 1,
  search: string = "",
  fromDate: string = "",
  toDate: string = "",
  department: string = "",
  shift: string = "",
  korlap: string = "",
  jabatan: string = "",
  potongan: "ada" | "tidak ada" | string = "",
) => {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
  });

  const getPotongan = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const res = await http.get<Pagination<
        Gaji & { upah_bersih: number | null; upah_kotor: number | null }
      > | null>("/api/v1/potongan-gaji", {
        params: {
          per_page: perPage,
          page,
          search: search || undefined,
          from_date: fromDate,
          to_date: toDate,
          department,
          shift,
          korlap,
          jabatan,
          potongan,
        },
      });
      setState((prev) => ({ ...prev, data: res.data }));
    } catch {
      setState((prev) => ({
        ...prev,
        error: "Gagal mengambil data potongan gaji.",
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [
    perPage,
    page,
    search,
    fromDate,
    toDate,
    department,
    shift,
    korlap,
    jabatan,
    potongan,
  ]);

  useEffect(() => {
    void getPotongan();
  }, [getPotongan]);

  return {
    gaji: state.data,
    loading: state.loading,
    error: state.error,
    refetch: getPotongan,
  };
};
