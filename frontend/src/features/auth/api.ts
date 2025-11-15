import { http } from "@/services/http";
import type { User, LoginCredentials } from "./types";

export const getCsrfCookie = () => http.get("/sanctum/csrf-cookie");

export const login = async (payload: LoginCredentials) => {
  await getCsrfCookie();
  const res = await http.post<User>("/api/v1/login", payload);
  return res;
};

export const logout = async () => {
  await http.post("/api/v1/logout");
};
