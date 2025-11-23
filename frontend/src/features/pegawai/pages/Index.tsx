import { LoaderCircle, RefreshCcw, X } from "lucide-react";
import { usePegawai } from "../hooks/usePegawai";
import { useSyncPegawai } from "../hooks/useSyncPegawai";
import { NavLink } from "react-router-dom";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useDepartment } from "@/hooks/useDepartment";

const Index = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const {
    pegawai,
    loading: loadingData,
    refetch,
  } = usePegawai(perPage, currentPage, debouncedSearch, department);

  const { departments, loading: loadingDept } = useDepartment();

  const { loading, handleSync } = useSyncPegawai(refetch);

  const tableRows = useMemo(() => {
    return pegawai?.data?.map((row, index) => (
      <tr
        key={row.id ?? index}
        className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200"
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
        <td>-</td>
        <td>{row?.jenis_kelamin ?? "-"}</td>
        <td className="text-center">-</td>
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
              {/* <option value="-1">Semua</option> */}
            </select>
            <span className="text-sm text-gray-500">entries</span>
          </label>
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter:</span>
              <label
                htmlFor="department"
                className={`relative flex w-full w-max items-center gap-2 rounded pr-2 focus-within:ring-1 focus-within:ring-blue-400 ${
                  !loadingDept && "border border-gray-300"
                }`}
              >
                {loadingDept ? (
                  <LoaderCircle className="max-w-5 animate-spin" />
                ) : (
                  <>
                    <label htmlFor="department">
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
                          Pilih Department
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
                    </label>
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
                        }`}
                      />
                    </button>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
        <button
          className="max-h-10 w-max min-w-[17ch] cursor-pointer self-end rounded bg-green-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none md:text-sm"
          onClick={handleSync}
        >
          {loading ? (
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
          <table className="w-auto bg-white *:text-sm">
            <thead className="sticky top-0">
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
                  <span>Department</span>
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

export default Index;
