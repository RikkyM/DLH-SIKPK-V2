import { http } from "./http";

export const getJenisKendaraan = async () => {
  const res = await http.get("/api/v1/jenis-kendaraan");
  return res;
};

export const updateJenisKendaraan = async (
  id: number,
  payload: { nama: string },
) => {
  const res = await http.put(`/api/v1/jenis-kendaraan/${id}`, payload);
  return res.data;
};
