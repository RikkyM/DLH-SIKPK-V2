export type CheckType = 0 | 1 | number;

export interface Kehadiran {
  id: number;
  old_id: number;
  pegawai_id: number;
  check_time: string;
  check_type: CheckType;
}
