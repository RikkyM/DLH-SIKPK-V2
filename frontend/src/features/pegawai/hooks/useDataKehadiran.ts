import { http } from "@/services/api/http";
import type { Kehadiran } from "@/types/kehadiran.types";
import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";

type State = {
  data: Pagination<Kehadiran> | null;
  loading: boolean;
  error: string | null;
};

export const useDataKehadiran = (
  perPage: number = 50,
  page: number = 1,
  search: string = "",
  fromDate: string = "",
  toDate: string = "",
  department: number | null,
  shift: number | null,
  korlap: number | null,
  jabatan: number | null,
) => {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
  });

  const getData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const res = await http.get<Pagination<Kehadiran>>(
        "/api/v1/data-kehadiran",
        {
          params: {
            per_page: perPage,
            page: page || undefined,
            search: search || undefined,
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
            department: department || undefined,
            shift: shift || undefined,
            korlap: korlap || undefined,
            jabatan: jabatan || undefined,
          },
        },
      );
      setState((prev) => ({ ...prev, data: res.data, loading: false }));
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal mengambil data kehadiran.",
      }));
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
  ]);

  useEffect(() => {
    void getData();
  }, [getData]);

  return {
    dataKehadiran: state.data,
    loading: state.loading,
    error: state.error,
  };
};
