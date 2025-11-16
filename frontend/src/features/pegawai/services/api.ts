import { http } from "@/services/http";
import type { Pagination } from "@/types";
import type { Pegawai } from "../types";

export const getPegawaiList = async (page = 1, perPage = 10) => {
  const res = await http.get<Pagination<Pegawai>>("/api/v1/pegawai", {
    params: { per_page: perPage, page: page },
  });
  return res.data;
};

export const syncPegawai = async () => {
  await http.post("/api/v1/sync-pegawai");
};
