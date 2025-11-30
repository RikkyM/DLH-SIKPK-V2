import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useEffect, useMemo, useState } from "react";
import { useKendaraan } from "../hooks/useKendaraan";
import { LoaderCircle, Pencil, X } from "lucide-react";
import { useDepartment } from "@/hooks/useDepartment";
import Pagination from "@/components/Pagination";

const DataKendaraanPages = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination(50);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [jenisKendaraan, setJenisKendaraan] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { kendaraan, loading } = useKendaraan(
    perPage,
    currentPage,
    debouncedSearch,
    department,
    jenisKendaraan,
  );

  const { departments } = useDepartment();

  const tableRows = useMemo(() => {
    return kendaraan?.data?.map((row, index) => (
      <tr
        key={row.id ?? index}
        className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200"
      >
        <td className="text-center">
          {(currentPage - 1) * perPage + index + 1}
        </td>
        <td className="whitespace-nowrap">{row.no_tnkb}</td>
        <td className="whitespace-nowrap">{row.merk}</td>
        <td>{row.jenis_kendaraan.nama}</td>
        <td>{row.department.DeptName}</td>
        <td className="text-center">{row.lambung}</td>
        <td className="text-center">{row.no_rangka}</td>
        <td className="text-center">{row.no_mesin}</td>
        <td className="text-center">{row.tahun_pembuatan}</td>
        <td className="text-center">{row.kondisi}</td>
        <td className="text-center">{row.keterangan ?? "-"}</td>
        <td className="sticky right-0 z-0 bg-white">
          <button className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-300">
            <Pencil className="max-w-5" />
          </button>
        </td>
      </tr>
    ));
  }, [kendaraan?.data, currentPage, perPage]);

  useEffect(() => {
    document.title = "Data Kendaraan";
  }, []);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-4">
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
            <span className="text-sm text-gray-200">entries</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="search" className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Search:</span>
              <input
                id="search"
                type="search"
                placeholder="Cari NIK / Nama..."
                className="h-9 w-56 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handlePageChange(1);
                }}
              />
            </label>
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
              {/* <label
                htmlFor="jenis_kendaraan"
                className={`relative flex w-full w-max items-center gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400`}
              >
                <select
                  name="jenis_kendaraan"
                  id="jenis_kendaraan"
                  className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                  value={jenisKendaraan ?? ""}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                  }}
                >
                  <option value="" disabled hidden>
                    Jenis Kendaraan
                  </option>
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
              </label> */}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded border border-gray-300 bg-white shadow">
        {loading ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : kendaraan?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">Tidak ada data kendaraan</p>
          </div>
        ) : (
          <table className="w-full bg-white *:text-sm">
            <thead>
              <tr className="z-10 *:sticky *:top-0 *:bg-white *:whitespace-nowrap [&_th>span]:block [&_th>span]:border-b [&_th>span]:border-gray-300 [&_th>span]:px-4 [&_th>span]:py-1.5">
                <th className="max-w-20">
                  <span>#</span>
                </th>
                <th className="w-[11ch] max-w-[11ch]">
                  <span>No. TNKB</span>
                </th>
                <th className="text-left">
                  <span>Merk</span>
                </th>
                <th className="text-left">
                  <span>Jenis Kendaraan</span>
                </th>
                <th className="text-left">
                  <span>Unit Kerja</span>
                </th>
                <th className="text-left">
                  <span>No. Lambung</span>
                </th>
                <th className="text-left">
                  <span>No. Rangka</span>
                </th>
                <th className="text-left">
                  <span>No. Mesin</span>
                </th>
                <th className="text-center">
                  <span>Tahun Pembuatan</span>
                </th>
                <th className="text-left">
                  <span>Kondisi</span>
                </th>
                <th className="text-left">
                  <span>Keterangan</span>
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
      {kendaraan &&
        kendaraan?.success != true &&
        kendaraan?.data?.length > 0 && (
          <Pagination
            currentPage={currentPage}
            lastPage={kendaraan.last_page}
            from={kendaraan.from}
            to={kendaraan.to}
            total={kendaraan.total}
            onPageChange={handlePageChange}
          />
        )}
    </>
  );
};

export default DataKendaraanPages;
