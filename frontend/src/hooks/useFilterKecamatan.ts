import { http } from "@/services/api/http";
import { useCallback, useEffect, useState } from "react";

type KecamatanType = {
  kodeKecamatan: string;
  namaKecamatan: string;
};

type KecamatanState = {
  data: KecamatanType[] | null;
  loading: boolean;
  error: string | null;
};

export const useFilterKecamatan = () => {
  const [state, setState] = useState<KecamatanState>({
    data: null,
    loading: false,
    error: null,
  });

  const getKecamatan = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
    }));
    try {
      const res = await http.get("/api/v1/kecamatan");

      setState((prev) => ({
        ...prev,
        data: res.data.data,
        loading: false,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal mendapatkan data kecamatan.",
      }));
    }
  }, []);

  useEffect(() => {
    void getKecamatan();
  }, [getKecamatan]);

  return {
    datas: state.data,
    loading: state.loading,
    error: state.error,
  };
};
