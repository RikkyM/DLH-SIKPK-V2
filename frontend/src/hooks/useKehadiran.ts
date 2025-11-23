import { getKehadiran } from "@/services/api/kehadiranService";
import type { Kehadiran } from "@/types/kehadiran.types";
import { useCallback, useEffect, useState } from "react";

export const useKehadiran = () => {
  const [kehadiran, setKehadiran] = useState<Kehadiran[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKehadiran = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getKehadiran();
      setKehadiran(data);
    } catch {
      setError("Gagal mengambil data kehadiran");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKehadiran();
  }, [fetchKehadiran]);

  return { kehadiran, loading, error, refetch: fetchKehadiran };
};
