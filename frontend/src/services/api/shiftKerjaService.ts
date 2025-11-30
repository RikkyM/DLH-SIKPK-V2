import { http } from "./http";

export const getShiftKerjaData = async (
  page = 1,
  perPage = 10,
  search = "",
) => {
  const res = await http.get("/api/v1/shift-kerja", {
    params: {
      per_page: perPage,
      page,
      search: search || "",
    },
  });
  return res.data;
};

export const getKategoriKerjaData = async () => {
  const res = await http.get("/api/v1/kategori-kerja");
  return res.data.data;
};
