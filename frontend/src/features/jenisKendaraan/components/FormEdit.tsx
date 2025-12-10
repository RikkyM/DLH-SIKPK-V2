import { useDialog } from "@/hooks/useDialog";
import type { JenisKendaraan } from "../types/types";
import { useEffect, useState, type FormEvent } from "react";

// type JenisKendaraanForm = {
//   nama: string;
// };

// type JenisKendaraanErrors = Partial<
//   Record<keyof JenisKendaraanForm, string[]>
// > & {
//   [key: string]: string[] | undefined;
// };

const FormEdit = () => {
  const { isOpen, data, closeDialog } = useDialog<JenisKendaraan>();

  const [formData, setFormData] = useState({
    nama: "",
  });
  //   const [loading, setLoading] = useState(false);
  //   const [error, setError] = useState<JenisKendaraanErrors>({});
  console.log(formData);

  useEffect(() => {
    if (!isOpen || !data) return;

    setFormData({
      nama: data.nama || "",
    });
  }, [data, isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data?.id) return;

    // setLoading(true);
    // setError({});

    // try {
    //   // const res = await
    // } catch (err) {}
  };

  return (
    <section
      onClick={(e) => e.stopPropagation()}
      className={`w-full space-y-3 rounded-sm bg-white p-3 shadow transition-all duration-300 ${
        isOpen ? "scale-100" : "scale-95"
      }`}
    >
      <h2 className="font-semibold lg:text-lg">Edit Jenis Kendaraan</h2>
      <form onSubmit={handleSubmit} className="w-full space-y-2">
        <div className="space-y-1 text-sm">
          <label htmlFor="nama" className="block font-medium">
            Nama Jenis Kendaraan
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5"
            type="text"
            id="nama"
            name="nama"
            placeholder="Masukkan nama unit kerja..."
            value={data?.nama || ""}
            onChange={(e) => setFormData({ nama: e.target.value })}
          />
        </div>
        <div className="flex w-full place-content-end gap-2">
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

export default FormEdit;
