export interface Jabatan {
  id: number;
  nama: string;
  gaji: number | null;
  kpa: string;
  bp: string;
  bpp: string;
  pptk: string;
}

export type FormJabatanState = Omit<Jabatan, "id">;

export const initialData: FormJabatanState = {
  nama: "",
  gaji: null,
  kpa: "",
  bp: "",
  bpp: "",
  pptk: "",
};
