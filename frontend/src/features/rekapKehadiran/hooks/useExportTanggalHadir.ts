// import { useCallback, useState } from "react";
import { exportTanggalHadirApi } from "../services/exportRekapTanggal.services";
import { useMutation } from "@tanstack/react-query";

// type State = {
//   loading: boolean;
//   error: string | null;
// };

type ExportParams = {
  search?: string;
  department?: string;
  jabatan?: string;
  korlap?: string;
  fromDate?: string;
  toDate?: string;
};

export const useExportTanggalHadir = () => {
  // const [state, setState] = useState<State>({
  //   loading: false,
  //   error: null,
  // });

  // const exportTanggalHadir = useCallback(
  //   async ({
  //     search = "",
  //     department = "",
  //     jabatan = "",
  //     korlap = "",
  //     fromDate = "",
  //     toDate = "",
  //   }: {
  //     search: string;
  //     department: string;
  //     jabatan: string;
  //     korlap: string;
  //     fromDate: string;
  //     toDate: string;
  //   }) => {
  //     setState((prev) => ({ ...prev, loading: true }));

  //     try {
  //       await exportTanggalHadirApi(
  //         search,
  //         department,
  //         jabatan,
  //         korlap,
  //         fromDate,
  //         toDate,
  //       );
  //       setState((prev) => ({
  //         ...prev,
  //         loading: false,
  //       }));
  //     } catch {
  //       setState({
  //         loading: false,
  //         error: "Terjadi kesalahan ketika export rekap tanggal hadir",
  //       });
  //     }
  //   },
  //   [],
  // );

  const {
    mutate,
    isPending: loading,
    error,
    // reset,
  } = useMutation({
    mutationFn: ({
      search = "",
      department = "",
      jabatan = "",
      korlap = "",
      fromDate = "",
      toDate = "",
    }: ExportParams) =>
      exportTanggalHadirApi(
        search,
        department,
        jabatan,
        korlap,
        fromDate,
        toDate,
      ),
    onError: () => {
      console.error("Terjadi kesalahan ketika export rekap tanggal hadir");
    },
  });

  return {
    loading,
    error,
    exportTanggalHadir: mutate,
  };
};
