import Pagination from "@/components/Pagination";
import { usePegawai } from "@/features/pegawai/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useSyncKehadiran } from "@/hooks/useSyncKehadiran";
import { LoaderCircle, RefreshCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CHECK_TYPES = [
  { type: 0, key: "masuk", label: "M" }, // Masuk
  { type: 1, key: "keluar", label: "K" }, // Keluar
];

const RekapKehadiranPages = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination(10);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const {
    pegawai,
    loading: loadingData,
    refetch,
  } = usePegawai(perPage, currentPage, debouncedSearch, department);

  const { loading: loadingKehadiran, handleSync } = useSyncKehadiran(refetch);

  const getLast7Days = () => {
    const days: string[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
      days.push(iso);
    }

    return days;
  };

  const formatTanggalID = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const last7Days = useMemo(() => getLast7Days(), []);

  const tableRows = useMemo(() => {
    return pegawai?.data.map((p, index) => (
      <tr
        key={p.id ?? index}
        className="border-b border-gray-200 transition-colors hover:bg-gray-200"
      >
        <td className="px-4 py-1.5 text-center">
          {(currentPage - 1) * perPage + index + 1}
        </td>
        <td className="px-4 py-1.5 text-center font-medium">{p.badgenumber}</td>
        <td className="px-4 py-1.5">{p.nama}</td>

        {/* Per tanggal, per check_type (M / K / L) */}
        {last7Days.map((tanggal) =>
          CHECK_TYPES.map((ct) => {
            const record = p.kehadirans?.find(
              (k) =>
                k.check_time?.slice(0, 10) === tanggal &&
                Number(k.check_type) === ct.type,
            );

            const jam = record
              ? record.check_time.slice(11, 16) // HH:MM
              : null;

            return (
              <td
                key={`${p.id}-${tanggal}-${ct.key}`}
                className="px-4 py-1.5 text-center"
              >
                {jam ? (
                  <span className="text-xs font-medium">{jam}</span>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </td>
            );
          }),
        )}
      </tr>
    ));
  }, [pegawai?.data, currentPage, perPage, last7Days]);

  useEffect(() => {
    document.title = "Kehadiran";
  }, []);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-4">
          <label
            htmlFor="per_page"
            className="flex w-full w-max items-center gap-2 rounded"
          >
            <span className="text-sm font-medium">Show:</span>
            <select
              name="per_page"
              id="per_page"
              className="h-full w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none"
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
            </select>
            <span className="text-sm text-gray-500">entries</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Pilih Tanggal:</span>
            <label htmlFor="from_date" className="flex items-center gap-2">
              <input
                id="from_date"
                type="date"
                className="h-9 w-56 rounded border border-gray-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
            </label>
            <label htmlFor="to_date" className="flex items-center gap-2">
              <input
                id="to_date"
                type="date"
                className="h-9 w-56 rounded border border-gray-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="search" className="flex items-center gap-2">
              <span className="text-sm font-medium">Search:</span>
              <input
                id="search"
                type="search"
                placeholder="Cari NIK / Nama..."
                className="h-9 w-56 rounded border border-gray-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <span>Filter:</span>
            <label
              htmlFor="jabatan"
              className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 pr-2 focus-within:ring-1 focus-within:ring-blue-400"
            >
              <select
                name="jabatan"
                id="jabatan"
                className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                value={""}
                onChange={() => {}}
              >
                <option value="" disabled hidden>
                  Jabatan
                </option>
              </select>
              <button type="button">
                <X className="pointer-events-none max-w-5 opacity-30" />
              </button>
            </label>
            <label
              htmlFor="department"
              className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 pr-2 focus-within:ring-1 focus-within:ring-blue-400"
            >
              <select
                name="department"
                id="department"
                className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                value={department ?? ""}
                onChange={() => {
                  setDepartment("");
                }}
              >
                <option value="" disabled hidden>
                  Department
                </option>
              </select>
              <button
                type="button"
                // onClick={() => setDepartment("")}
                // className={`${
                //   department ? "cursor-pointer" : "cursor-default"
                // }`}
              >
                {/* <X
                  className={`max-w-5 ${
                    department
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-50"
                  }`}
                /> */}
                <X className="pointer-events-none max-w-5 opacity-30" />
              </button>
            </label>
            <label
              htmlFor="shift_kerja"
              className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 pr-2 focus-within:ring-1 focus-within:ring-blue-400"
            >
              <select
                name="shift_kerja"
                id="shift_kerja"
                className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                value={""}
                onChange={() => {}}
              >
                <option value="" disabled hidden>
                  Shift Kerja
                </option>
              </select>
              <button
                type="button"
                // onClick={() => setDepartment("")}
                // className={`${
                //   department ? "cursor-pointer" : "cursor-default"
                // }`}
              >
                {/* <X
                  className={`max-w-5 ${
                    department
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-50"
                  }`}
                /> */}
                <X className="pointer-events-none max-w-5 opacity-30" />
              </button>
            </label>
            <label
              htmlFor="korlap"
              className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 pr-2 focus-within:ring-1 focus-within:ring-blue-400"
            >
              <select
                name="korlap"
                id="korlap"
                className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                value={""}
                onChange={() => {}}
              >
                <option value="" disabled hidden>
                  Korlap
                </option>
              </select>
              <button
                type="button"
                // onClick={() => setDepartment("")}
                // className={`${
                //   department ? "cursor-pointer" : "cursor-default"
                // }`}
              >
                {/* <X
                  className={`max-w-5 ${
                    department
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-50"
                  }`}
                /> */}
                <X className="pointer-events-none max-w-5 opacity-30" />
              </button>
            </label>
          </div>
        </div>
        <button
          className="max-h-10 w-max min-w-[17ch] cursor-pointer self-end rounded bg-green-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none md:text-sm"
          onClick={handleSync}
        >
          {loadingKehadiran ? (
            <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
          ) : (
            <div className="flex items-center justify-center gap-2">
              <div>
                <RefreshCcw className="mx-auto max-h-5 max-w-4" />
              </div>
              Fetch Data
            </div>
          )}
        </button>
      </div>
      <div className="flex-1 overflow-auto rounded border border-gray-300 px-2 shadow">
        {loadingData ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : pegawai?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">Tidak ada data pegawai</p>
          </div>
        ) : (
          <table className="w-full bg-white *:text-sm">
            <thead className="sticky top-0">
              {/* HEADER BARIS 1: kolom identitas + tanggal (colSpan 3) */}
              <tr className="*:border-y *:border-gray-300 *:bg-white *:p-2 *:whitespace-nowrap [&_th>span]:block">
                <th rowSpan={2} className="max-w-20 align-middle">
                  <span>#</span>
                </th>
                <th rowSpan={2} className="max-w-[20ch] align-middle">
                  <span>NIK</span>
                </th>
                <th rowSpan={2} className="text-left align-middle">
                  <span>Nama Lengkap</span>
                </th>

                {last7Days.map((tanggal) => (
                  <th
                    key={tanggal}
                    className="text-center"
                    colSpan={CHECK_TYPES.length}
                  >
                    <span>{formatTanggalID(tanggal)}</span>
                  </th>
                ))}
              </tr>

              {/* HEADER BARIS 2: M / K / L di bawah tiap tanggal */}
              <tr className="*:border-y *:border-gray-300 *:bg-white *:p-2 *:whitespace-nowrap [&_th>span]:block">
                {last7Days.map((tanggal) =>
                  CHECK_TYPES.map((ct) => (
                    <th key={`${tanggal}-${ct.key}`} className="text-center">
                      <span>{ct.label}</span>
                    </th>
                  )),
                )}
              </tr>
            </thead>

            <tbody>{tableRows}</tbody>
          </table>
        )}
      </div>
      {pegawai && pegawai?.success != true && pegawai?.data?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={pegawai.last_page}
          from={pegawai.from}
          to={pegawai.to}
          total={pegawai.total}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default RekapKehadiranPages;
