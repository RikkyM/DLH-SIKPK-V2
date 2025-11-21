import type { Department } from "@/types/department.types";
import { http } from "./http";

type DepartmentResponse = {
  success: boolean;
  data: Department[];
};

export const getDepartments = async () => {
  const res = await http.get<DepartmentResponse>("/api/v1/departments");
  return res.data.data;
};
