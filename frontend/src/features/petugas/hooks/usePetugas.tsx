import type { Pegawai } from "@/features/pegawai/types/pegawai.types";
import { http } from "@/services/api/http";
import { useQuery } from "@tanstack/react-query";

type Status = "mangkir" | "sesuai jam";
type StatusKerja = 'status_kerja' | 'status_pulang';

export type DataTypes = {
  pegawai_id: number;
  tanggal: string;
  jam_masuk: string;
  jam_pulang: string;
  jam_telat: string;
  jam_pulang_cepat: string;
  potongan_nominal: number;
  upah_bersih: number;
  pegawai: Pegawai;
} & Partial<Record<StatusKerja, Status>>;

export const usePetugas = (params: {
  badgenumber: string | null;
  department?: string | null;
  penugasan?: string | null;
  from?: string | null;
  to?: string | null;
}) => {
  return useQuery<DataTypes[]>({
    queryKey: ["gaji-petugas", params],
    queryFn: async () => {
      const { data } = await http.get("/api/v1/gaji-petugas", {
        params: {
          badgenumber: params.badgenumber,
          department: params.department,
          penugasan: params.penugasan,
          from_date: params.from,
          to_date: params.to,
        },
      });

      return data.data;
    },
    enabled: !!params.from && !!params.to,
  });
};
