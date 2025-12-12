import { useMemo, useState } from "react";
import { LoaderCircle, RefreshCcw, X } from "lucide-react";
import { useDepartment } from "@/hooks/useDepartment";
import { useJabatan } from "@/features/jabatan/hooks/useJabatan";
import { useShiftKerja } from "@/features/shiftKerja/hooks/useShiftKerja";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import DateInput from "@/components/DateInput";
import Pagination from "@/components/Pagination";
import { useSyncKehadiran } from "@/hooks/useSyncKehadiran";
import { useFinger } from "../hooks/useFingers";
import { useExportFinger } from "../hooks/useExportFinger";
import { useFilterAsn } from "@/features/pns/hooks/useAsnFilter";
import { useAuth } from "@/features/auth";

const CHECK_TYPE: Record<number, string> = {
  0: "Masuk",
  1: "Pulang",
};

const FingerPages = () => {
  const { user } = useAuth();
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination(50);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [shift, setShift] = useState("");
  const [korlap, setKorlap] = useState("");
  const [tanggal, setTanggal] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { kehadiran, loading, refetch } = useFinger(
    perPage,
    currentPage,
    debouncedSearch,
    department,
    jabatan,
    shift,
    korlap,
    tanggal,
  );

  const { exportFingerExcel: exportExcel, loading: loadingExport } =
    useExportFinger();
  const { loading: loadingButton, handleSync } = useSyncKehadiran(refetch);

  const { departments } = useDepartment();
  const { penugasan } = useJabatan();
  const { kategoriKerja } = useShiftKerja();
  const { datas } = useFilterAsn();

  const tableRows = useMemo(() => {
    return kehadiran?.data?.map((row, i) => (
      <tr
        key={row.id ?? i}
        className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200"
      >
        <td className="text-center">{(currentPage - 1) * perPage + i + 1}</td>
        <td className="px-4 py-1.5 text-center font-medium">
          {row.pegawai.badgenumber}
        </td>
        <td>{row.pegawai.nama}</td>
        <td>{row.pegawai.department?.DeptName ?? "-"}</td>
        <td>{row.pegawai.jabatan?.nama ?? "-"}</td>
        <td className="text-center">
          {row?.pegawai.shift ? (
            <>
              {row.pegawai.shift?.jadwal.replace(/kategori\s*(\d+)/i, "K$1")}
              {" - "}
              {row.pegawai.shift?.jam_masuk.slice(0, 5)} s.d{" "}
              {row.pegawai.shift?.jam_keluar.slice(0, 5)}
            </>
          ) : (
            "-"
          )}
        </td>
        <td className="text-center">{CHECK_TYPE[row.check_type]}</td>
        <td className="text-center whitespace-nowrap">
          {new Date(row.check_time.slice(0, 10)).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </td>
        <td className="text-center">{row.check_time.slice(11, 19)}</td>
      </tr>
    ));
  }, [kehadiran, currentPage, perPage]);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
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
                {/* <option value="5">5</option>
              <option value="10">10</option> */}
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
              </select>
            </label>
            <div className="flex items-center gap-2">
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

              {user && user.role !== "operator" && (
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
                      handlePageChange(1);
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
              )}
              <label
                htmlFor="penugasan"
                className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400"
              >
                <select
                  name="penugasan"
                  id="penugasan"
                  className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                  value={jabatan}
                  onChange={(e) => {
                    setJabatan(e.target.value);
                    handlePageChange(1);
                  }}
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
                  className={`${penugasan ? "cursor-pointer" : "cursor-default"}`}
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
                  onChange={(e) => {
                    setShift(e.target.value);
                    handlePageChange(1);
                  }}
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
                  onChange={(e) => {
                    setKorlap(e.target.value);
                    handlePageChange(1);
                  }}
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
              exportExcel({
                search,
                department,
                jabatan,
                shift,
                tanggal,
              })
            }
            disabled={loadingExport || kehadiran?.data?.length === 0}
          >
            {loadingExport ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              "Export Excel"
            )}
          </button>
          {user && ["superadmin", "admin"].includes(user.role) && (
            <button
              className="flex max-h-10 w-max min-w-[20ch] cursor-pointer items-center justify-center gap-2 self-end rounded bg-green-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none disabled:cursor-not-allowed disabled:bg-green-600 md:text-sm"
              onClick={handleSync}
              disabled={loadingButton}
            >
              {loadingButton ? (
                <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <div>
                    <RefreshCcw className="mx-auto max-h-5 max-w-4" />
                  </div>
                  Update Data
                </div>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 touch-pan-x touch-pan-y overflow-auto rounded border border-gray-300 bg-white shadow">
        {loading ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : kehadiran?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">Tidak ada data finger.</p>
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
                  <span>Finger</span>
                </th>
                <th className="text-center">
                  <span>Tanggal</span>
                </th>
                <th className="text-center">
                  <span>Waktu</span>
                </th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        )}
      </div>
      {kehadiran &&
        kehadiran?.success !== true &&
        kehadiran?.data?.length > 0 && (
          <Pagination
            currentPage={currentPage}
            lastPage={kehadiran.last_page}
            from={kehadiran.from}
            to={kehadiran.to}
            total={kehadiran.total}
            onPageChange={handlePageChange}
          />
        )}
    </>
  );
};

export default FingerPages;
