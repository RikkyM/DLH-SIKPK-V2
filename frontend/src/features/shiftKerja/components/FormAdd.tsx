import { useDialog } from "@/hooks/useDialog";
import { RefreshCcw } from "lucide-react";
import React, { useEffect } from "react";
import { initialData, type FormShiftKerjaState } from "../__types";
import type { ValidationErrors } from "@/types/error.types";
import { http } from "@/services/api/http";
import axios from "axios";

type StateType = {
  loading: boolean;
  error: ValidationErrors;
};

const FormAdd = ({ refetch = () => {} }: { refetch: () => void }) => {
  const { isOpen, mode, closeDialog } = useDialog();

  const [form, setForm] = React.useState<FormShiftKerjaState>(initialData);
  const [state, setState] = React.useState<StateType>({
    loading: false,
    error: {},
  });

  useEffect(() => {
    setForm(initialData);
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (
    field: "telat" | "pulang_cepat",
    idx: number,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === idx ? value : item)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setState((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const payload = {
        ...form,
        telat: form.telat.filter((t) => t !== ""),
        pulang_cepat: form.pulang_cepat.filter((p) => p !== ""),
      };

      await http.post("/api/v1/shift-kerja", payload);

      refetch();
      setState((prev) => ({
        ...prev,
        loading: false,
      }));
      closeDialog();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const error = err.response;

        if (error?.status === 422 && error.data?.errors) {
          setState((prev) => ({
            ...prev,
            error: error.data?.errors,
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
      className={`w-full max-w-xl space-y-3 rounded-sm bg-white p-3 shadow transition-all duration-300 ${
        isOpen ? "scale-100" : "scale-95"
      }`}
    >
      <h2 className="font-semibold lg:text-lg">Tambah Kategori Kerja</h2>
      <form
        onSubmit={handleSubmit}
        className="grid w-full gap-3 space-y-2 md:grid-cols-2"
      >
        <div className="space-y-1 text-sm md:col-span-2">
          <label htmlFor="jadwal" className="block font-medium">
            Jadwal Kategori Kerja
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="text"
            id="jadwal"
            name="jadwal"
            placeholder="Masukkan jadwal kategori kerja..."
            value={form?.jadwal || ""}
            onChange={handleChange}
          />
          {state.error.jadwal && (
            <p className="text-xs text-red-500">{state.error.jadwal[0]}</p>
          )}
        </div>
        <div className="space-y-1 text-sm md:col-span-2">
          <label htmlFor="masuk" className="block font-medium">
            Jam Masuk
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="time"
            step={1}
            id="masuk"
            name="jam_masuk"
            value={form?.jam_masuk || ""}
            onChange={handleChange}
          />
          {state.error.jam_masuk && (
            <p className="text-xs text-red-500">{state.error.jam_masuk[0]}</p>
          )}
        </div>
        <div className="space-y-1 text-sm md:col-span-2">
          <label htmlFor="pulang" className="block font-medium">
            Jam Pulang
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="time"
            step={1}
            id="pulang"
            name="jam_keluar"
            value={form?.jam_keluar || ""}
            onChange={handleChange}
          />
          {state.error.jam_keluar && (
            <p className="text-xs text-red-500">{state.error.jam_keluar[0]}</p>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="telat1" className="block font-medium">
            Jam Telat 1
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="time"
            step={1}
            id="telat1"
            name="telat[0]"
            value={form?.telat[0] || ""}
            onChange={(e) => handleArrayChange("telat", 0, e.target.value)}
          />
          {state.error["telat.0"] && (
            <p className="text-xs text-red-500">{state.error["telat.0"][0]}</p>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="telat2" className="block font-medium">
            Jam Telat 2
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="time"
            step={1}
            id="telat2"
            name="telat[1]"
            value={form?.telat[1] || ""}
            onChange={(e) => handleArrayChange("telat", 1, e.target.value)}
          />
          {state.error["telat.1"] && (
            <p className="text-xs text-red-500">{state.error["telat.1"][0]}</p>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="pulang1" className="block font-medium">
            Jam Pulang Cepat 1
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="time"
            step={1}
            id="pulang1"
            name="pulang_cepat[0]"
            value={form?.pulang_cepat[0] || ""}
            onChange={(e) =>
              handleArrayChange("pulang_cepat", 0, e.target.value)
            }
          />
          {state.error["pulang_cepat.0"] && (
            <p className="text-xs text-red-500">
              {state.error["pulang_cepat.0"][0]}
            </p>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="pulang2" className="block font-medium">
            Jam Pulang Cepat 2
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="time"
            step={1}
            id="pulang2"
            name="pulang_cepat[1]"
            value={form?.pulang_cepat[1] || ""}
            onChange={(e) =>
              handleArrayChange("pulang_cepat", 1, e.target.value)
            }
          />
          {state.error["pulang_cepat.1"] && (
            <p className="text-xs text-red-500">
              {state.error["pulang_cepat.1"][0]}
            </p>
          )}
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
          <button className="w-[10ch] cursor-pointer rounded bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-green-600">
            {state.loading ? (
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

export default FormAdd;
