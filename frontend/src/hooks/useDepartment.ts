import { getDepartments } from "@/services/api/departmentService";
import type { Department } from "@/types/department.types";
import { useCallback, useEffect, useState } from "react";

type DepartmentState = {
  data: Department[];
  loading: boolean;
  error: string | null;
};

export const useDepartment = () => {
  // const [departments, setDepartments] = useState<Department[]>([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<DepartmentState>({
    data: [],
    loading: false,
    error: null,
  });

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await getDepartments();
      setState({
        data: data,
        loading: true,
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
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments: state.data,
    loading: state.loading,
    error: state.loading,
    refetch: fetchDepartments,
  };
};
