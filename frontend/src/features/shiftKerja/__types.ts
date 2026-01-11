export interface ShiftKerja {
  id: number;
  jadwal: string;
  jam_masuk: string;
  jam_keluar: string;
  telat: string[];
  pulang_cepat: string[];
}

export type FormShiftKerjaState = Omit<ShiftKerja, "id">;

export const initialData: FormShiftKerjaState = {
  jadwal: "",
  jam_masuk: "",
  jam_keluar: "",
  telat: ["", ""],
  pulang_cepat: ["", ""],
};
