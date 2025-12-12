import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, RefreshCcw, X } from "lucide-react";
import { useDepartment } from "@/hooks/useDepartment";
import { useJabatan } from "@/features/jabatan/hooks/useJabatan";
import { useShiftKerja } from "@/features/shiftKerja/hooks/useShiftKerja";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import DateInput from "@/components/DateInput";
import Pagination from "@/components/Pagination";
import { useRekapKehadiran } from "../hooks/useRekapKehadiran";
import { useExportKehadiranPerTanggal } from "@/hooks/useKehadiran";
import { useFilterAsn } from "@/features/pns/hooks/useAsnFilter";

const RekapKehadiranPages = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination(50);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [shift, setShift] = useState("");
  const [korlap, setKorlap] = useState("");
  const [tanggal, setTanggal] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { rekap, loading: loadingData } = useRekapKehadiran(
    perPage,
    currentPage,
    debouncedSearch,
    department,
    jabatan,
    shift,
    korlap,
    tanggal,
  );

  const { departments } = useDepartment();
  const { penugasan } = useJabatan();
  const { kategoriKerja } = useShiftKerja();
  const { datas } = useFilterAsn();
  const { fetch, loading: loadingExcel } = useExportKehadiranPerTanggal();

  const tableRows = useMemo(() => {
    if (!rekap?.data) return null;

    return rekap.data.map((row, index) => {
      // ambil semua jam masuk
      const masukList = row.kehadirans
        ?.filter((k) => Number(k.check_type) === 0)
        .map((k) => k.check_time.slice(11, 16));

      // ambil semua jam pulang
      const pulangList = row.kehadirans
        ?.filter((k) => Number(k.check_type) === 1)
        .map((k) => k.check_time.slice(11, 16));

      // tentukan jam masuk paling awal (min)
      const jam_masuk = masukList?.length
        ? masukList.reduce((a, b) => (a < b ? a : b))
        : "-";

      // tentukan jam pulang paling akhir (max)
      const jam_pulang = pulangList?.length
        ? pulangList.reduce((a, b) => (a > b ? a : b))
        : "-";

      return (
        <tr
          key={row.id ?? index}
          className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:*:bg-gray-200"
        >
          <td className="text-center">
            {(currentPage - 1) * perPage + index + 1}
          </td>
          <td className="text-center font-medium">{row.badgenumber}</td>
          <td>{row.nama}</td>
          <td>{row.department?.DeptName}</td>
          <td>{row.jabatan?.nama ?? "-"}</td>

          <td className="text-center whitespace-nowrap">
            {row.shift
              ? `${row.shift.jadwal.replace(/kategori\s*(\d+)/i, "K$1")} - ${row.shift.jam_masuk.slice(0, 5)} s.d ${row.shift.jam_keluar.slice(0, 5)}`
              : "-"}
          </td>

          {/* Tanggal */}
          <td className="text-center whitespace-nowrap">
            {row.kehadirans?.[0]?.check_time
              ? new Date(row.kehadirans?.[0]?.check_time).toLocaleDateString(
                  "id-ID",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                )
              : "-"}
          </td>

          {/* Jam Masuk */}
          <td className="text-center">{jam_masuk}</td>

          {/* Jam Pulang */}
          <td className="text-center">{jam_pulang}</td>

          <td className="text-center">-</td>
          <td className="text-center">-</td>
          <td className="text-center">-</td>
          <td className="text-center">-</td>
          <td className="sticky right-0 bg-white text-center">Action</td>
        </tr>
      );
    });
  }, [rekap, currentPage, perPage]);

  useEffect(() => {
    document.title = "Rekap Kehadiran";
  }, []);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="per_page"
              className="flex w-full w-max items-center gap-2 rounded"
            >
              <span className="text-sm font-medium text-white">Show:</span>
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
                <option value="1000">1000</option>
                <option value="2000">2000</option>
              </select>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-white">Tanggal:</span>
              <label htmlFor="tanggal" className="flex items-center gap-2">
                <DateInput
                  id="tanggal"
                  value={tanggal || ""}
                  onChange={(e) => setTanggal(e.target.value)}
                />
              </label>
            </div>
            <label htmlFor="search" className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Cari:</span>
              <input
                id="search"
                type="search"
                placeholder="NIK / Nama..."
                className="h-9 w-[270px] rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handlePageChange(1);
                }}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-white">Filter:</span>
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
                  type="button"
                  onClick={() => setJabatan("")}
                  className={`${jabatan ? "cursor-pointer" : "cursor-default"}`}
                >
                  <X
                    className={`max-w-5 ${
                      jabatan
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-30"
                    }`}
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
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Kategori Kerja
                  </option>
                  {kategoriKerja?.map((p, index) => (
                    <option
                      key={p.id ?? index}
                      value={p.id}
                      className="text-xs font-medium"
                    >
                      {p?.jadwal.replace(/kategori\s*(\d+)/i, "K$1")} -{" "}
                      {p?.jam_masuk.slice(0, 5)} s.d {p?.jam_keluar.slice(0, 5)}{" "}
                      WIB
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShift("")}
                  className={`${
                    kategoriKerja ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <X
                    className={`max-w-5 ${
                      shift
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-50"
                    }`}
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
                  value={korlap}
                  onChange={(e) => setKorlap(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Korlap
                  </option>
                  {datas?.map((p, index) => (
                    <option
                      key={p.id ?? index}
                      value={p.id}
                      className="text-xs font-medium"
                    >
                      {p.nama}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setKorlap("")}
                  className={`${korlap ? "cursor-pointer" : "cursor-default"}`}
                >
                  <X
                    className={`max-w-5 ${
                      korlap
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-50"
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="max-h-10 w-max min-w-[10ch] cursor-pointer self-end rounded bg-green-700 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none disabled:cursor-not-allowed md:text-sm"
            onClick={() =>
              fetch({
                search: debouncedSearch,
                department,
                jabatan,
                shift,
                tanggal,
              })
            }
            disabled={rekap === null || loadingExcel}
          >
            {loadingExcel ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                Export Excel
              </div>
            )}
          </button>
          {/* <button
            className="max-h-10 w-max min-w-[17ch] cursor-pointer self-end rounded bg-green-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none disabled:cursor-not-allowed disabled:bg-green-600 md:text-sm"
            onClick={handleSync}
            disabled={loadingKehadiran}
          >
            {loadingKehadiran ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div>
                  <RefreshCcw className="mx-auto max-h-5 max-w-4" />
                </div>
                Update Kehadiran
              </div>
            )}
          </button> */}
        </div>
      </div>
      <div className="flex-1 touch-pan-x touch-pan-y overflow-auto rounded border border-gray-300 bg-white shadow">
        {loadingData ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : rekap?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">
              Tidak ada data rekap kehadiran
            </p>
          </div>
        ) : (
          <table className="w-full bg-white *:text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="*:bg-white *:whitespace-nowrap [&_th>span]:block [&_th>span]:border-b [&_th>span]:border-gray-300 [&_th>span]:px-4 [&_th>span]:py-1.5">
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
                <th className="text-center">
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
                <th className="sticky right-0 text-center">
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        )}
      </div>
      {rekap && rekap?.success != true && rekap?.data?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={rekap.last_page}
          from={rekap.from}
          to={rekap.to}
          total={rekap.total}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default RekapKehadiranPages;
