import DateInput from "@/components/DateInput";
import type { Pegawai } from "@/features/pegawai/types/pegawai.types";
import { http } from "@/services/api/http";
import { useQuery } from "@tanstack/react-query";
// import { LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

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
};

const UpahPetugasPages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState({
    from: searchParams.get("from_date") || null,
    to: searchParams.get("to_date") || null,
  });

  const badgenumber = searchParams.get("badgenumber");
  const department = searchParams.get("department");
  const penugasan = searchParams.get("penugasan");

  const handleSearchDate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);

    if (date.from && date.to) {
      params.set("from_date", date.from);
      params.set("to_date", date.to);
    }

    setSearchParams(params);
  };

  const {
    data: datas,
    // isLoading,
    // error,
  } = useQuery<DataTypes[]>({
    queryKey: [
      "gaji-petugas",
      badgenumber,
      department,
      penugasan,
      date.from,
      date.to,
    ],
    queryFn: async () => {
      const { data } = await http.get("/api/v1/gaji-petugas", {
        params: {
          badgenumber,
          department,
          penugasan,
          from_date: date.from,
          to_date: date.to,
        },
      });

      return data.data;
    },
  });

  //   console.log(datas);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4 overflow-hidden">
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-2">
            <form
              onSubmit={handleSearchDate}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-sm font-medium text-white">Tanggal:</span>
              <label htmlFor="from_date" className="flex items-center gap-2">
                <DateInput
                  id="from_date"
                  value={date.from || ""}
                  onChange={(e) =>
                    setDate((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                  max={date.to || ""}
                  placeholder="Tanggal Awal..."
                />
              </label>

              <label htmlFor="to_date" className="flex items-center gap-2">
                <DateInput
                  id="to_date"
                  value={date.to || ""}
                  onChange={(e) =>
                    setDate((prev) => ({
                      ...prev,
                      to: e.target.value,
                    }))
                  }
                  min={date.from || ""}
                  placeholder="Tanggal Akhir..."
                />
              </label>
              <button
                type="submit"
                className="cursor-pointer rounded-sm bg-blue-600 px-3 py-1 text-white shadow outline-none"
              >
                Cari
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-border-gray-300 flex-1 overflow-auto rounded bg-white shadow">
        {/* <div className="flex h-full w-full items-center">
          <LoaderCircle className="mx-auto animate-spin" />
        </div> */}

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
                    {shiftWord} - {data.pegawai.shift?.jam_masuk?.slice(0, 5)}{" "}
                    s.d {data.pegawai.shift?.jam_keluar?.slice(0, 5)}
                  </td>
                  <td className="text-center">
                    {new Date(data.tanggal).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="text-center">{data.jam_masuk?.slice(0, 5)}</td>
                  <td className="text-center">
                    {data.jam_pulang?.slice(0, 5)}
                  </td>
                  <td className="text-center">{data.jam_telat?.slice(0, 5)}</td>
                  <td className="text-center">{data.jam_pulang_cepat}</td>
                  <td className="text-center">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(data.pegawai.jabatan.gaji ?? 0)}
                  </td>
                  <td className="text-center">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(data.potongan_nominal ?? 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UpahPetugasPages;
