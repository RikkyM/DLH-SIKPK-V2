import { useDialog } from "@/hooks/useDialog";
import type {
  Pegawai,
  PegawaiErrors,
  PegawaiForm,
} from "../types/pegawai.types";
import { useDepartment } from "@/hooks/useDepartment";
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useJabatan } from "@/features/jabatan/hooks/useJabatan";
import { useShiftKerja } from "@/features/shiftKerja/hooks/useShiftKerja";
import DateInput from "@/components/DateInput";
// import { updatePegawai } from "../services/api";
import { RefreshCcw } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/features/auth";
// import SearchableSelect from "@/components/SearchableSelect";
import { useFilterAsn } from "@/features/pns/hooks/useAsnFilter";
import { useFilterKecamatan } from "@/hooks/useFilterKecamatan";
import { useFilterKelurahan } from "@/hooks/useFilterKelurahan";
import PreviewImage from "@/components/PreviewImage";
import { useUpdatePegawai } from "../hooks";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

type fotoState = {
  upload_ktp: File | null;
  upload_kk: File | null;
  upload_pas_foto: File | null;
  foto_lapangan: File | null;
};

const FormEdit = () =>
  // {
  // refetch = () => {},
  // onUpdated,
  // }: {
  // refetch?: () => void;
  // onUpdated?: (pegawai: Pegawai) => void;
  // }
  {
    const { user } = useAuth();
    const {
      mutateAsync: updatePegawaiMutation,
      isPending: loading,
      // error,
    } = useUpdatePegawai();

    const { isOpen, data, closeDialog } = useDialog<Pegawai>();
    const { departments } = useDepartment();
    const { penugasan } = useJabatan();
    const { kategoriKerja } = useShiftKerja();
    const { datas } = useFilterAsn();
    const { datas: getKecamatan } = useFilterKecamatan();
    const { datas: getKelurahan } = useFilterKelurahan();

    const toNumber = (v?: string | number) => {
      if (v === "" || v === null || v === undefined) return null;
      const n = Number(String(v).trim());
      return Number.isFinite(n) ? n : null;
    };

    const MapRecenter = ({ lat, lng }: { lat: number; lng: number }) => {
      const map = useMap();
      useEffect(() => {
        if (!map) return;
        map.setView([lat, lng], map.getZoom(), { animate: true });
      }, [lat, lng, map]);
      return null;
    };

    const MapClickSetter = ({
      onPick,
    }: {
      onPick: (lat: number, lng: number) => void;
    }) => {
      useMapEvents({
        click(e) {
          onPick(e.latlng.lat, e.latlng.lng);
        },
      });
      return null;
    };

    const [formData, setFormData] = useState<PegawaiForm>({
      id_department: null,
      id_penugasan: null,
      id_shift: null,
      id_korlap: null,
      no_rekening: "",
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
      latitude: "",
      longitude: "",
      agama: "",
      status_perkawinan: "",
      rute_kerja: "",
    });
    const [errors, setErrors] = useState<PegawaiErrors>({});
    // const [loading, setLoading] = useState(false);

    const [foto, setFoto] = useState<fotoState>({
      upload_ktp: null,
      upload_kk: null,
      upload_pas_foto: null,
      foto_lapangan: null,
    });
    const [preview, setPreview] = useState<{
      upload_ktp?: string;
      upload_kk?: string;
      upload_pas_foto?: string;
      foto_lapangan?: string;
    }>({});
    const ktpRef = useRef<HTMLInputElement>(null);
    const kkRef = useRef<HTMLInputElement>(null);
    const pasFotoRef = useRef<HTMLInputElement>(null);
    const fotoLapanganRef = useRef<HTMLInputElement>(null);

    const resetFileInputs = () => {
      if (ktpRef.current) ktpRef.current.value = "";
      if (kkRef.current) kkRef.current.value = "";
      if (pasFotoRef.current) pasFotoRef.current.value = "";
      if (fotoLapanganRef.current) fotoLapanganRef.current.value = "";

      setFoto({
        upload_ktp: null,
        upload_kk: null,
        upload_pas_foto: null,
        foto_lapangan: null,
      });

      setPreview({});
    };

    const filterKelurahan = useMemo(() => {
      if (!formData.kecamatan) return [];
      return (getKelurahan ?? []).filter(
        (k) => k.kodeKecamatan === formData.kecamatan,
      );
    }, [getKelurahan, formData.kecamatan]);

    useEffect(() => {
      if (!isOpen || !data) return;

      const kecamatan = (getKecamatan ?? []).find(
        (k) =>
          k.namaKecamatan?.toLowerCase() ===
          (data.kecamatan ?? "").trim().toLowerCase(),
      );

      const kelurahan = (getKelurahan ?? []).find(
        (k) =>
          k.namaKelurahan?.toLowerCase() ===
            (data.kelurahan ?? "").trim().toLowerCase() &&
          (!kecamatan?.kodeKecamatan ||
            k.kodeKecamatan === kecamatan.kodeKecamatan),
      );

      setErrors({});
      setFormData({
        id_department: data.id_department ?? null,
        id_penugasan: data.id_penugasan ?? null,
        id_shift: data.id_shift ?? null,
        id_korlap: data.id_korlap ?? null,
        no_rekening: data.no_rekening ?? null,
        badgenumber: data.badgenumber ?? "",
        nama: data.nama ?? "",
        tempat_lahir: data.tempat_lahir ?? "",
        tanggal_lahir: data.tanggal_lahir ?? "",
        jenis_kelamin: data.jenis_kelamin ?? "",
        gol_darah: data.gol_darah ?? "",
        alamat: data.alamat ?? "",
        rt: data.rt ?? "",
        rw: data.rw ?? "",
        kelurahan: kelurahan?.kodeKelurahan ?? "",
        kecamatan: kecamatan?.kodeKecamatan ?? "",
        kota: data.kota ?? "",
        latitude: data.latitude ?? "",
        longitude: data.longitude ?? "",
        agama: data.agama ?? "",
        status_perkawinan: data.status_perkawinan ?? "",
        rute_kerja: data.rute_kerja ?? "",
      });
      resetFileInputs();
      setPreview({
        upload_ktp: data?.upload_ktp
          ? `${import.meta.env.VITE_API_BASE}/api/v1/petugas/${data.id}/image/ktp?v=${encodeURIComponent(data.updated_at ?? "")}`
          : undefined,
        upload_kk: data?.upload_kk
          ? `${import.meta.env.VITE_API_BASE}/api/v1/petugas/${data.id}/image/kk?v=${encodeURIComponent(data.updated_at ?? "")}`
          : undefined,
        upload_pas_foto: data?.upload_pas_foto
          ? `${import.meta.env.VITE_API_BASE}/api/v1/petugas/${data.id}/image/pas_foto?v=${encodeURIComponent(data.updated_at ?? "")}`
          : undefined,
        foto_lapangan: data?.foto_lapangan
          ? `${import.meta.env.VITE_API_BASE}/api/v1/petugas/${data.id}/image/foto_lapangan?v=${encodeURIComponent(data.updated_at ?? "")}`
          : undefined,
      });
    }, [data, isOpen, getKecamatan, getKelurahan]);

    useEffect(() => {
      return () => {
        Object.values(preview).forEach((url) => {
          if (url?.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });
      };
    });

    const handleChange = (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = e.target;

      let newValue: string | number | null = value;

      const onlyDigits = value.replace(/\D/g, "");

      if (name === "rt" || name === "rw") {
        newValue = onlyDigits.slice(0, 3);
      }

      if (name === "badgenumber" || name === "no_rekening") {
        newValue = onlyDigits.slice(0, 16);
      }

      setFormData((prev) => ({
        ...prev,
        ...(name === "id_department" ||
        name === "id_penugasan" ||
        name === "id_shift" ||
        name === "id_korlap"
          ? { [name]: value ? Number(value) : null }
          : { [name]: newValue }),
      }));

      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, files } = e.target;
      if (!files?.length) return;

      const file = files[0];

      setFoto((prev) => ({
        ...prev,
        [name]: file,
      }));

      setPreview((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(file),
      }));
    };

    // const handleExportPdf = async () => {
    //   if (!data?.id) {
    //     alert("data pegawai tidak ditemukan.");
    //     return;
    //   }

    //   try {
    //     const res = await axios.get(
    //       `${import.meta.env.VITE_API_BASE}/api/v1/export-pegawai-pdf/${data.id}`,
    //       {
    //         responseType: "blob",
    //         headers: {
    //           Accept: "application/pdf",
    //         },
    //       },
    //     );

    //     const blob = new Blob([res.data], { type: "application/pdf" });
    //     const url = window.URL.createObjectURL(blob);

    //     window.open(url, "_blank");

    //     setTimeout(() => {
    //       window.URL.revokeObjectURL(url);
    //     }, 100);
    //   } catch (err) {
    //     if (axios.isAxiosError(err)) {
    //       console.error("PDF ERROR:", err.response?.data);
    //     }
    //   }
    // };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!data?.id) return;

      const fd = new FormData();
      fd.append("_method", "PUT");

      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || value === "") return;
        fd.append(key, String(value));
      });

      Object.entries(foto).forEach(([key, file]) => {
        if (file) {
          fd.append(key, file);
        }
      });

      // setLoading(true);
      setErrors({});

      try {
        // const res = await updatePegawai(data.id, fd);
        await updatePegawaiMutation({ id: data.id, fd });
        closeDialog();
        // const updatedPegawai = res;

        // if (onUpdated) {
        //   onUpdated(updatedPegawai);
        //   refetch();
        // }

        // setLoading(false);
        closeDialog();
      } catch (err) {
        // setLoading(false);

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 422 && err.response.data?.errors) {
            setErrors(err.response.data.errors);
            return;
          }
        }
        console.error("Gagal mengupdate data");
      }
    };

    return (
      <section
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[600px] w-full space-y-3 overflow-y-auto rounded-sm bg-white shadow transition-all duration-300 ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
        <h2 className="sticky top-0 bg-white p-3 font-semibold lg:text-lg">
          Edit Petugas
        </h2>
        <form onSubmit={handleSubmit} className="grid">
          <div className="grid h-max w-full gap-1.5 space-y-2 px-3 pb-3 md:gap-2 lg:grid-cols-2">
            <div className="space-y-1 text-sm">
              <label htmlFor="badgenumber" className="block font-medium">
                NIK
              </label>
              <input
                className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
                type="text"
                id="badgenumber"
                name="badgenumber"
                placeholder="Masukkan NIK..."
                value={formData?.badgenumber ?? ""}
                onChange={handleChange}
                disabled={user?.role !== "superadmin"}
              />
              {errors.badgenumber && (
                <p className="text-xs text-red-500">{errors.badgenumber[0]}</p>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <label htmlFor="rekening" className="block font-medium">
                Nomor Rekening
              </label>
              <input
                className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
                type="text"
                id="rekening"
                name="no_rekening"
                placeholder="Masukkan nomor rekening..."
                value={formData?.no_rekening ?? ""}
                onChange={handleChange}
                // disabled={user?.role !== "superadmin"}
                disabled={
                  user?.role !== "superadmin" && user?.role !== "operator"
                }
              />
              {errors.no_rekening && (
                <p className="text-xs text-red-500">{errors.no_rekening[0]}</p>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <label htmlFor="nama" className="block font-medium">
                Nama Lengkap
              </label>
              <input
                className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
                type="text"
                id="nama"
                name="nama"
                placeholder="Masukkan nama pegawai..."
                value={formData?.nama ?? ""}
                onChange={handleChange}
                disabled={user?.role !== "superadmin"}
              />
              {errors.nama && (
                <p className="text-xs text-red-500">{errors.nama[0]}</p>
              )}
            </div>
            <div className="space-y-1 text-sm">
              <label htmlFor="id_department" className="block font-medium">
                Unit Kerja
              </label>
              <select
                name="id_department"
                id="id_department"
                className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
                value={formData?.id_department ?? ""}
                onChange={handleChange}
                disabled={user?.role !== "superadmin"}
              >
                <option value="" disabled hidden>
                  Pilih Unit Kerja
                </option>
                {!departments ? (
                  <option value="" disabled>
                    Loading...
                  </option>
                ) : (
                  departments?.map((department, index) => (
                    <option
                      key={department.DeptID ?? index}
                      value={department.DeptID}
                      className="text-xs font-medium"
                    >
                      {department?.DeptName}
                    </option>
                  ))
                )}
              </select>
              {errors.id_department && (
                <p className="text-xs text-red-500">
                  {errors.id_department[0]}
                </p>
              )}
            </div>
            <div className="col-span-2 flex flex-col gap-2 sm:flex-row">
              <div className="flex-1 space-y-1 text-sm">
                <label htmlFor="id_penugasan" className="block font-medium">
                  Penugasan
                </label>
                <select
                  name="id_penugasan"
                  id="id_penugasan"
                  className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
                  value={formData?.id_penugasan ?? ""}
                  onChange={handleChange}
                  disabled={
                    !(user && ["superadmin", "admin"].includes(user?.role))
                  }
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
                {errors.id_penugasan && (
                  <p className="text-xs text-red-500">
                    {errors.id_penugasan[0]}
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-1 text-sm">
                <label htmlFor="id_shift" className="block font-medium">
                  Kategori Kerja
                </label>
                <select
                  name="id_shift"
                  id="id_shift"
                  className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
                  value={formData?.id_shift ?? ""}
                  onChange={handleChange}
                  disabled={
                    !(user && ["superadmin", "admin"].includes(user?.role))
                  }
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
                      {p?.jam_masuk.slice(0, 5)} s.d {p?.jam_keluar.slice(0, 5)}{" "}
                      WIB
                    </option>
                  ))}
                </select>
                {errors.id_shift && (
                  <p className="text-xs text-red-500">{errors.id_shift[0]}</p>
                )}
              </div>
              <div className="flex-1 space-y-1 text-sm">
                <label htmlFor="id_korlap" className="block font-medium">
                  Pilih Operator Layanan
                </label>
                <select
                  name="id_korlap"
                  id="id_korlap"
                  className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5"
                  value={formData?.id_korlap ?? ""}
                  onChange={handleChange}
                  disabled={
                    !(
                      user &&
                      ["superadmin", "admin", "operator"].includes(user?.role)
                    )
                  }
                >
                  <option value="" disabled hidden>
                    Pilih Operator Layanan
                  </option>
                  <option value="">X</option>
                  {datas?.map((p, index) => (
                    <option
                      key={p.id ?? index}
                      value={p.id}
                      className="text-xs font-medium"
                    >
                      {p.nama}
                    </option>
                  ))}
                </select>
                {errors.id_korlap && (
                  <p className="text-xs text-red-500">{errors.id_korlap[0]}</p>
                )}
                {/* <SearchableSelect
            label="Pilih Korlap"
            name="id_korlap"
            value={formData.id_korlap}
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                id_korlap: val ? Number(val) : null,
              }))
            }
            options={
              datas?.map((p) => ({
                id: p.id,
                nama: p.nama,
              })) ?? []
            }
            placeholder="Cari / Pilih Korlap..."
            disabled={
              !(
                user && ["superadmin", "admin", "operator"].includes(user?.role)
              )
            }
            error={errors.id_korlap?.[0]}
          /> */}
              </div>
            </div>
            <div className="col-span-2 flex flex-col gap-2 sm:flex-row">
              <div className="flex-1 space-y-1 text-sm">
                <label htmlFor="tempat_lahir" className="block font-medium">
                  Tempat Lahir
                </label>
                <input
                  className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed"
                  type="text"
                  id="tempat_lahir"
                  name="tempat_lahir"
                  placeholder="Masukkan Tempat Lahir..."
                  value={formData?.tempat_lahir ?? ""}
                  onChange={handleChange}
                  disabled={
                    !(
                      user &&
                      ["superadmin", "admin", "operator"].includes(user?.role)
                    )
                  }
                />
                {errors.tempat_lahir && (
                  <p className="text-xs text-red-500">
                    {errors.tempat_lahir[0]}
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-1 text-sm">
                <label htmlFor="tanggal_lahir" className="block font-medium">
                  Tanggal Lahir
                </label>
                <DateInput
                  id="tanggal_lahir"
                  name="tanggal_lahir"
                  placeholder="Pilih Tanggal Lahir..."
                  className="w-full"
                  value={formData?.tanggal_lahir ?? ""}
                  onChange={handleChange}
                  disabled={
                    !(
                      user &&
                      ["superadmin", "admin", "operator"].includes(user?.role)
                    )
                  }
                />
                {errors.tanggal_lahir && (
                  <p className="text-xs text-red-500">
                    {errors.tanggal_lahir[0]}
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-1 text-sm">
                <label htmlFor="jenis_kelamin" className="block font-medium">
                  Jenis Kelamin
                </label>
                <select
                  name="jenis_kelamin"
                  id="jenis_kelamin"
                  className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5"
                  value={formData?.jenis_kelamin ?? ""}
                  onChange={handleChange}
                  disabled={
                    !(
                      user &&
                      ["superadmin", "admin", "operator"].includes(user?.role)
                    )
                  }
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
                {errors.jenis_kelamin && (
                  <p className="text-xs text-red-500">
                    {errors.jenis_kelamin[0]}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1 text-sm sm:col-span-2">
              <label htmlFor="alamat" className="block font-medium">
                Alamat
              </label>
              <textarea
                className="max-h-20 min-h-14 w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
                id="alamat"
                name="alamat"
                placeholder="Masukkan Alamat..."
                value={formData?.alamat ?? ""}
                onChange={handleChange}
                disabled={
                  !(
                    user &&
                    ["superadmin", "admin", "operator"].includes(user?.role)
                  )
                }
              />
              {errors.alamat && (
                <p className="text-xs text-red-500">{errors.alamat[0]}</p>
              )}
            </div>
            <div className="col-span-2 flex flex-col gap-2 sm:flex-row">
              <div className="space-y-1 text-sm">
                <label htmlFor="rt" className="block font-medium">
                  RT
                </label>
                <input
                  className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 lg:w-16"
                  type="text"
                  id="rt"
                  name="rt"
                  placeholder="Masukkan RT..."
                  inputMode="numeric"
                  maxLength={3}
                  value={formData?.rt ?? ""}
                  onChange={handleChange}
                  disabled={
                    !(
                      user &&
                      ["superadmin", "admin", "operator"].includes(user?.role)
                    )
                  }
                />
                {errors.rt && (
                  <p className="text-xs text-red-500">{errors.rt[0]}</p>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <label htmlFor="rw" className="block font-medium">
                  RW
                </label>
                <input
                  className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 lg:w-16"
                  type="text"
                  id="rw"
                  name="rw"
                  placeholder="Masukkan RW..."
                  inputMode="numeric"
                  maxLength={3}
                  value={formData?.rw ?? ""}
                  onChange={handleChange}
                  disabled={
                    !(
                      user &&
                      ["superadmin", "admin", "operator"].includes(user?.role)
                    )
                  }
                />
                {errors.rw && (
                  <p className="text-xs text-red-500">{errors.rw[0]}</p>
                )}
              </div>
              <div className="w-full space-y-1 text-sm sm:w-auto">
                <label htmlFor="kecamatan" className="block font-medium">
                  Kecamatan
                </label>
                <select
                  name="kecamatan"
                  id="kecamatan"
                  className="w-44 cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5"
                  value={formData?.kecamatan ?? ""}
                  onChange={handleChange}
                  disabled={
                    !(
                      user &&
                      ["superadmin", "admin", "operator"].includes(user?.role)
                    )
                  }
                >
                  <option value="" disabled hidden>
                    Pilih Kecamatan
                  </option>
                  {getKecamatan &&
                    getKecamatan?.map((p, index) => (
                      <option
                        key={p.kodeKecamatan ?? index}
                        value={p.kodeKecamatan}
                        className="text-xs font-medium"
                      >
                        {p.namaKecamatan}
                      </option>
                    ))}
                </select>
                {errors.kecamatan && (
                  <p className="text-xs text-red-500">{errors.kecamatan[0]}</p>
                )}
              </div>
              <div className="w-full space-y-1 text-sm sm:w-auto">
                <label htmlFor="kelurahan" className="block font-medium">
                  Kelurahan
                </label>
                <select
                  name="kelurahan"
                  id="kelurahan"
                  className="w-44 cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5"
                  value={formData?.kelurahan ?? ""}
                  onChange={handleChange}
                  disabled={
                    !(
                      user &&
                      ["superadmin", "admin", "operator"].includes(user?.role)
                    )
                  }
                >
                  <option value="" disabled hidden>
                    Pilih Kelurahan
                  </option>
                  {(formData.kecamatan || data?.kecamatan) &&
                    filterKelurahan?.map((p, index) => (
                      <option
                        key={p.kodeKelurahan ?? index}
                        value={p.kodeKelurahan}
                        className="text-xs font-medium"
                      >
                        {p.namaKelurahan}
                      </option>
                    ))}
                </select>
                {errors.kelurahan && (
                  <p className="text-xs text-red-500">{errors.kelurahan[0]}</p>
                )}
              </div>
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
                value={formData?.agama ?? ""}
                onChange={handleChange}
                disabled={
                  !(
                    user &&
                    ["superadmin", "admin", "operator"].includes(user?.role)
                  )
                }
              />
              {errors.agama && (
                <p className="text-xs text-red-500">{errors.agama[0]}</p>
              )}
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
                disabled={
                  !(
                    user &&
                    ["superadmin", "admin", "operator"].includes(user?.role)
                  )
                }
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
              {errors.status_perkawinan && (
                <p className="text-xs text-red-500">
                  {errors.status_perkawinan[0]}
                </p>
              )}
            </div>

            {/* input foto */}
            <div className="col-span-2 flex flex-col gap-2 md:flex-row">
              <div className="space-y-1 text-sm">
                <label htmlFor="upload_ktp" className="block font-medium">
                  Upload KTP
                </label>
                <input
                  ref={ktpRef}
                  className="w-full cursor-pointer rounded border border-gray-300 bg-transparent px-3 py-1.5"
                  type="file"
                  accept="image/*"
                  id="upload_ktp"
                  name="upload_ktp"
                  onChange={handleFileChange}
                />
                <p className="text-xs font-medium text-gray-400">
                  Tipe file: jpg, jpeg, png. max: 250kb
                </p>
                {data?.upload_ktp && (
                  <a
                    href={`${import.meta.env.VITE_API_BASE}/api/v1/petugas/${data.id}/image/ktp?v=${encodeURIComponent(data.updated_at ?? "")}`}
                    rel="noreferrer noopener"
                    className="text-blue-500 hover:underline md:hidden"
                    target="_blank"
                  >
                    Lihat KTP
                  </a>
                )}
                {errors.upload_ktp && (
                  <p className="text-xs text-red-500">{errors.upload_ktp[0]}</p>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <label htmlFor="upload_kk" className="block font-medium">
                  Upload KK
                </label>
                <input
                  ref={kkRef}
                  className="w-full cursor-pointer rounded border border-gray-300 bg-transparent px-3 py-1.5"
                  type="file"
                  accept="application/pdf"
                  id="upload_kk"
                  name="upload_kk"
                  onChange={handleFileChange}
                />
                <p className="text-xs font-medium text-gray-400">
                  Tipe file: pdf. max: 250kb
                </p>
                {data?.upload_kk && (
                  <a
                    href={`${import.meta.env.VITE_API_BASE}/api/v1/petugas/${data.id}/image/kk?v=${encodeURIComponent(data.updated_at ?? "")}`}
                    rel="noreferrer noopener"
                    className="text-blue-500 hover:underline md:hidden"
                    target="_blank"
                  >
                    Lihat KK
                  </a>
                )}
                {errors.upload_kk && (
                  <p className="text-xs text-red-500">{errors.upload_kk[0]}</p>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <label htmlFor="pas_foto" className="block font-medium">
                  Upload Pas Foto
                </label>
                <input
                  ref={pasFotoRef}
                  className="w-full cursor-pointer rounded border border-gray-300 bg-transparent px-3 py-1.5"
                  type="file"
                  accept="image/*"
                  id="pas_foto"
                  name="upload_pas_foto"
                  onChange={handleFileChange}
                />
                <p className="text-xs font-medium text-gray-400">
                  Tipe file: jpg, jpeg, png. max: 250kb
                </p>
                {data?.upload_pas_foto && (
                  <a
                    href={`${import.meta.env.VITE_API_BASE}/api/v1/petugas/${data.id}/image/pas_foto?v=${encodeURIComponent(data.updated_at ?? "")}`}
                    rel="noreferrer noopener"
                    className="text-blue-500 hover:underline md:hidden"
                    target="_blank"
                  >
                    Lihat Pas Foto
                  </a>
                )}
                {errors.upload_pas_foto && (
                  <p className="text-xs text-red-500">
                    {errors.upload_pas_foto[0]}
                  </p>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <label htmlFor="foto_lapangan" className="block font-medium">
                  Upload Foto Lapangan
                </label>
                <input
                  ref={fotoLapanganRef}
                  className="w-full cursor-pointer rounded border border-gray-300 bg-transparent px-3 py-1.5"
                  type="file"
                  accept="image/*"
                  id="foto_lapangan"
                  name="foto_lapangan"
                  onChange={handleFileChange}
                />
                <p className="text-xs font-medium text-gray-400">
                  Tipe file: jpg, jpeg, png. max: 250kb
                </p>
                {data?.foto_lapangan && (
                  <a
                    href={`${import.meta.env.VITE_API_BASE}/api/v1/petugas/${data.id}/image/foto_lapangan?v=${encodeURIComponent(data.updated_at ?? "")}`}
                    rel="noreferrer noopener"
                    className="text-blue-500 hover:underline md:hidden"
                    target="_blank"
                  >
                    Lihat Foto Lapangan
                  </a>
                )}
                {errors.foto_lapangan && (
                  <p className="text-xs text-red-500">
                    {errors.foto_lapangan[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="col-span-2 space-y-1 text-sm sm:col-span-1">
              <label htmlFor="rute_kerja" className="block font-medium">
                Rute Kerja
              </label>
              <textarea
                className="max-h-20 min-h-14 w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent sm:h-full sm:max-h-80"
                id="rute_kerja"
                name="rute_kerja"
                placeholder="Masukkan Rute Kerja..."
                value={formData?.rute_kerja ?? ""}
                onChange={handleChange}
                disabled={
                  !(user && ["superadmin", "admin"].includes(user?.role))
                }
              />
              {errors.rute_kerja && (
                <p className="text-xs text-red-500">{errors.rute_kerja[0]}</p>
              )}
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-1">
              <div className=" space-y-1 text-sm sr-only">
                <label htmlFor="rute_kerja" className="block font-medium">
                  Latitude
                </label>
                <input
                  className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude || ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (!/^-?\d*\.?\d*$/.test(value)) return;

                    setFormData((prev) => ({ ...prev, latitude: value }));
                  }}
                  onKeyDown={(e) => {
                    const allowed = [
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "Tab",
                      "Home",
                      "End",
                    ];
                    const isNumber = /^\d$/.test(e.key);
                    const isMinus =
                      e.key === "-" &&
                      e.currentTarget.selectionStart === 0 &&
                      !e.currentTarget.value.includes("-");
                    const isDot =
                      e.key === "." && !e.currentTarget.value.includes(".");

                    if (
                      !isNumber &&
                      !isMinus &&
                      !isDot &&
                      !allowed.includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
                {errors.rute_kerja && (
                  <p className="text-xs text-red-500">{errors.rute_kerja[0]}</p>
                )}
              </div>
              <div className=" space-y-1 text-sm sr-only">
                <label htmlFor="longitude" className="block font-medium">
                  Longitude
                </label>
                <input
                  className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude || ""}
                  onKeyDown={(e) => {
                    const allowed = [
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "Tab",
                      "Home",
                      "End",
                    ];
                    const isNumber = /^\d$/.test(e.key);
                    const isMinus =
                      e.key === "-" &&
                      e.currentTarget.selectionStart === 0 &&
                      !e.currentTarget.value.includes("-");
                    const isDot =
                      e.key === "." && !e.currentTarget.value.includes(".");

                    if (
                      !isNumber &&
                      !isMinus &&
                      !isDot &&
                      !allowed.includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^-?\d*\.?\d*$/.test(value)) {
                      setFormData((prev) => ({ ...prev, longitude: value }));
                    }
                  }}
                />
                {errors.longitude && (
                  <p className="text-xs text-red-500">{errors.longitude[0]}</p>
                )}
              </div>

              <div className="col-span-2 mx-auto hidden h-72 w-full overflow-hidden rounded">
                <span className="block font-medium">Peta</span>

                {(() => {
                  const lat = toNumber(formData.latitude);
                  const lng = toNumber(formData.longitude);

                  const center: [number, number] =
                    lat !== null && lng !== null
                      ? [lat, lng]
                      : [-2.9761, 104.7754];

                  return (
                    <MapContainer
                      center={center}
                      zoom={lat !== null && lng !== null ? 16 : 13}
                      scrollWheelZoom
                      className="h-full w-full"
                    >
                      <TileLayer
                        url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                        attribution="Google"
                      />

                      <MapClickSetter
                        onPick={(la, lo) => {
                          setFormData((p) => ({
                            ...p,
                            latitude: String(la),
                            longitude: String(lo),
                          }));
                        }}
                      />

                      {lat !== null && lng !== null && (
                        <>
                          <Marker position={[lat, lng]} />
                          <MapRecenter lat={lat} lng={lng} />
                        </>
                      )}
                    </MapContainer>
                  );
                })()}
              </div>
            </div>
          </div>
          <div className="sticky top-16 hidden h-max max-h-120 w-full max-w-82 space-y-2 overflow-auto pr-2 lg:block">
            {/* <img src={`${import.meta.env.VITE_API_BASE}/api/v1/petugas/${dpata?.id}/image/ktp?v=${encodeURIComponent(data?.updated_at ?? "")}`} /> */}

            <div className="space-y-0.5">
              <h3 className="font-semibold lg:text-xl">Preview Dokumen</h3>
              <p className="text-xs text-gray-400 lg:text-sm">
                Gambar yang akan di-upload akan tampil disini
              </p>
            </div>

            {/* <div className="mx-auto w-full rounded-lg border border-gray-300 p-1 shadow">
            <div>
              <h4 className="font-semibold lg:text-xl">KTP</h4>
              <p className="text-xs text-gray-400 lg:text-sm">
                Identitas Kependudukan
              </p>
            </div>

            {preview.upload_ktp ? (
              <img
                src={preview.upload_ktp}
                className="mx-auto max-h-56 max-w-full cursor-pointer rounded object-cover"
                onClick={() => openPreview(preview.upload_ktp!)}
              />
            ) : (
              <div className="grid h-56 w-full place-content-center rounded-lg border-2 border-dashed border-gray-400 bg-gray-200">
                <div className="space-y-2">
                  <Image className="mx-auto size-7 text-gray-500" />
                  <p className="text-center text-sm text-gray-500">
                    Belum ada gambar
                  </p>
                </div>
              </div>
            )}
          </div> */}
            <PreviewImage
              title="KTP"
              subTitle="Identitas Kependudukan"
              image={preview.upload_ktp}
            />
            {/* <PreviewImage
            title="Kartu Keluarga"
            subTitle="KK"
            image={preview.upload_kk}
          /> */}
            <PreviewImage
              title="Pas Foto"
              subTitle="Pas Foto Petugas"
              image={preview.upload_pas_foto}
            />
            <PreviewImage
              title="Foto Lapangan"
              subTitle="Dokumentasi Lapangan"
              image={preview.foto_lapangan}
            />
          </div>
          <div className="sticky bottom-0 z-1000 flex w-full place-content-end gap-2 bg-white p-2 md:col-span-2">
            <a
              href={`${import.meta.env.VITE_API_BASE}/api/v1/export-pegawai-pdf/${data?.id ?? ""}`}
              rel="noopener noreferrer"
              target="_blank"
              className="cursor-pointer rounded bg-[#DE2429] px-3 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-red-600"
            >
              Export PDF
            </a>
            <button
              type="button"
              onClick={() => {
                closeDialog();
                setErrors({});
              }}
              className="cursor-pointer rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-red-600"
            >
              Batal
            </button>
            <button className="w-[10ch] cursor-pointer rounded bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-green-600">
              {loading ? (
                <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </section>
    );
  };

export default memo(FormEdit);
