import { useCallback, useEffect, useState } from "react";
import { getDashboardData } from "../services/api.services";

type Dashboard = {
  jumlah_pegawai: number;
  masuk_kerja: number;
  pulang_kerja: number;
  terlambat: number;
  pulang_cepat: number;
};

export const useDashboard = () => {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getDashboardData();
      setData(res);
    } catch {
      setError("Terjadi kesalahan menampilkan data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void getDashboard();
  }, [getDashboard]);

  return {
    data,
    loading,
    error,
  };
};
