import { http } from "./http";

export const getKehadiran = async (page = 1, perPage = 50, search = "", department = '', jabatan = '', shift = '', tanggal = '') => {
  const res = await http.get("/api/v1/kehadiran", {
    params: {
      per_page: perPage,
      page,
      search: search || undefined,
      department,
      jabatan,
      shift,
      tanggal
    },
  });
  return res.data;
};

export const syncKehadiran = async () => {
  await http.post("/api/v1/sync-kehadiran");
};
