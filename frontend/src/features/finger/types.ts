import type { Pegawai } from "../pegawai/types";

export interface Finger {
    id: number;
    old_id: number;
    userid: number;
    checktime: string;
    checktype: string;
    pegawai: Pegawai;
}