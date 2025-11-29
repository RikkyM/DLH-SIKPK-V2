import { http } from "@/services/api/http";
import type { Gaji } from "../types";
import type { Pagination } from "@/types/pagination.types";

export const getGajiData = async (page = 1, perPage = 50, search = "", fromDate = "", toDate = "", department = "") => {
  const res = await http.get<Pagination<Gaji>>("/api/v1/gaji", {
    params: {
      per_page: perPage,
      page,
      search: search || undefined,
      from_date: fromDate,
      to_date: toDate,
      department
    },
  });

  return res.data;
};
