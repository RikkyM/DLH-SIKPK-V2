import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, X } from "lucide-react";

import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useGaji } from "../hooks/useGaji";
import DateInput from "@/components/DateInput";
import { useDepartment } from "@/hooks/useDepartment";
import { useJabatan } from "@/features/jabatan/hooks/useJabatan";

const toISODate = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);

  return local.toISOString().split("T")[0];
};

const UpahPages = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { departments } = useDepartment();
  const { penugasan } = useJabatan();

  const { gaji, loading } = useGaji(
    perPage,
    currentPage,
    debouncedSearch,
    fromDate,
    toDate,
    department,
    jabatan,
  );

  const { fromMin, fromMax, toMin, toMax } = useMemo(() => {
    let fMin = "";
    let fMax = "";
    let tMin = "";
    let tMax = "";

    if (toDate) {
      const to = new Date(toDate);

      fMax = toISODate(to);

      const minCandidate = new Date(to);
      minCandidate.setMonth(minCandidate.getMonth() - 1);
      fMin = toISODate(minCandidate);

      tMin = fMin;
      tMax = fMax;
    }

    if (fromDate) {
      const from = new Date(fromDate);

      tMin = toISODate(from);

      const maxCandidate = new Date(from);
      maxCandidate.setMonth(maxCandidate.getMonth() + 1);
      tMax = toISODate(maxCandidate);
    }

    return { fromMin: fMin, fromMax: fMax, toMin: tMin, toMax: tMax };
  }, [fromDate, toDate]);

  useEffect(() => {
    if (!toDate || !fromDate) return;

    if (fromMax && fromDate > fromMax) {
      setFromDate(fromMax);
      return;
    }

    if (fromMin && fromDate < fromMin) {
      setFromDate(fromMin);
    }
  }, [fromDate, fromMin, fromMax, toDate]);

  const tableRows = useMemo(
    () =>
      gaji?.data?.map((k, i) => (
        <tr
          key={k.id ?? i}
          className="transition-colors *:border-b *:border-gray-300 *:px-2 *:py-1.5 hover:bg-gray-200"
        >
          <td className="text-center">{(currentPage - 1) * perPage + i + 1}</td>
          <td className="text-center font-medium">{k.badgenumber}</td>
          <td>{k.nama}</td>
          <td>{k.jabatan ?? "-"}</td>
          <td>{k.department}</td>
          <td className="text-center">{k.jumlah_hari}</td>
          <td className="text-center">{k.jumlah_masuk}</td>
          <td className="text-center">Rp. 100.000</td>
          <td className="text-center">Rp. 0</td>
        </tr>
      )),
    [gaji?.data, currentPage, perPage],
  );

  useEffect(() => {
    document.title = "SPJ Gaji";
  }, []);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4 overflow-hidden">
        <div className="flex w-full flex-col gap-4">
          {/* Per page */}
          <label
            htmlFor="per_page"
            className="flex w-full w-max items-center gap-2 rounded"
          >
            <span className="text-sm font-semibold text-white">Show:</span>
            <select
              name="per_page"
              id="per_page"
              className="h-full w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none"
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="-1">Semua</option>
            </select>
            <span className="text-sm text-gray-200">entries</span>
          </label>

          <div className="flex w-full flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-white">
              Pilih Tanggal:
            </span>

            <label htmlFor="from_date" className="flex items-center gap-2">
              <DateInput
                id="from_date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="Tanggal Awal..."
                min={fromMin || undefined}
                max={fromMax || undefined}
              />
            </label>

            <label htmlFor="to_date" className="flex items-center gap-2">
              <DateInput
                id="to_date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="Tanggal Akhir..."
                min={toMin || undefined}
                max={toMax || undefined}
              />
            </label>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2">
            <label htmlFor="search" className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Search:</span>
              <input
                id="search"
                type="search"
                placeholder="Cari NIK / Nama..."
                className="h-9 w-full max-w-56 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handlePageChange(1);
                }}
              />
            </label>
            <label
              htmlFor="department"
              className="relative flex w-full w-max items-center gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400"
            >
              <select
                name="department"
                id="department"
                className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                value={department ?? ""}
                onChange={(e) => {
                  setDepartment(e.target.value);
                }}
              >
                <option value="" disabled hidden>
                  Unit Kerja
                </option>
                {departments
                  ?.filter(
                    (department) =>
                      department.DeptName !== "NON AKTIF" &&
                      department.DeptName !== "",
                  )
                  .map((department, index) => (
                    <option
                      key={department.DeptID ?? index}
                      value={department.DeptID}
                      className="text-xs font-medium"
                    >
                      {department?.DeptName}
                    </option>
                  ))}
              </select>
              <button
                onClick={() => setDepartment("")}
                className={`${
                  department ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <X
                  className={`max-w-5 ${
                    department
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-30"
                  } `}
                />
              </button>
            </label>
            <label
              htmlFor="penugasan"
              className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400"
            >
              <select
                name="penugasan"
                id="penugasan"
                className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
              >
                <option value="" disabled hidden>
                  Penugasan
                </option>
                {penugasan?.map((p, index) => (
                  <option
                    key={p.id ?? index}
                    value={p.id}
                    className="text-xs font-medium"
                  >
                    {p?.nama}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setJabatan("")}
                className={`${jabatan ? "cursor-pointer" : "cursor-default"}`}
              >
                <X
                  className={`max-w-5 ${
                    jabatan
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-30"
                  } `}
                />
              </button>
            </label>
            <label
              htmlFor="shift_kerja"
              className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400"
            >
              <select
                name="shift_kerja"
                id="shift_kerja"
                className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                value={""}
              >
                <option value="" disabled hidden>
                  Kategori Kerja
                </option>
              </select>
              <button
                onClick={() => setJabatan("")}
                className={`${jabatan ? "cursor-pointer" : "cursor-default"}`}
              >
                <X
                  className={`max-w-5 ${
                    jabatan
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-30"
                  } `}
                />
              </button>
            </label>
            <label
              htmlFor="korlap"
              className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400"
            >
              <select
                name="korlap"
                id="korlap"
                className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                value={""}
              >
                <option value="" disabled hidden>
                  Korlap
                </option>
              </select>
              <button
                onClick={() => setJabatan("")}
                className={`${jabatan ? "cursor-pointer" : "cursor-default"}`}
              >
                <X
                  className={`max-w-5 ${
                    jabatan
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-30"
                  } `}
                />
              </button>
            </label>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded border border-gray-300 bg-white shadow">
        {loading ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : gaji?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">Tidak ada data gaji</p>
          </div>
        ) : (
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
                  <span>Penugasan</span>
                </th>
                <th className="text-left">
                  <span>Unit Kerja</span>
                </th>
                <th className="text-center">
                  <span>
                    Jumlah <br /> Hari Kerja
                  </span>
                </th>
                <th className="text-center">
                  <span>
                    Jumlah <br /> Masuk Kerja
                  </span>
                </th>
                <th className="text-center">
                  <span>
                    Gaji <br /> Upah Harian
                  </span>
                </th>
                <th className="text-center">
                  <span>
                    Total <br /> Gaji/Upah
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        )}
      </div>

      {gaji && gaji?.success !== true && gaji?.data?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={gaji.last_page}
          from={gaji.from}
          to={gaji.to}
          total={gaji.total}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default UpahPages;
