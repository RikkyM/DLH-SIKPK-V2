import DateInput from "@/components/DateInput";
import { http } from "@/services/api/http";
import { useQuery } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import React from "react";
import { useSearchParams } from "react-router-dom";

type Jabatan = {
  nama_jabatan: string;
  jumlah: number;
  upah_kerja: number;
  jumlah_hari_kerja: number;
};

type Department = {
  DeptName: string;
  total_pegawai: number;
  upah_kerja: number;
  jumlah_hari_kerja: number;
  total_upah_dibayar: number;
  jabatan: Jabatan[];
};

const RekapUpahPages = () => {
  const gridCols =
    "grid-cols-[60px_minmax(180px,1fr)_repeat(5,minmax(130px,1fr))]";

  const [searchParams, setSearchParams] = useSearchParams();

  const [open, setOpen] = React.useState<number | null>(null);
  const [filterDate, setFilterDate] = React.useState<{
    from: string;
    to: string;
  }>({
    from: searchParams.get("from_date") || "",
    to: searchParams.get("to_date") || "",
  });
  const fromDate = searchParams.get("from_date");
  const toDate = searchParams.get("to_date");

  const { from, to } = filterDate;

  const handleSearchDate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams);

    if (from && to) {
      params.set("from_date", from);
      params.set("to_date", to);
    } else {
      params.delete("from_date");
      params.delete("to_date");
    }

    setSearchParams(params);
  };

  const {
    data: datas,
    isFetching,
  } = useQuery<Department[]>({
    queryKey: ["rekap-upah-kerja", fromDate, toDate],
    queryFn: async () => {
      const { data } = await http.get("/api/v1/upah-kerja", {
        params: {
          from_date: fromDate,
          to_date: toDate,
        },
      });

      return data;
    },
  });

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4 overflow-hidden">
        <div className="flex w-full flex-col gap-4">
          <form
            onSubmit={handleSearchDate}
            className="flex items-center gap-2 overflow-x-auto py-1.5 sm:flex-wrap sm:py-0"
          >
            <span className="text-sm font-medium text-white">Tanggal:</span>
            <label htmlFor="from_date" className="flex items-center gap-2">
              <DateInput
                id="from_date"
                value={from ?? ""}
                onChange={(e) =>
                  setFilterDate((prev) => ({
                    ...prev,
                    from: e.target.value,
                  }))
                }
                placeholder="Tanggal Awal..."
                // min={fromMin || undefined}
                // max={fromMax || undefined}
              />
            </label>

            <label htmlFor="to_date" className="flex items-center gap-2">
              <DateInput
                id="to_date"
                value={to ?? ""}
                onChange={(e) =>
                  setFilterDate((prev) => ({
                    ...prev,
                    to: e.target.value,
                  }))
                }
                placeholder="Tanggal Akhir..."
                // min={toMin || undefined}
                // max={toMax || undefined}
              />
            </label>
            <button
              type="submit"
              className="cursor-pointer rounded-sm bg-blue-600 px-3 py-1 text-white shadow outline-none"
            >
              PROSES
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isFetching && (
          <div className="grid h-full w-full place-content-center overflow-auto rounded border border-gray-300 bg-white p-3 shadow">
            <RefreshCcw className="animate-spin" />
          </div>
        )}
        {datas && (
          <div className="grid w-full overflow-auto rounded border border-gray-300 bg-white p-3 shadow">
            <div
              className={`grid *:grid *:items-center ${gridCols} divide-x divide-gray-300 bg-white font-medium *:border-b *:border-gray-300 *:p-2`}
            >
              <div className="text-center">#</div>
              <div>Nama Department</div>
              <div className="text-center">Jumlah Petugas</div>
              <div className="text-center">Upah Kerja Per Hari</div>
              <div className="text-center">Jumlah Hari Kerja</div>
              <div className="text-center">Total Upah Dibayar</div>
              <div className="text-center">Total Potongan Upah</div>
            </div>

            {datas!.map((data, index) => (
              <div key={index}>
                <div
                  onClick={() =>
                    setOpen((prev) => (prev === index ? null : index))
                  }
                  className={`grid cursor-pointer ${gridCols} divide-x divide-gray-200 *:border-gray-300 *:p-2 hover:bg-gray-200`}
                >
                  <div className="text-center">{index + 1}</div>
                  <div>{data.DeptName}</div>
                  <div className="text-center">{data.total_pegawai}</div>
                  <div className="text-center">
                    {data.upah_kerja &&
                      new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(data.upah_kerja ?? 0)}
                  </div>
                  <div className="text-center">
                    {data.jumlah_hari_kerja ?? "-"}
                  </div>
                  <div className="text-center">{data.total_upah_dibayar}</div>
                  <div className="text-center">{index + 1}</div>
                </div>
                <div
                  className={`grid transition-all duration-300 ${open === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    {data.jabatan &&
                      data.jabatan.map((item, idx) => (
                        <div
                          key={idx}
                          className={`grid ${gridCols} divide-x divide-gray-300 *:p-2 [&>span]:grid [&>span]:items-center`}
                        >
                          <div />
                          <div className="grid grid-cols-[17px_minmax(120px,1fr)] text-sm">
                            <span>
                              {String.fromCharCode(97 + idx).toUpperCase()}.
                            </span>
                            <span>{item.nama_jabatan}</span>
                          </div>
                          <span className="text-center">{item.jumlah}</span>
                          <span className="text-center">
                            {item.upah_kerja &&
                              new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                              }).format(item.upah_kerja)}
                          </span>
                          <span className="text-center">
                            {item.jumlah_hari_kerja}
                          </span>
                          <span className="text-center">asd</span>
                          <span className="text-center">asd</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RekapUpahPages;
