import { http } from "@/services/api/http";
import type { Pagination } from "@/types/pagination.types";
import type { Pegawai, PegawaiForm } from "../types/pegawai.types";

export const getPegawaiList = async (
  page = 1,
  perPage = 50,
  search = "",
  department?: string,
  jabatan?: string,
  shift?: string
) => {
  const res = await http.get<Pagination<Pegawai>>("/api/v1/pegawai", {
    params: {
      per_page: perPage,
      page: page,
      search: search || undefined,
      department: department || undefined,
      jabatan: jabatan || undefined,
      shift: shift || undefined
    },
  });
  return res.data;
};

export const syncPegawai = async () => {
  await http.post("/api/v1/sync-pegawai");
};

export const updatePegawai = async (id: number, payload: PegawaiForm) => {
  const res = await http.put<Pegawai>(`/api/v1/pegawai/${id}`, payload);
  return res.data
}
