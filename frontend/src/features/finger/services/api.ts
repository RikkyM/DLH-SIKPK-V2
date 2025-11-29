import { http } from "@/services/api/http";
import type { Pagination } from "@/types/pagination.types";
import type { Finger } from "../types";

export const getFingerData = async (
  page = 1,
  perPage = 50,
  search = "",
  department = "",
  tanggal = "",
) => {
  const res = await http.get<Pagination<Finger>>("/api/v1/finger", {
    params: {
      per_page: perPage,
      page,
      search: search || undefined,
      department,
      tanggal,
    },
  });

  return res.data;
};
