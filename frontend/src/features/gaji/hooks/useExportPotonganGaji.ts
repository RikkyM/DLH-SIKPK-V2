import { http } from "@/services/api/http";
import { useMutation } from "@tanstack/react-query";

type Props = {
  search: string;
  department: string;
  jabatan: string;
  shift: string;
  korlap: string;
  fromDate: string;
  toDate: string;
  tanggal_spj: string;
};

export const useExportPotonganGaji = () => {
  return useMutation({
    mutationFn: async ({
      search,
      department,
      jabatan,
      shift,
      korlap,
      fromDate,
      toDate,
      tanggal_spj,
    }: Partial<Props>) => {
      try {
        const res = await http.get("/api/v1/export-potongan-gaji", {
          responseType: "blob",
          params: {
            search: search || undefined,
            department: department || undefined,
            jabatan: jabatan || undefined,
            shift: shift || undefined,
            korlap: korlap || undefined,
            from_date: fromDate,
            to_date: toDate,
            tanggal_spj,
          },
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;

        const contentDisposition = res.headers["content-disposition"];
        let fileName = `spj_potongan_kerja-${new Date().toLocaleDateString("id-ID")}`;

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
        console.error("Gagal mengekspor data.");
      }
    },
  });
};
