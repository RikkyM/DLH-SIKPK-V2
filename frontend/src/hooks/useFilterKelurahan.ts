import { http } from "@/services/api/http";
import { useCallback, useEffect, useState } from "react";

type KelurahanType = {
  kodeKelurahan: string;
  namaKelurahan: string;
  kodeKecamatan: string;
};

type KelurahanState = {
  data: KelurahanType[] | null;
  loading: boolean;
  error: string | null;
};

export const useFilterKelurahan = () => {
  const [state, setState] = useState<KelurahanState>({
    data: null,
    loading: false,
    error: null,
  });

  const getKelurahan = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const res = await http.get("/api/v1/kelurahan");

      setState((prev) => ({
        ...prev,
        data: res.data.data,
        loading: false,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal mendapatkan data kelurahan.",
      }));
    }
  }, []);

  useEffect(() => {
    void getKelurahan();
  }, [getKelurahan]);

  return {
    datas: state.data,
    loading: state.loading,
    error: state.error,
  };
};
