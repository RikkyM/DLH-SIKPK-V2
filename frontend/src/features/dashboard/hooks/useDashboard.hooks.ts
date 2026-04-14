import { useAuth } from "@/features/auth";
import { getDashboardData } from "../services/api.services";
import { useQuery } from "@tanstack/react-query";

type Dashboard = {
  jumlah_pegawai: number;
  masuk_kerja: number;
  pulang_kerja: number;
  terlambat: number;
  pulang_cepat: number;
  tidakFingerMasuk: number;
  tidakFingerPulang: number;
  headers: string[];
  data_table: {
    id: number;
    nama: string;
    total: number;
    [key: string]: number | string;
  }[];
};

export const useDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useQuery<Dashboard | null>({
    queryKey: ["dashboard", user?.id],
    queryFn: () => getDashboardData(),
  });

  return {
    data,
    loading: isLoading,
    error,
    refetch,
  };
};
