import { useDialog } from "@/hooks/useDialog";
import {
  initialData,
  type FormJabatanState,
  type Jabatan,
} from "../types/types";
import { memo, useState, type ChangeEvent, type FormEvent } from "react";
import type { ValidationErrors } from "@/types/error.types";
import axios from "axios";
import { http } from "@/services/api/http";

import { RefreshCcw } from "lucide-react";
import { useFilterAsn } from "@/features/pns/hooks/useAsnFilter";

interface Props {
  refetch?: () => void;
}

type State = {
  loading: boolean;
  errors: ValidationErrors;
};

const FormTambah = ({ refetch = () => {} }: Props) => {
  const { isOpen, mode, closeDialog } = useDialog<Jabatan>();

  const { datas: dataAsn } = useFilterAsn();

  const [form, setForm] = useState<FormJabatanState>(initialData);
  const [state, setState] = useState<State>({
    loading: false,
    errors: {},
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.preventDefault();

    const { name, value } = e.target;

    if (name === "gaji") {
      const digit = value.replace(/\D+/g, "");
      setForm((prev) => ({ ...prev, gaji: digit ? Number(digit) : null }));
      return;
    }

    if (["kpa_id", "bp_id", "bpp_id", "pptk_id", 'kasubbag_id'].includes(name)) {
      setForm((prev) => ({
        ...prev,
        [name]: value ? Number(value) : null,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setState((prev) => ({ ...prev, loading: true }));

    try {
      await http.post("/api/v1/penugasan", form);

      refetch();
      setForm(initialData);
      setState({ loading: false, errors: {} });
      closeDialog();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = err.response;

        if (error?.status === 422 && error.data?.errors) {
          setState({ loading: false, errors: error.data?.errors });
          return;
        }
      }
    }
  };

  if (mode !== "add") return null;

  return (
    <section
      onClick={(e) => e.stopPropagation()}
      className={`max-h-full w-full max-w-xl space-y-3 overflow-y-auto rounded-sm bg-white px-3 pt-3 shadow transition-all duration-300 ${
        isOpen ? "scale-100" : "scale-95"
      }`}
    >
      <h2 className="font-semibold lg:text-lg">Tambah Penugasan</h2>
      <form
        onSubmit={handleSubmit}
        className="grid w-full gap-3 space-y-2 md:grid-cols-2"
      >
        <div className="space-y-1 text-sm md:col-span-2">
          <label htmlFor="no_rekening" className="block font-medium">
            No. Rekening
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
            type="text"
            id="no_rekening"
            name="no_rekening"
            placeholder="Masukkan nomor rekening..."
            value={form?.no_rekening ?? ""}
            onChange={handleChange}
          />
          {state.errors.no_rekening && (
            <p className="text-xs text-red-500">
              {state.errors.no_rekening[0]}
            </p>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="nama" className="block font-medium">
            Nama Penugasan
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
            type="text"
            id="nama"
            name="nama"
            placeholder="Masukkan nama jabatan..."
            value={form?.nama ?? ""}
            onChange={handleChange}
          />
          {state.errors.nama && (
            <p className="text-xs text-red-500">{state.errors.nama[0]}</p>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="gaji" className="block font-medium">
            Gaji
          </label>
          <div className="flex items-center rounded border border-gray-300 bg-transparent focus-within:ring-[1.4px]">
            <p className="w-max px-3 py-1.5 font-bold">Rp.</p>
            <input
              className="flex-1 bg-transparent py-1.5 pr-3 outline-none"
              type="text"
              id="gaji"
              name="gaji"
              placeholder="Masukkan gaji per jabatan..."
              value={form?.gaji ?? ""}
              onChange={handleChange}
            />
          </div>
          {state.errors.gaji && (
            <p className="text-xs text-red-500">{state.errors.gaji[0]}</p>
          )}
        </div>

        <div className="space-y-1 text-sm">
          <label htmlFor="kpa" className="block font-medium">
            Kuasa Pengguna Anggaran
          </label>
          <select
            name="kpa_id"
            id="kpa"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
            value={form?.kpa_id ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih KPA
            </option>
            {dataAsn &&
              dataAsn.map((data) => (
                <option key={data.id} value={data.id}>
                  {data.nama}
                </option>
              ))}
          </select>
          {state.errors.kpa && (
            <p className="text-xs text-red-500">{state.errors.kpa[0]}</p>
          )}
        </div>

        {/*  */}
        <div className="space-y-1 text-sm">
          <label htmlFor="bp" className="block font-medium">
            Bendahara Pengeluaran
          </label>
          <select
            name="bp_id"
            id="bp"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
            value={form?.bp_id ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih BP
            </option>
            {dataAsn &&
              dataAsn.map((data) => (
                <option key={data.id} value={data.id}>
                  {data.nama}
                </option>
              ))}
          </select>
          {state.errors.bp && (
            <p className="text-xs text-red-500">{state.errors.bp[0]}</p>
          )}
        </div>

        {/*  */}
        <div className="space-y-1 text-sm">
          <label htmlFor="bpp" className="block font-medium">
            Bendahara Pengeluaran Pembantu
          </label>
          <select
            name="bpp_id"
            id="bpp"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
            value={form?.bpp_id ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih BPP
            </option>
            {dataAsn &&
              dataAsn.map((data) => (
                <option key={data.id} value={data.id}>
                  {data.nama}
                </option>
              ))}
          </select>
          {state.errors.bpp && (
            <p className="text-xs text-red-500">{state.errors.bpp[0]}</p>
          )}
        </div>

        {/*  */}
        <div className="space-y-1 text-sm">
          <label htmlFor="pptk" className="block font-medium">
            PPTK
          </label>
          <select
            name="pptk_id"
            id="pptk"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
            value={form?.pptk_id ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih PPTK
            </option>
            {dataAsn &&
              dataAsn.map((data) => (
                <option key={data.id} value={data.id}>
                  {data.nama}
                </option>
              ))}
          </select>
          {state.errors.pptk && (
            <p className="text-xs text-red-500">{state.errors.pptk[0]}</p>
          )}
        </div>

        <div className="space-y-1 text-sm">
          <label htmlFor="kasubbag_id" className="block font-medium">
            Kasubbag Keuangan
          </label>
          <select
            name="kasubbag_id"
            id="kasubbag_id"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
            value={form?.kasubbag_id ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih Kasubbag Keuangan
            </option>
            {dataAsn &&
              dataAsn.map((data) => (
                <option key={data.id} value={data.id}>
                  {data.nama}
                </option>
              ))}
          </select>
          {state.errors.kasubbag_keuangan && (
            <p className="text-xs text-red-500">
              {state.errors.kasubbag_keuangan[0]}
            </p>
          )}
        </div>
        <div className="sticky bottom-0 flex w-full place-content-end gap-2 bg-white px-2 py-2 shadow md:col-span-2">
          <button
            type="button"
            onClick={() => {
              closeDialog();
              setState((prev) => ({ ...prev, errors: {} }));
            }}
            className="cursor-pointer rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-red-600"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-[10ch] cursor-pointer rounded bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-green-600"
          >
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

export default memo(FormTambah);
