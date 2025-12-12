import { useCallback, useEffect, useState } from "react";
import type { PegawaiAsn } from "../types";
import { http } from "@/services/api/http";

type FilterAsnState = {
  data: PegawaiAsn[] | null;
  loading: boolean;
  error: string | null;
};

export const useFilterAsn = () => {
  const [state, setState] = useState<FilterAsnState>({
    data: null,
    loading: false,
    error: null,
  });

  const filterAsn = useCallback(async (search = "") => {
    setState((prev) => ({
      ...prev,
      loading: true,
    }));
    try {
      const res = await http.get("/api/v1/korlap", {
        params: {
          search,
        },
      });

      setState((prev) => ({
        ...prev,
        data: res.data,
        loading: false,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal mengambil data korlap",
      }));
    }
  }, []);

  useEffect(() => {
    void filterAsn()
  }, [filterAsn])

  return {
    datas: state.data,
    loading: state.loading,
    error: state.loading,
    filterAsn,
  };
};
