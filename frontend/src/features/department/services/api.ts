import { http } from "@/services/api/http";
import type { Pagination } from "@/types/pagination.types";
import type { UnitKerja } from "../types";

export const getUnitKerjaData = async (
  page: number = 1,
  perPage: number = 25,
  search: string = "",
) => {
  const res = await http.get<Pagination<UnitKerja>>("/api/v1/unit-kerja", {
    params: {
      per_page: perPage,
      page,
      search: search || undefined,
    },
  });
  return res.data;
};
