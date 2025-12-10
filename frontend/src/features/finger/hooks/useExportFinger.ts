import { http } from "@/services/api/http";
import { useCallback, useState } from "react";

type ExportFingerState = {
  loading: boolean;
  error: string | null;
};

export const useExportFinger = () => {
  const [state, setState] = useState<ExportFingerState>({
    loading: false,
    error: null,
  });

  const exportFingerExcel = useCallback(
    async (
      {
        search,
        department,
        jabatan,
        shift,
        tanggal,
      }: {
        search: string;
        department: string;
        jabatan: string;
        shift: string;
        tanggal: string;
      },
      //   korlap?: string,
    ) => {
      setState({
        loading: true,
        error: null,
      });
      try {
        const res = await http.get("/api/v1/export-finger", {
          responseType: "blob",
          params: {
            search,
            department,
            jabatan,
            shift,
            tanggal,
          },
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;

        const contentDisposition = res.headers["content-disposition"];
        let fileName = `Log_Kehadiran-${new Date().toLocaleDateString("id-ID")}`;

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?(.+)"?/);
          if (match && match[1]) {
            fileName = match[1];
          }
        }

        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setState((prev) => ({ ...prev, loading: false }));
      } catch {
        setState({ loading: false, error: "Gagal untuk mengekspor data." });
      }
    },
    [],
  );

  return { exportFingerExcel, loading: state.loading, error: state.error };
};
