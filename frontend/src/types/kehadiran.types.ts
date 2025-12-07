import type { Pegawai } from "@/features/pegawai/types/pegawai.types";

export type CheckType = 0 | 1 | number;

export type Kehadiran = {
  id: number;
  old_id: number;
  pegawai_id: number;
  check_time: string;
  check_type: CheckType;
  pegawai: Pegawai;
  keterangan: string;
};
