import { http } from "@/services/http";
import type { Pagination } from "@/types";
import type { Pegawai } from "../types";

export const getPegawaiList = async (page = 1, perPage = 10, search = "") => {
  const res = await http.get<Pagination<Pegawai>>("/api/v1/pegawai", {
    params: { per_page: perPage, page: page, search: search || undefined },
  });
  return res.data;
};

export const syncPegawai = async () => {
  await http.post("/api/v1/sync-pegawai");
};
