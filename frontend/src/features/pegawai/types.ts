export type Pegawai = {
  id: number;
  department_id: number;
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
};