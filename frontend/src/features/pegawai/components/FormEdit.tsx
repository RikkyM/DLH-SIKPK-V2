import { useDialog } from "@/hooks/useDialog";
import type { Pegawai } from "../types/pegawai.types";
import { useDepartment } from "@/hooks/useDepartment";
import { memo, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useJabatan } from "@/features/jabatan/hooks/useJabatan";
import { useShiftKerja } from "@/features/shiftKerja/hooks/useShiftKerja";
import DateInput from "@/components/DateInput";

type PegawaiForm = {
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
  rt: "";
  rw: "";
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

const FormEdit = () => {
  const { isOpen, data, closeDialog } = useDialog<Pegawai>();
  const { departments } = useDepartment();
  const { penugasan } = useJabatan();
  const { kategoriKerja } = useShiftKerja();

  const [formData, setFormData] = useState<PegawaiForm>({
    id_department: null,
    id_penugasan: null,
    id_shift: null,
    id_korlap: null,
    badgenumber: "",
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    gol_darah: "",
    alamat: "",
    rt: "",
    rw: "",
    kelurahan: "",
    kecamatan: "",
    kota: "",
    agama: "",
    status_perkawinan: "",
    upload_ktp: "",
    upload_kk: "",
    upload_pas_foto: "",
    foto_lapangan: "",
    rute_kerja: "",
  });

  useEffect(() => {
    if (!isOpen || !data) return;

    setFormData({
      id_department: data.id_department ?? null,
      id_penugasan: data.id_penugasan ?? null,
      id_shift: data.id_shift ?? null,
      id_korlap: data.id_korlap ?? null,
      badgenumber: data.badgenumber ?? "",
      nama: data.nama ?? "",
      tempat_lahir: data.tempat_lahir ?? "",
      tanggal_lahir: data.tanggal_lahir ?? "",
      jenis_kelamin: data.jenis_kelamin ?? "",
      gol_darah: data.gol_darah ?? "",
      alamat: data.alamat ?? "",
      rt: data.rt ?? "",
      rw: data.rw ?? "",
      kelurahan: data.kelurahan ?? "",
      kecamatan: data.kecamatan ?? "",
      kota: data.kota ?? "",
      agama: data.agama ?? "",
      status_perkawinan: data.status_perkawinan ?? "",
      upload_ktp: data.upload_ktp ?? "",
      upload_kk: data.upload_kk ?? "",
      upload_pas_foto: data.upload_pas_foto ?? "",
      foto_lapangan: data.foto_lapangan ?? "",
      rute_kerja: data.rute_kerja ?? "",
    });
  }, [data, isOpen]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      ...(name === "id_department" ||
      name === "id_penugasan" ||
      name === "id_shift"
        ? { [name]: value ? Number(value) : null }
        : { [name]: value }),
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('asd')
  }

  return (
    <section
      onClick={(e) => e.stopPropagation()}
      className={`max-h-[600px] w-full space-y-3 overflow-auto rounded-sm bg-white shadow transition-all duration-300 ${
        isOpen ? "scale-100" : "scale-95"
      }`}
    >
      <h2 className="sticky top-0 bg-white font-semibold lg:text-lg p-3">
        Edit Unit Kerja
      </h2>
      <form onSubmit={handleSubmit} className="grid w-full gap-1.5 space-y-2 md:grid-cols-2 md:gap-2 px-3 pb-3">
        <div className="space-y-1 text-sm">
          <label htmlFor="badgenumber" className="block font-medium">
            NIK
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="text"
            id="badgenumber"
            name="badgenumber"
            placeholder="Masukkan NIK..."
            defaultValue={data?.badgenumber ?? ""}
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="nama" className="block font-medium">
            Nama Lengkap
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="text"
            id="nama"
            name="nama"
            placeholder="Masukkan nama pegawai..."
            defaultValue={data?.nama ?? ""}
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="department" className="block font-medium">
            Unit Kerja
          </label>
          <select
            name="department"
            id="department"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5"
            value={formData?.id_department ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih Unit Kerja
            </option>
            {departments?.map((department, index) => (
              <option
                key={department.DeptID ?? index}
                value={department.DeptID}
                className="text-xs font-medium"
              >
                {department?.DeptName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="penugasan" className="block font-medium">
            Penugasan
          </label>
          <select
            name="penugasan"
            id="penugasan"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5"
            value={formData?.id_penugasan ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih Penugasan
            </option>
            {penugasan?.map((p, index) => (
              <option
                key={p.id ?? index}
                value={p.id}
                className="text-xs font-medium"
              >
                {p?.nama}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="shift" className="block font-medium">
            Kategori Kerja
          </label>
          <select
            name="shift"
            id="shift"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5"
            value={formData?.id_shift ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih Kategori Kerja
            </option>
            {kategoriKerja?.map((p, index) => (
              <option
                key={p.id ?? index}
                value={p.id}
                className="text-xs font-medium"
              >
                {p?.jadwal.replace(/kategori\s*(\d+)/i, "K$1")} -{" "}
                {p?.jam_masuk.slice(0, 5)} s.d {p?.jam_keluar.slice(0, 5)} WIB
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="tempat_lahir" className="block font-medium">
            Tempat Lahir
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="text"
            id="tempat_lahir"
            name="tempat_lahir"
            placeholder="Masukkan Tempat Lahir..."
            defaultValue={data?.tempat_lahir ?? ""}
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="tanggal_lahir" className="block font-medium">
            Tanggal Lahir
          </label>
          <DateInput
            id="tanggal_lahir"
            value={data?.tanggal_lahir || ""}
            onChange={handleChange}
            placeholder="Pilih Tanggal Lahir..."
            className="w-full"
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="jenis_kelamin" className="block font-medium">
            Jenis Kelamin
          </label>
          <select
            name="jenis_kelamin"
            id="jenis_kelamin"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5"
            value={formData?.jenis_kelamin ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih Jenis Kelamin
            </option>
            <option value="laki-laki" className="text-xs font-medium">
              Laki-Laki
            </option>
            <option value="perempuan" className="text-xs font-medium">
              Perempuan
            </option>
          </select>
        </div>
        <div className="space-y-1 text-sm md:col-span-2">
          <label htmlFor="alamat" className="block font-medium">
            Alamat
          </label>
          <textarea
            className="max-h-20 min-h-14 w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            id="alamat"
            name="alamat"
            placeholder="Masukkan Alamat..."
            defaultValue={data?.alamat ?? ""}
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="kelurahan" className="block font-medium">
            Kelurahan
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="text"
            id="kelurahan"
            name="kelurahan"
            placeholder="Masukkan Kelurahan..."
            defaultValue={data?.kelurahan ?? ""}
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="kecamatan" className="block font-medium">
            Kecamatan
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="text"
            id="kecamatan"
            name="kecamatan"
            placeholder="Masukkan Kecamatan..."
            defaultValue={data?.kecamatan ?? ""}
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="agama" className="block font-medium">
            Agama
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="text"
            id="agama"
            name="agama"
            placeholder="Masukkan Agama..."
            defaultValue={data?.agama ?? ""}
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="status_perkawinan" className="block font-medium">
            Status Perkawinan
          </label>
          <select
            name="status_perkawinan"
            id="status_perkawinan"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5"
            value={formData?.status_perkawinan ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih Status Perkawinan
            </option>
            <option value="belum kawin" className="text-xs font-medium">
              Belum Kawin
            </option>
            <option value="kawin" className="text-xs font-medium">
              Kawin
            </option>
            <option value="cerai hidup" className="text-xs font-medium">
              Cerai Hidup
            </option>
            <option value="cerai mati" className="text-xs font-medium">
              Cerai Mati
            </option>
          </select>
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="upload_ktp" className="block font-medium">
            Upload KTP
          </label>
          <input
            className="w-full cursor-pointer rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="file"
            id="upload_ktp"
            name="upload_ktp"
            defaultValue={data?.upload_ktp ?? ""}
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="upload_kk" className="block font-medium">
            Upload KK
          </label>
          <input
            className="w-full cursor-pointer rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="file"
            id="upload_kk"
            name="upload_kk"
            defaultValue={data?.upload_kk ?? ""}
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="upload_pas_foto" className="block font-medium">
            Upload Pas Foto
          </label>
          <input
            className="w-full cursor-pointer rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="file"
            id="upload_pas_foto"
            name="upload_pas_foto"
            defaultValue={data?.upload_pas_foto ?? ""}
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="foto_lapangan" className="block font-medium">
            Foto Lapangan
          </label>
          <input
            className="w-full cursor-pointer rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="file"
            id="foto_lapangan"
            name="foto_lapangan"
            defaultValue={data?.foto_lapangan ?? ""}
          />
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="id_korlap" className="block font-medium">
            Pilih Korlap
          </label>
          <select
            name="id_korlap"
            id="id_korlap"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5"
            value={formData?.id_korlap ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih Korlap
            </option>
          </select>
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="rute_kerja" className="block font-medium">
            Rute Kerja
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="text"
            id="rute_kerja"
            name="rute_kerja"
            placeholder="Masukkan Rute Kerja..."
            defaultValue={data?.rute_kerja ?? ""}
          />
        </div>
        <div className="flex w-full place-content-end gap-2 md:col-span-2">
          <button
            type="button"
            onClick={() => {
              closeDialog();
            }}
            className="cursor-pointer rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-red-600"
          >
            Batal
          </button>
          <button className="cursor-pointer rounded bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-green-600">
            Simpan
          </button>
        </div>
      </form>
    </section>
  );
};

export default memo(FormEdit);
