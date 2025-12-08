import { http } from "@/services/api/http";
import type { Pagination } from "@/types/pagination.types";
import type { Pegawai, PegawaiForm } from "../types/pegawai.types";

export const getPegawaiList = async (
  page = 1,
  perPage = 50,
  search = "",
  department?: string,
  jabatan?: string,
  shift?: string,
) => {
  const res = await http.get<Pagination<Pegawai>>("/api/v1/pegawai", {
    params: {
      per_page: perPage,
      page: page,
      search: search || undefined,
      department: department || undefined,
      jabatan: jabatan || undefined,
      shift: shift || undefined,
    },
  });
  return res.data;
};

export const syncPegawai = async () => {
  await http.post("/api/v1/sync-pegawai");
};

export const updatePegawai = async (id: number, payload: PegawaiForm) => {
  const res = await http.put<Pegawai>(`/api/v1/pegawai/${id}`, payload);
  return res.data;
};

export const exportPegawaiExcelApi = async (
  search?: string,
  department?: string,
  jabatan?: string,
  shift?: string,
  korlap?: string,
) => {
  const res = await http.get("/api/v1/export-pegawai", {
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
  const link = document.createElement("a");
  link.href = url;

  const disposition = res.headers["content-disposition"];
  let fileName = "Pegawai.xlsx";

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

  link.setAttribute("download", fileName);

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
