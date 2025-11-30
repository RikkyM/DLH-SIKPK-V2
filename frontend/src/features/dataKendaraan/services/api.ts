import { http } from "@/services/api/http";
import type { Pagination } from "@/types/pagination.types";
import type { Kendaraan } from "../types";

export const getKendaraanData = async (
  page = 1,
  perPage = 50,
  search = "",
  department?: string,
  jenis_kendaraan?: string,
) => {
  const res = await http.get<Pagination<Kendaraan>>("/api/v1/kendaraan", {
    params: {
      per_page: perPage,
      page,
      search: search || undefined,
      department: department || undefined,
      jenis_kendaraan: jenis_kendaraan || undefined,
    },
  });

  return res.data;
};
