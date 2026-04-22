import type { Pegawai } from "@/features/pegawai/types/pegawai.types";
import { LoaderCircle } from "lucide-react";
import type React from "react";

type Status = "mangkir" | "sesuai jam";
type StatusKerja = "status_masuk" | "status_pulang";

type DataTypes = {
  pegawai_id: number;
  tanggal: string;
  jam_masuk: string;
  jam_pulang: string;
  jam_telat: string;
  jam_pulang_cepat: string;
  potongan_nominal: number;
  upah_bersih: number;
  pegawai: Pegawai;
} & Partial<Record<StatusKerja, Status>>;

interface Props {
  data?: DataTypes[];
  isLoading: boolean;
}

const PetugasTable: React.FC<Props> = ({ data, isLoading }) => {
  const datas = data;

  return (
    <div className="border-border-gray-300 flex-1 overflow-auto rounded bg-white shadow">
      {isLoading && (
        <div className="flex h-full w-full items-center">
          <LoaderCircle className="mx-auto animate-spin" />
        </div>
      )}

      <table className="w-full bg-white *:text-sm">
        <thead className="sticky top-0">
          <tr className="*:border-y *:border-gray-300 *:bg-white *:p-2 *:whitespace-nowrap [&_th>span]:block">
            <th className="max-w-20">
              <span>#</span>
            </th>
            <th className="max-w-[20ch]">
              <span>NIK</span>
            </th>
            <th className="text-left">
              <span>Nama Lengkap</span>
            </th>
            <th className="text-left">
              <span>Unit Kerja</span>
            </th>
            <th className="text-left">
              <span>Penugasan</span>
            </th>
            <th className="text-left">
              <span>Kategori Kerja</span>
            </th>
            <th className="text-center">
              <span>Tanggal</span>
            </th>
            <th className="text-center">
              <span>Jam Masuk</span>
            </th>
            <th className="text-center">
              <span>Jam Pulang</span>
            </th>
            <th className="text-center">
              <span>Jam Telat</span>
            </th>
            <th className="text-center">
              <span>Jam Pulang Cepat</span>
            </th>
            <th className="text-center">
              <span>Upah Kerja</span>
            </th>
            <th className="text-center">
              <span>Potongan Upah</span>
            </th>
            <th className="text-left">
              <span>Keterangan</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {datas?.map((data, index) => {
            const shiftWord = data.pegawai.shift?.jadwal
              ?.split(",")
              .map((item) => {
                const words = item.trim().split(" ");
                const huruf = words[0]?.charAt(0) || "";
                const angka = words[1] || "";
                return huruf + angka;
              })
              .join(", ");

            return (
              <tr
                key={index}
                className="transition-colors *:border-b *:border-gray-300 *:px-2 *:py-1.5 hover:bg-gray-200"
              >
                <td className="text-center">{index + 1}</td>
                <td className="text-center font-medium">
                  {data.pegawai.badgenumber}
                </td>
                <td>{data.pegawai.nama}</td>
                <td>{data.pegawai.department?.DeptName}</td>
                <td>{data.pegawai.jabatan?.nama}</td>
                <td>
                  {shiftWord} - {data.pegawai.shift?.jam_masuk?.slice(0, 5)} s.d{" "}
                  {data.pegawai.shift?.jam_keluar?.slice(0, 5)}
                </td>
                <td className="text-center">
                  {new Date(data.tanggal).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="text-center">
                  {data.jam_masuk ? data.jam_masuk?.slice(0, 5) : "-"}
                </td>
                <td className="text-center">
                  {data.jam_pulang ? data.jam_pulang?.slice(0, 5) : "-"}
                </td>
                <td className={`text-center ${data.status_masuk === 'mangkir' && "text-red-500"}`}>
                  {/* {data.jam_telat ? data.jam_telat?.slice(0, 5) : "-"} */}
                  {/* {data.status_masuk} */}
                  {data.status_masuk === "mangkir"
                    ? "Mangkir"
                    : data.jam_telat
                      ? data.jam_telat.slice(0, 5)
                      : "-"}
                </td>
                <td className={`text-center ${data.status_pulang === 'mangkir' && "text-red-500"}`}>
                  {/* {data.jam_pulang_cepat ?? "-"} */}
                  {data.status_pulang === "mangkir"
                    ? "Mangkir"
                    : data.jam_pulang_cepat
                      ? data.jam_pulang_cepat
                      : "-"}
                </td>
                <td className="text-center">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(data.upah_bersih ?? 0)}
                </td>
                <td className="text-center">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(data.potongan_nominal ?? 0)}
                </td>
                <td className="text-center">-</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PetugasTable;
