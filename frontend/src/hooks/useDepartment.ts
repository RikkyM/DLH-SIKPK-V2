import { getDepartments } from "@/services/api/departmentService";
import type { Department } from "@/types/department.types";
import { useCallback, useEffect, useState } from "react";

export const useDepartment = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getDepartments();
      setDepartments(data);
    } catch {
      setError("Gagal mengambil data department");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return { departments, loading, error, refetch: fetchDepartments };
};
