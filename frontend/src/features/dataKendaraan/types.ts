import type { Department } from "@/types/department.types";
import type { JenisKendaraan } from "../jenisKendaraan/types/types";

export interface Kendaraan {
    id: number;
    no_tnkb: string;
    merk: string;
    lambung: string;
    no_rangka: string;
    no_mesin: string;
    tahun_pembuatan: string;
    kondisi: string;
    keterangan?: string;
    jenis_kendaraan: JenisKendaraan;
    department: Department;
}