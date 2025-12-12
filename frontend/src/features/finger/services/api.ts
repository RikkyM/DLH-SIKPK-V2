import { http } from "@/services/api/http";
import type { Pagination } from "@/types/pagination.types";
import type { Kehadiran } from "@/types/kehadiran.types";

export const getFingerData = async (
  page = 1,
  perPage = 50,
  search = "",
  department = "",
  jabatan = '',
  shift = '',
  korlap?: string,
  tanggal = "",
) => {
  const res = await http.get<Pagination<Kehadiran>>("/api/v1/check-type", {
    params: {
      per_page: perPage,
      page,
      search: search || undefined,
      department,
      jabatan,
      shift,
      korlap,
      tanggal,
    },
  });

  return res.data;
};
