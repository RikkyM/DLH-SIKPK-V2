import { useCallback, useState } from "react";
import { exportTanggalHadirApi } from "../services/exportRekapTanggal.services";

type State = {
  loading: boolean;
  error: string | null;
};

export const useExportTanggalHadir = () => {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
  });

  const exportTanggalHadir = useCallback(
    async ({
      search = "",
      department = "",
      jabatan = "",
      shift = "",
      korlap = "",
    }: {
      search: string;
      department: string;
      jabatan: string;
      shift: string;
      korlap: string;
    }) => {
      setState((prev) => ({ ...prev, loading: true }));

      try {
        await exportTanggalHadirApi(search, department, jabatan, shift, korlap);
        setState((prev) => ({
          ...prev,
          loading: false,
        }));
      } catch {
        setState({
          loading: false,
          error: "Terjadi kesalahan ketika export rekap tanggal hadir",
        });
      }
    },
    [],
  );

  return {
    loading: state.loading,
    error: state.error,
    exportTanggalHadir,
  };
};
