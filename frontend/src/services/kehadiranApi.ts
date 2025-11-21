import { http } from "./http";

export const getKehadiran = async () => {
  const res = await http.get("/api/v1/kehadiran");
  return res.data;
};

export const syncKehadiran = async () => {
  await http.post("/api/v1/sync-kehadiran");
};
