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

export type PegawaiResponse<T> = {
  success: boolean;
  data: {
    current_page: number;
    data: T[];
    per_page: number;
    total: number;
    last_page: number;
  };
};
