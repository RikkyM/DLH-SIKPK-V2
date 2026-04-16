import { useDialog } from "@/hooks/useDialog";
import type { FormState, PegawaiAsn } from "../types";
import React from "react";
import type { ApiError, ValidationErrors } from "@/types/error.types";
import axios from "axios";
import { PnsService } from "@/services/pns.service";
import Label from "./Label";
import Input from "./Input";
import Textarea from "./Textarea";
import { RefreshCcw } from "lucide-react";
import { useDepartment } from "@/hooks/useDepartment";

interface FormAddState {
  data?: FormState;
  loading: boolean;
  errors: ValidationErrors;
}

const FormTambah = ({ refetch = () => {} }) => {
  const { isOpen, closeDialog, mode } = useDialog<PegawaiAsn>();

  const [state, setState] = React.useState<FormAddState>({
    data: undefined,
    loading: false,
    errors: {},
  });

  const { departments, loading: loadingDept } = useDepartment({
    enabled: isOpen,
  });

  const form = state.data;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    e.preventDefault();

    const { name, value } = e.target;

    // if (name === "nip") {
    //   const digit = value.replace(/\D+/g, "").slice(0, 18);
    //   setState((prev) => ({
    //     ...prev,
    //     data: {
    //       ...(form ?? ({} as FormState)),
    //       nip: digit,
    //     },
    //   }));
    //   return;
    // }

    setState((prev) => ({
      ...prev,
      data: {
        ...(form ?? ({} as FormState)),
        ...(name === "id_department"
          ? { [name]: value ? Number(value) : null }
          : { [name]: value }),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;

    setState((prev) => ({ ...prev, loading: true, errors: {} }));

    try {
      await PnsService.create(form);
      refetch();
      closeDialog();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          const payload = err.response.data as ApiError;

          if (payload?.errors)
            setState((prev) => ({ ...prev, errors: payload.errors ?? {} }));
          return;
        }
      }
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const fieldError = (name: string) => state.errors?.[name]?.[0];

  if (mode !== "add") return;

  return (
    <section
      onClick={(e) => e.stopPropagation()}
      className={`w-full max-w-3xl space-y-3 rounded-sm bg-white p-3 shadow transition-all duration-300 ${
        isOpen ? "scale-100" : "scale-95"
      }`}
    >
      <h2 className="font-semibold lg:text-lg">Tambah Pegawai ASN</h2>
      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nip">NIP / NI PPPK</Label>
          <Input
            id="nip"
            name="nip"
            placeholder="Masukkan NIP..."
            value={form?.nip.trim() ?? ""}
            onChange={handleChange}
          />
          {fieldError("nip") && (
            <p className="text-xs text-red-600">{fieldError("nip")}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nama_lengkap">Nama</Label>
          <Input
            id="nama_lengkap"
            name="nama"
            placeholder="Masukkan nama lengkap..."
            value={form?.nama ?? ""}
            onChange={handleChange}
          />
          {fieldError("nama") && (
            <p className="text-xs text-red-600">{fieldError("nama")}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pangkat">Pangkat</Label>
          <Input
            id="pangkat"
            name="pangkat"
            placeholder="Masukkan pangkat..."
            value={form?.pangkat ?? ""}
            onChange={handleChange}
          />
          {fieldError("pangkat") && (
            <p className="text-xs text-red-600">{fieldError("pangkat")}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="golongan">Golongan</Label>
          <Input
            id="golongan"
            name="golongan"
            placeholder="Masukkan golongan..."
            value={form?.golongan ?? ""}
            onChange={handleChange}
          />
          {fieldError("golongan") && (
            <p className="text-xs text-red-600">{fieldError("golongan")}</p>
          )}
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="jabatan">Jabatan</Label>
          <Textarea
            name="jabatan"
            id="jabatan"
            placeholder="Masukkan jabatan..."
            className="max-h-20 min-h-14"
            value={form?.jabatan ?? ""}
            onChange={handleChange}
          />
          {fieldError("jabatan") && (
            <p className="text-xs text-red-600">{fieldError("jabatan")}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 px-3 py-1.5 text-sm transition-all duration-300 focus:shadow focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
            value={form?.role ?? ""}
            onChange={handleChange}
          >
            <option value="">Pilih Role</option>
            <option value="KABID">KABID</option>
            <option value="KATIM">KATIM</option>
            <option value="KUPTD">KUPTD</option>
            <option value="KASUBBAG">Kasubbag</option>
            <option value="BENDAHARA">Bendahara</option>
            <option value="OPERATOR">Operator</option>
            <option value="SEKRETARIAT">Sekretariat</option>
          </select>
          {fieldError("role") && (
            <p className="text-xs text-red-600">{fieldError("role")}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="unit_kerja">Unit Kerja</Label>
          {loadingDept ? (
            <RefreshCcw className="max-w-5 animate-spin" />
          ) : (
            <select
              id="unit_kerja"
              name="id_department"
              value={form?.id_department ?? ""}
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
          {fieldError("unit_kerja") && (
            <p className="text-xs text-red-600">{fieldError("unit_kerja")}</p>
          )}
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
            {state.loading ? "Loading..." : "Simpan"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default FormTambah;
