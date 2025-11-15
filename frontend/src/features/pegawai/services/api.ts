import { http } from "@/services/http";
import type { Pegawai, PegawaiResponse } from "../types";

export const getPegawaiList = async (perPage = 10) => {
  const res = await http.get<PegawaiResponse<Pegawai>>("/api/v1/pegawai", {
    params: { per_page: perPage },
  });
  return res.data.data.data;
};

export const syncPegawai = async () => {
  await http.post("/api/v1/sync-pegawai");
};
