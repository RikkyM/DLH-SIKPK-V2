import type { Kehadiran } from "@/types/kehadiran.types";

export interface Pegawai  {
  id: number;
  id_department: number;
  badgenumber: string;
  nama: string;
  jenis_kelamin: string;
  alamat: string;
  kecamatan: string;
  kelurahan: string;
  agama: string;
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
};
