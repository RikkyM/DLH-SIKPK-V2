import Combobox from "@/components/Combobox";
import { useDialog } from "@/hooks/useDialog";
import { http } from "@/services/api/http";
import axios from "axios";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { initialData, type FormState } from "../__types";
import DateInput from "@/components/DateInput";
import PreviewImage from "@/components/PreviewImage";

type Props = {
  refetch?: () => void;
};

const FormTambahKehadiran = ({ refetch = () => {} }: Props) => {
  const { isOpen, mode, closeDialog } = useDialog();

  const [state, setState] = useState<FormState>({
    data: initialData,
    pegawai: null,
    loading: false,
    errors: {},
  });

  const [preview, setPreview] = useState<{
    bukti_dukung?: string;
  }>({});

  const fotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen)
      return setState({
        data: initialData,
        pegawai: null,
        loading: false,
        errors: {},
      });

    if (fotoRef.current) fotoRef.current.value = "";
    setPreview({ bukti_dukung: "" });
  }, [isOpen]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.preventDefault();

    const { name, value } = e.target;

    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data!,
        [name]: value,
      },
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files?.length) return;

    const file = files[0];

    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data!,
        bukti_dukung: file,
      },
    }));

    setPreview((prev) => ({
      ...prev,
      [name]: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!state.data) return;

    const fd = new FormData();

    Object.entries(state.data).forEach(([key, value]) => {
      if (value === null || value === "") return;
      if (value instanceof File) {
        fd.append(key, value);
      } else {
        fd.append(key, String(value));
      }
    });

    setState((prev) => ({ ...prev, loading: true, errors: {} }));

    try {
      await http.post("/api/v1/kehadiran", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setState((prev) => ({ ...prev, loading: false }));
      closeDialog();
      refetch();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = err.response;

        if (error?.status === 422 && error.data?.errors) {
          setState((prev) => ({
            ...prev,
            loading: false,
            errors: error.data?.errors,
          }));
          return;
        }
      }
    }
  };

  if (mode !== "add") return null;

  return (
    <section
      onClick={(e) => e.stopPropagation()}
      className={`max-h-full w-full max-w-xl space-y-3 overflow-y-auto rounded-sm bg-white p-3 shadow transition-all duration-300 ${
        isOpen ? "scale-100" : "scale-95"
      }`}
    >
      <h2 className="font-semibold lg:text-lg">Tambah Kehadiran</h2>
      <form
        onSubmit={handleSubmit}
        className="grid w-full gap-3 space-y-2 md:grid-cols-2"
      >
        <div className="space-y-1 md:col-span-2">
          <Combobox
            datas="/api/v1/petugas-kehadiran"
            labelKey="nama"
            valueKey="old_id"
            placeholder="Cari NIK/Nama Pegawai"
            className="bg-white"
            value={state.data?.pegawai_id ?? ""}
            // onChange={(value) =>
            //   setState((prev) => ({
            //     ...prev,
            //     data: {
            //       ...prev.data!,
            //       pegawai_id: value ? Number(value) : null,
            //     },
            //   }))
            // }
            onChange={async (value) => {
              if (!value) {
                setState((prev) => ({
                  ...prev,
                  data: { ...prev.data!, pegawai_id: null },
                  pegawai: null,
                }));
                return;
              }

              const pegawaiId = Number(value);

              setState((prev) => ({
                ...prev,
                data: { ...prev.data!, pegawai_id: pegawaiId },
              }));

              try {
                const res = await http.get(
                  `/api/v1/petugas-kehadiran/${pegawaiId}`,
                );

                setState((prev) => ({
                  ...prev,
                  pegawai: {
                    nama: res.data.nama,
                    department: res.data.department?.DeptName,
                    penugasan: res.data.jabatan?.nama,
                  },
                }));
              } catch {
                console.error('Terjadi kesalahan pada server.');
              }
            }}
          />
          {state.errors.pegawai_id && (
            <p className="text-sm text-red-500">{state.errors.pegawai_id}</p>
          )}
        </div>
        <div className="space-y-1 text-sm md:col-span-2">
          <p>
            <span className="font-medium">Nama:</span>{" "}
            {state.pegawai?.nama ?? ""}
          </p>
          <p>
            <span className="font-medium">Department:</span>{" "}
            {state.pegawai?.department ?? ""}
          </p>
          <p>
            <span className="font-medium">Penugasan:</span>{" "}
            {state.pegawai?.penugasan ?? ""}
          </p>
        </div>
        <div className="space-y-1 md:col-span-2">
          <Combobox
            datas={[
              { value: 0, label: "Masuk" },
              { value: 1, label: "Pulang" },
            ]}
            label="Tipe Kehadiran"
            labelKey="label"
            valueKey="value"
            placeholder="Pilih tipe kehadiran"
            className="bg-white"
            value={state.data?.check_type ?? ""}
            onChange={(value) => {
              setState((prev) => ({
                ...prev,
                data: {
                  ...prev.data!,
                  check_type: value !== null ? Number(value) : null,
                },
              }));
            }}
          />
          {state.errors.check_type && (
            <p className="text-sm text-red-500">{state.errors.check_type}</p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="tanggal" className="block w-max text-sm font-medium">
            Tanggal
          </label>
          <DateInput
            id="tanggal"
            name="tanggal"
            value={state.data?.tanggal ?? ""}
            onChange={handleChange}
            placeholder="Pilih Tanggal..."
            className="w-full"
          />
          {state.errors.tanggal && (
            <p className="text-sm text-red-500">{state.errors.tanggal}</p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="jam" className="block w-max text-sm font-medium">
            Jam
          </label>
          <input
            id="jam"
            name="jam"
            type="time"
            value={state.data?.jam ?? ""}
            onChange={handleChange}
            className="h-9 w-56 w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring focus:ring-1 focus:outline-none"
          />
          {state.errors.jam && (
            <p className="text-sm text-red-500">{state.errors.jam}</p>
          )}
        </div>
        <div className="grid gap-3">
          <div className="space-y-1">
            <label
              htmlFor="bukti_dukung"
              className="block w-max text-sm font-medium"
            >
              Bukti Dukung
            </label>
            <input
              ref={fotoRef}
              id="bukti_dukung"
              name="bukti_dukung"
              type="file"
              accept="image/*"
              className="w-full cursor-pointer rounded border border-gray-300 bg-transparent px-3 py-1.5"
              onChange={handleFileChange}
            />
            {preview.bukti_dukung && (
              <a
                href={preview.bukti_dukung}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-blue-500 hover:underline md:hidden"
              >
                Lihat gambar
              </a>
            )}
            {state.errors.bukti_dukung && (
              <p className="text-sm text-red-500">
                {state.errors.bukti_dukung}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label
              htmlFor="keterangan"
              className="block w-max text-sm font-medium"
            >
              Keterangan
            </label>
            <textarea
              placeholder="Masukkan Keterangan..."
              name="keterangan"
              id="keterangan"
              className="max-h-20 min-h-9 w-56 w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring focus:ring-1 focus:outline-none"
              value={state.data?.keterangan}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="hidden md:row-span-2 md:block">
          <PreviewImage title="Bukti Dukung" image={preview.bukti_dukung} />
        </div>
        <div className="flex items-center gap-2 md:col-span-2 md:justify-end">
          <button
            type="button"
            onClick={() => closeDialog()}
            className="cursor-pointer rounded-sm bg-transparent px-3 py-1.5 text-sm font-medium transition-colors duration-200 ease-[cubic-bezier(0.65,0.05,0.36,1)] hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-sm bg-green-500 px-3 py-1.5 text-sm font-medium text-white shadow transition-colors duration-200 ease-[cubic-bezier(0.65,0.05,0.36,1)] hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-600"
            disabled={state.loading}
          >
            {state.loading ? "Loading..." : "Simpan"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default FormTambahKehadiran;
