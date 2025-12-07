import { LoaderCircle, RefreshCcw, X } from "lucide-react";
import { usePegawai } from "../hooks/usePegawai";
import { useSyncPegawai } from "../hooks/useSyncPegawai";
import { NavLink } from "react-router-dom";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useDepartment } from "@/hooks/useDepartment";
import { useJabatan } from "@/features/jabatan/hooks/useJabatan";
import { useShiftKerja } from "@/features/shiftKerja/hooks/useShiftKerja";
import Dialog from "@/components/Dialog";
import FormEdit from "../components/FormEdit";
import EditButton from "../components/EditButton";

const Index = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [jabatan, setJabatan] = useState("");
  const [shift, setShift] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const {
    pegawai,
    loading: loadingData,
    refetch,
  } = usePegawai(
    perPage,
    currentPage,
    debouncedSearch,
    department,
    jabatan,
    shift,
  );

  const { departments } = useDepartment();

  const { loading, handleSync } = useSyncPegawai(refetch);

  const { penugasan } = useJabatan();
  const { kategoriKerja } = useShiftKerja();

  const tableRows = useMemo(() => {
    return pegawai?.data?.map((row, index) => (
      <tr
        key={row.id ?? index}
        className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:*:bg-gray-200"
      >
        <td className="text-center">
          {(currentPage - 1) * perPage + index + 1}
        </td>
        <td className="w-[20ch] max-w-[20ch] text-center">
          <NavLink
            to=""
            className="w-max font-medium text-blue-500 hover:text-blue-800"
          >
            {row.badgenumber}
          </NavLink>
        </td>
        <td>{row.nama}</td>
        <td>
          <div className="line-clamp-2">{row.department?.DeptName}</div>
        </td>
        <td>{row?.jabatan?.nama ?? "-"}</td>
        <td className="text-center whitespace-nowrap">
          {row?.shift ? (
            <>
              {row.shift.jadwal.replace(/kategori\s*(\d+)/i, "K$1")} -{" "}
              {row.shift.jam_masuk.slice(0, 5)} s.d{" "}
              {row.shift.jam_keluar.slice(0, 5)}
            </>
          ) : (
            "-"
          )}
        </td>
        <td className="capitalize">{row.tempat_lahir ?? "-"}</td>
        <td className="text-center">{row.tanggal_lahir ? new Date(row.tanggal_lahir).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: "short",
          year: 'numeric'
        }) : "-"}</td>
        <td>{row?.jenis_kelamin ?? "-"}</td>
        <td>{row?.alamat ?? "-"}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td className="sticky right-0 z-0 bg-white">
          <div className="flex items-center gap-2">
            <EditButton row={row} />
            <button>Detail</button>
          </div>
        </td>
      </tr>
    ));
  }, [pegawai?.data, currentPage, perPage]);

  useEffect(() => {
    document.title = "Pegawai";
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
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
                <option value="-1">Semua</option>
              </select>
            </label>
            <label htmlFor="search" className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Cari:</span>
              <input
                id="search"
                type="search"
                placeholder="NIK / Nama..."
                className="h-9 w-56 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
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
                className={`relative flex w-full w-max items-center gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400`}
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
                  {departments?.map((department, index) => (
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
                  type="button"
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
                    }`}
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
                  // className={`${
                  //   penugasan ? "cursor-pointer" : "cursor-default"
                  // }`}
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
                className="relative flex w-full w-max min-w-32 min-w-44 items-center justify-between gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400"
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
                  onClick={() => setDepartment("")}
                  className={`${
                    department ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <X
                    className={`max-w-5 ${
                      department
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
          <button className="max-h-10 w-max min-w-[10ch] cursor-pointer self-end rounded bg-green-700 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none md:text-sm">
            <div className="flex items-center justify-center gap-2">
              Export Excel
            </div>
          </button>
          <button
            className="max-h-10 w-max min-w-[20ch] cursor-pointer self-end rounded bg-green-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none disabled:cursor-not-allowed disabled:bg-green-600 md:text-sm"
            onClick={handleSync}
            disabled={loading}
          >
            {loading ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div>
                  <RefreshCcw className="mx-auto max-h-5 max-w-4" />
                </div>
                Sinkron Petugas
              </div>
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded border border-gray-300 bg-white shadow">
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
            <thead>
              <tr className="z-10 *:sticky *:top-0 *:bg-white *:whitespace-nowrap [&_th>span]:block [&_th>span]:border-b [&_th>span]:border-gray-300 [&_th>span]:px-4 [&_th>span]:py-1.5">
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
                <th className="text-left">
                  <span>Tempat Lahir</span>
                </th>
                <th className="text-left">
                  <span>Tanggal Lahir</span>
                </th>
                <th className="text-center">
                  <span>Usia</span>
                </th>
                <th className="text-left">
                  <span>Jenis Kelamin</span>
                </th>
                <th className="text-left">
                  <span>Alamat</span>
                </th>
                <th className="text-left">
                  <span>Kelurahan</span>
                </th>
                <th className="text-left">
                  <span>Kecamatan</span>
                </th>
                <th className="text-left">
                  <span>Agama</span>
                </th>
                <th className="text-left">
                  <span>Status Perkawinan</span>
                </th>
                <th className="text-left">
                  <span>KTP</span>
                </th>
                <th className="text-left">
                  <span>KK</span>
                </th>
                <th className="text-left">
                  <span>Pas Foto</span>
                </th>
                <th className="text-left">
                  <span>Foto Lapangan</span>
                </th>
                <th className="text-left">
                  <span>Korlap</span>
                </th>
                <th className="text-left">
                  <span>Rute / Jalur</span>
                </th>
                <th className="sticky top-0 right-0 z-10 text-center">
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        )}
      </div>
      <Dialog>
        <FormEdit refetch={() => refetch()} />
      </Dialog>
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

export default Index;
