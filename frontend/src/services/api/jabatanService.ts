import { http } from "./http";
import type { Jabatan } from "@/features/jabatan/types/types";
import type { Pagination } from "@/types/pagination.types";

export const getJabatanData = async (page = 1, perPage = 10, search = "") => {
  const res = await http.get<Pagination<Jabatan>>("/api/v1/jabatan", {
    params: {
      per_page: perPage,
      page,
      search: search || "",
    },
  });

  return res.data;
};

export const getPenugasanData = async () => {
  const res = await http.get("/api/v1/penugasan");
  return res.data.data;
};
