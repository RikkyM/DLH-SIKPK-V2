import DateInput from "@/components/DateInput";
import React from "react";
import { useSearchParams } from "react-router-dom";

const RekapUpahPages = () => {
  const gridCols =
    "grid-cols-[60px_minmax(160px,1fr)_repeat(5,minmax(100px,1fr))]";

  const [searchParams, setSearchParams] = useSearchParams();

  const [open, setOpen] = React.useState<number | null>(null);
  const [filterDate, setFilterDate] = React.useState<{
    from: string;
    to: string;
  }>({
    from: searchParams.get("from_date") || "",
    to: searchParams.get("to_date") || "",
  });

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

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4 overflow-hidden">
        <div className="flex w-full flex-col gap-4">
          <form
            onSubmit={handleSearchDate}
            className="flex items-center gap-2 overflow-x-auto sm:flex-wrap py-1.5 sm:py-0"
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

      <div className="flex-1 overflow-auto rounded border border-gray-300 bg-white shadow">

        <div className="grid w-full overflow-auto p-3">
          <div
            className={`grid ${gridCols} divide-x divide-gray-300 font-medium *:border-b *:border-gray-300 *:p-2`}
          >
            <div className="text-center">#</div>
            <div>Nama Department</div>
            <div className="text-center">Jumlah Petugas</div>
            <div className="text-center">Upah Kerja Per Hari</div>
            <div className="text-center">Jumlah Hari Kerja</div>
            <div className="text-center">Total Upah Dibayar</div>
            <div className="text-center">Total Potongan Upah</div>
          </div>

          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index}>
              <div
                onClick={() =>
                  setOpen((prev) => (prev === index ? null : index))
                }
                className={`grid cursor-pointer ${gridCols} divide-x divide-gray-200 *:border-b *:border-gray-300 *:p-2 hover:bg-gray-300`}
              >
                <div className="text-center">{index + 1}</div>
                <div>Department {index + 1}</div>
                <div className="text-center">{index + 1}</div>
                <div className="text-center">{index + 1}</div>
                <div className="text-center">{index + 1}</div>
                <div className="text-center">{index + 1}</div>
                <div className="text-center">{index + 1}</div>
              </div>
              <div
                className={`grid transition-all duration-300 ${open === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="col-span-3 overflow-hidden">
                  {[
                    "Crew Angkutan Sampah",
                    "Penyapuan",
                    "Penyapuan Keliling",
                    "Sopir Angkutan Sampah",
                  ].map((data, idx, arr) => (
                    <div
                      className={`grid ${gridCols} divide-x divide-gray-300 *:p-2 ${idx === arr.length - 1 ? "border-b border-gray-300" : ""} `}
                    >
                      <div />
                      <div className="text-sm grid grid-cols-[17px_minmax(120px,1fr)]">
                        <span>{String.fromCharCode(97 + idx)}.</span>
                        <span>{data}</span>
                      </div>
                      <div className="text-center">asd</div>
                      <div className="text-center">asd</div>
                      <div className="text-center">asd</div>
                      <div className="text-center">asd</div>
                      <div className="text-center">asd</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RekapUpahPages;
