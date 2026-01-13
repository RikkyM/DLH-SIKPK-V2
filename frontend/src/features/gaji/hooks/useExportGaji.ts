import { http } from "@/services/api/http";
import { useCallback, useState } from "react";

type State = {
  loading: boolean;
  error: string | null;
};

type Props = {
  search: string;
  department: string;
  jabatan: string;
  shift: string;
  korlap: string;
  fromDate: string;
  toDate: string;
};

export const useExportGaji = () => {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
  });

  const exportGaji = useCallback(
    async ({ search, department, jabatan, shift, korlap, fromDate, toDate }: Props) => {
      setState((prev) => ({ ...prev, loading: true }));

      try {
        const res = await http.get("/api/v1/export-gaji", {
          responseType: "blob",
          params: {
            search: search || undefined,
            department: department || undefined,
            jabatan: jabatan || undefined,
            shift: shift || undefined,
            korlap: korlap || undefined,
            from_date: fromDate,
            to_date: toDate,
          },
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;

        const contentDisposition = res.headers["content-disposition"];
        let fileName = `spj_upah_kerja-${new Date().toLocaleDateString("id-ID")}`;

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
      } catch {
        setState((prev) => ({
          ...prev,
          error: "Gagal untuk mengekspor data.",
        }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [],
  );

  return { exportGaji, loading: state.loading, error: state.error };
};
