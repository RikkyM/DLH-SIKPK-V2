import { getDepartments } from "@/services/api/departmentService";
import type { Department } from "@/types/department.types";
import { useCallback, useEffect, useState } from "react";

type DepartmentState = {
  data: Department[];
  loading: boolean;
  error: string | null;
};

export const useDepartment = (opts?: { enabled?: boolean }) => {
  const enabled = opts?.enabled ?? true;

  const [state, setState] = useState<DepartmentState>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchDepartments = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const data = await getDepartments();
      setState({
        data: data,
        loading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal mengambil data department",
      }));
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    fetchDepartments();
  }, [enabled, fetchDepartments]);

  return {
    departments: state.data,
    loading: state.loading,
    error: state.loading,
    refetch: fetchDepartments,
  };
};
