export interface Jabatan {
  id: number;
  kpa_id: number | null;
  bp_id: number | null;
  bpp_id: number | null;
  pptk_id: number | null;
  nama: string;
  gaji: number | null;
  kpa?: string;
  bp?: string;
  bpp?: string;
  pptk?: string;
}

export type FormJabatanState = Omit<Jabatan, "id">;

export const initialData: FormJabatanState = {
  kpa_id: null,
  bp_id: null,
  bpp_id: null,
  pptk_id: null,
  nama: "",
  gaji: null,
};
