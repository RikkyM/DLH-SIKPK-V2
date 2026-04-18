import type { Kehadiran } from "@/types/kehadiran.types";
import type { ValidationErrors } from "@/types/error.types";

export const initialData: Omit<Kehadiran, "id"> = {
  old_id: null,
  pegawai_id: null,
  check_time: "",
  check_type: null,
  pegawai: null,
  keterangan: "",
  status_kerja: ""
};

type Pegawai = {
  nama: string;
  department: string;
  penugasan: string;
};

export type FormState = {
  data: Omit<Kehadiran, "id">;
  pegawai: Pegawai | null;
  kehadiran?: Kehadiran
  loading: boolean;
  errors: ValidationErrors;
};