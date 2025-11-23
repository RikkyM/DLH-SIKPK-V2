import { http } from "@/services/api/http";
import type { Pagination } from "@/types/pagination.types";
import type { JenisKendaraan } from "../types/types";

export const getJenisKendaraanList = async (
  page = 1,
  perPage = 10,
  search = "",
) => {
  const res = await http.get<Pagination<JenisKendaraan>>(
    "/api/v1/jenis-kendaraan",
    {
      params: {
        per_page: perPage,
        page,
        search: search || "",
      },
    },
  );
  return res.data;
};
