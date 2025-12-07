import type { Kehadiran } from "@/types/kehadiran.types";
import type { Jabatan } from "../../jabatan/types/types";

export type Pegawai = {
  id: number;
  id_department: number | null;
  id_penugasan: number | null;
  id_shift: number | null;
  id_korlap: number | null;
  badgenumber: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  gol_darah: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  agama: string;
  status_perkawinan: string;
  upload_ktp: string;
  upload_kk: string;
  upload_pas_foto: string;
  foto_lapangan: string;
  rute_kerja: string;
  department?: {
    DeptID: number;
    DeptName: string;
  };
  shift?: {
    jadwal: string;
    jam_masuk: string;
    jam_keluar: string;
  };
  kehadirans?: Kehadiran[];
  jabatan: Jabatan;
};

export type PegawaiForm = {
  id_department: number | null;
  id_penugasan: number | null;
  id_shift: number | null;
  id_korlap: number | null;
  badgenumber: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  gol_darah: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  agama: string;
  status_perkawinan: string;
  upload_ktp: string;
  upload_kk: string;
  upload_pas_foto: string;
  foto_lapangan: string;
  rute_kerja: string;
};



export type PegawaiErrors = Partial<Record<keyof PegawaiForm, string[]>> & {
  [key: string]: string[] | undefined;
};
