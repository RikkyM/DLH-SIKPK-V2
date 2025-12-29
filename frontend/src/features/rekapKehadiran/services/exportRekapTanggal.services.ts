import { http } from "@/services/api/http";

export const exportTanggalHadirApi = async (
  search?: string,
  department?: string,
  jabatan?: string,
  shift?: string,
  korlap?: string,
) => {
  const res = await http.get("/api/v1/export-kehadiran-per-tanggal", {
    responseType: "blob",
    params: {
      search,
      department,
      jabatan,
      shift,
      korlap,
    },
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;

  const disposition = res.headers['content-disposition'];
  let fileName = 'rekap-tanggal-hadir.xlsx';

  if (disposition) {
    const fileNameMatch = disposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
    );
    if (fileNameMatch && fileNameMatch[1]) {
      fileName = fileNameMatch[1].replace(/['"]/g, "");
      // Decode if filename is encoded
      fileName = decodeURIComponent(fileName);
    }
  }

  link.setAttribute('download', fileName);

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url)
};
