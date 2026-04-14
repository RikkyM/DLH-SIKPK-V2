import { http } from "@/services/api/http";
import { useQuery } from "@tanstack/react-query";
// import { useCallback, useEffect, useState } from "react";

type KecamatanType = {
  kodeKecamatan: string;
  namaKecamatan: string;
};

// type KecamatanState = {
//   data: KecamatanType[] | null;
//   loading: boolean;
//   error: string | null;
// };

export const useFilterKecamatan = () => {
  // const [state, setState] = useState<KecamatanState>({
  //   data: null,
  //   loading: false,
  //   error: null,
  // });

  // const getKecamatan = useCallback(async () => {
  //   setState((prev) => ({
  //     ...prev,
  //     loading: true,
  //   }));
  //   try {
  //     const res = await http.get("/api/v1/kecamatan");

  //     setState((prev) => ({
  //       ...prev,
  //       data: res.data.data,
  //       loading: false,
  //     }));
  //   } catch {
  //     setState((prev) => ({
  //       ...prev,
  //       loading: false,
  //       error: "Gagal mendapatkan data kecamatan.",
  //     }));
  //   }
  // }, []);

  // useEffect(() => {
  //   void getKecamatan();
  // }, [getKecamatan]);

  const {
    data,
    isLoading: loading,
    error,
  } = useQuery<KecamatanType[]>({
    queryKey: ["kecamatan"],
    queryFn: async () => {
      const { data } = await http.get("/api/v1/kecamatan");
      return data.data;
    },
  });

  return {
    datas: data,
    loading,
    error,
  };
};
