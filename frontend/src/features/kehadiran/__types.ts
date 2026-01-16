import type { Kehadiran } from "@/types/kehadiran.types";

export const initialData: Omit<Kehadiran, "id"> = {
  old_id: null,
  pegawai_id: null,
  check_time: "",
  check_type: null,
  pegawai: null,
  keterangan: "",
};
