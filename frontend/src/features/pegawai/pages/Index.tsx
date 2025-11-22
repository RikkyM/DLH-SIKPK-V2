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
        className="*:py-1.5 *:px-4 *:border-b *:border-gray-300 hover:bg-gray-200 transition-colors"
      >
        <td className="text-center">
          {(currentPage - 1) * perPage + index + 1}
        </td>
        <td className="max-w-[20ch] text-center w-[20ch]">
          <NavLink
            to=""
            className="w-max text-blue-500 hover:text-blue-800 font-medium"
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
      <div className="flex w-full justify-between mb-2 flex-wrap gap-4">
        <div className="flex gap-4 flex-col">
          <label
            htmlFor="per_page"
            className="w-max flex items-center gap-2 rounded w-full"
          >
            <span className="font-semibold text-sm">Show:</span>
            <select
              name="per_page"
              id="per_page"
              className="h-full w-full text-sm px-3 py-1.5 focus:outline-none border border-gray-300 rounded"
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
            <span className="text-gray-500 text-sm">entries</span>
          </label>
          <div className="flex items-center gap-2">
            <label htmlFor="search" className="flex items-center gap-2">
              <span className="font-semibold text-sm">Search:</span>
              <input
                id="search"
                type="search"
                placeholder="Cari NIK / Nama..."
                className="h-9 w-56 text-sm px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <span>Filter:</span>
            <label
              htmlFor="department"
              className={`w-max flex items-center gap-2 pr-2 rounded w-full rounded relative focus-within:ring-1 focus-within:ring-blue-400 ${
                !loadingDept && "border border-gray-300"
              }`}
            >
              {loadingDept ? (
                <LoaderCircle className="max-w-5 animate-spin" />
              ) : (
                <>
                  <select
                    name="department"
                    id="department"
                    className="h-full pl-2 py-1.5 cursor-pointer w-max text-sm focus:outline-none appearance-none"
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
        <button
          className="cursor-pointer w-max min-w-[17ch] px-2 py-2 whitespace-nowrap bg-green-500 text-white font-medium text-sm rounded outline-none shadow max-h-10 self-end"
          onClick={handleSync}
        >
          {loading ? (
            <RefreshCcw className="animate-spin mx-auto max-h-5 max-w-4" />
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <div>
                <RefreshCcw className="mx-auto max-h-5 max-w-4" />
              </div>
              Fetch Data
            </div>
          )}
        </button>
      </div>
      <div className="overflow-auto border rounded border-gray-300 shadow flex-1 px-2">
        {loadingData ? (
          <div className="h-full w-full flex items-center">
            <LoaderCircle className="animate-spin mx-auto" />
          </div>
        ) : pegawai?.data?.length === 0 ? (
          <div className="h-full w-full flex items-center">
            <p className="text-center mx-auto">Tidak ada data pegawai</p>
          </div>
        ) : (
          <table className="w-auto bg-white *:text-sm">
            <thead className="sticky top-0">
              <tr className="*:whitespace-nowrap  *:bg-white [&_th>span]:block [&_th>span]:px-4 [&_th>span]:py-1.5 [&_th>span]:border-b [&_th>span]:border-gray-300">
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
