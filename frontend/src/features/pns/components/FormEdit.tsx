import { useDialog } from "@/hooks/useDialog";
import { initialState, type FormState, type PegawaiAsn } from "../types";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { ApiError, ValidationErrors } from "@/types/error.types";
import axios from "axios";
import Input from "./Input";
import Label from "./Label";
import FieldError from "./FieldError";
import Textarea from "./Textarea";
import { useDepartment } from "@/hooks/useDepartment";
import { http } from "@/services/api/http";
import { RefreshCcw } from "lucide-react";

const FormEdit = ({ refetch = () => {} }: { refetch?: () => void }) => {
  const { isOpen, data, closeDialog } = useDialog<PegawaiAsn>();

  const [formData, setFormData] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const { departments, loading: loadingDept } = useDepartment({
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen || !data?.id) return setErrors({});

    setFormData((prev) => ({
      ...prev,
      ...initialState,
      ...data,
    }));

    setErrors({});
  }, [data, isOpen]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    e.preventDefault();

    const { name, value } = e.target;

    if (name === "nip") {
      const digit = value.replace(/\D+/g, "");
      setFormData((prev) => ({ ...prev, nip: digit }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      ...(name === "id_department"
        ? { [name]: value ? Number(value) : null }
        : { [name]: value }),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!data?.id) return;

    setLoading(true);
    setErrors({});

    try {
      await http.put(`/api/v1/pegawai-asn/${data.id}`, formData);

      refetch();
      closeDialog();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          const payload = err.response.data as ApiError;

          if (payload?.errors) setErrors(payload.errors);
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const errorMessage = useMemo(() => {
    const out: Record<string, string | undefined> = {};

    for (const [key, arr] of Object.entries(errors)) {
      out[key] = arr?.[0];
    }

    return out as Partial<Record<keyof FormState, string>>;
  }, [errors]);

  return (
    <section
      onClick={(e) => e.stopPropagation()}
      className={`w-full max-w-3xl space-y-3 rounded-sm bg-white p-3 shadow transition-all duration-300 ${
        isOpen ? "scale-100" : "scale-95"
      }`}
    >
      <h2 className="font-semibold lg:text-lg">Edit Pegawai ASN</h2>
      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nip">NIP / NI PPPK</Label>
          <Input
            id="nip"
            name="nip"
            placeholder="Masukkan NIP..."
            value={formData?.nip.trim() ?? ""}
            onChange={handleChange}
          />
          <FieldError errors={errorMessage.nip} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nama_lengkap">Nama</Label>
          <Input
            id="nama_lengkap"
            name="nama"
            placeholder="Masukkan nama lengkap..."
            value={formData?.nama ?? ""}
            onChange={handleChange}
          />
          <FieldError errors={errorMessage.nama} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pangkat">Pangkat</Label>
          <Input
            id="pangkat"
            name="pangkat"
            placeholder="Masukkan pangkat..."
            value={formData?.pangkat ?? ""}
            onChange={handleChange}
          />
          <FieldError errors={errorMessage.pangkat} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="golongan">Golongan</Label>
          <Input
            id="golongan"
            name="golongan"
            placeholder="Masukkan golongan..."
            value={formData?.golongan ?? ""}
            onChange={handleChange}
          />
          <FieldError errors={errorMessage.golongan} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="jabatan">Jabatan</Label>
          <Textarea
            name="jabatan"
            id="jabatan"
            placeholder="Masukkan jabatan..."
            className="max-h-20 min-h-14"
            value={formData?.jabatan ?? ""}
            onChange={handleChange}
          />
          <FieldError errors={errorMessage.jabatan} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 px-3 py-1.5 text-sm transition-all duration-300 focus:shadow focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
            value={formData?.role ?? ""}
            onChange={handleChange}
          >
            <option value="">Pilih Role</option>
            <option value="KABID">KABID</option>
            <option value="KATIM">KATIM</option>
            <option value="KUPTD">KUPTD</option>
            <option value="KASUBBAG">Kasubbag</option>
            <option value="BENDAHARA">Bendahara</option>
            <option value="OPERATOR">Operator</option>
          </select>
          <FieldError errors={errorMessage.role} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="unit_kerja">Unit Kerja</Label>
          {loadingDept ? (
            <RefreshCcw className="max-w-5 animate-spin" />
          ) : (
            <select
              id="unit_kerja"
              name="id_department"
              value={formData.id_department ?? ""}
              onChange={handleChange}
              className="w-full cursor-pointer appearance-none rounded border border-gray-300 px-3 py-1.5 text-sm transition-all duration-300 focus:shadow focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
            >
              <option value="">Pilih Unit Kerja</option>
              {departments
                .filter((dept) => dept.DeptName !== "NON AKTIF")
                .map((dept) => (
                  <option key={dept.DeptID} value={dept.DeptID}>
                    {dept.DeptName}
                  </option>
                ))}
            </select>
          )}
          <FieldError errors={errorMessage.id_department} />
        </div>
        <div className="flex items-center gap-2 place-self-end md:col-span-2">
          <button
            type="button"
            onClick={() => closeDialog()}
            className="cursor-pointer rounded bg-transparent px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-gray-300 focus:outline-none"
          >
            Batal
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-600 focus:outline-none"
          >
            {loading ? "Loading..." : "Simpan"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default FormEdit;
