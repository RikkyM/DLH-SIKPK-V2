type ROLE = "KABID" | "KATIM" | "KUPTD" | "KASUBBAG" | string;

type PegawaiBase = {
  id_department: number;
  nip: string;
  nama: string;
  pangkat: string;
  golongan: string;
  jabatan: string;
  role: ROLE;
};

export type PegawaiAsn = PegawaiBase & {
  id: number;
  unit_kerja: string;
};

export type FormState = Omit<PegawaiBase, "id_department"> & {
  id_department?: number | null;
};

export const initialState: FormState = {
  id_department: null,
  nip: "",
  nama: "",
  pangkat: "",
  golongan: "",
  jabatan: "",
  role: "",
};
