import type { Pegawai } from "@/features/pegawai/types/pegawai.types";

export type CheckType = 0 | 1 | number | null;

export type Kehadiran = {
  id: number | null;
  old_id: number | null;
  pegawai_id: number | null;
  check_time: string;
  check_type: CheckType | null;
  pegawai: Pegawai | null;
  keterangan: string;
  tanggal?: string;
  jam?: string;
};
