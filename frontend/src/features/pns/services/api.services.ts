import { http } from "@/services/api/http";

export const getAsnData = async (
  page: number = 1,
  perPage: number = 10,
  search: string = "",
) => {
  const res = await http.get("/api/v1/pegawai-asn", {
    params: {
      per_page: perPage,
      page,
      search,
    },
  });

  return res.data;
};
