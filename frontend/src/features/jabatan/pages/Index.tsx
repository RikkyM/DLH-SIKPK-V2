import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useEffect, useMemo, useState } from "react";
import { useJabatan } from "../hooks/useJabatan";
import { LoaderCircle, Pencil, Trash } from "lucide-react";
import Pagination from "@/components/Pagination";

const JabatanPages = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { jabatan, loading } = useJabatan(
    perPage,
    currentPage,
    debouncedSearch,
  );

  const tableRows = useMemo(() => {
    return jabatan?.data?.map((row, index) => (
      <tr
        key={row.id ?? index}
        className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200"
      >
        <td className="w-20 max-w-20 text-center">
          {(currentPage - 1) * perPage + index + 1}
        </td>
        <td>{row.nama}</td>
        <td className="text-center">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(row.gaji)}
        </td>
        <td className="w-44 max-w-44">
          <div className="flex w-full items-center justify-center gap-2">
            <button className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-300">
              <Pencil className="max-w-5" />
            </button>
            <button className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-300">
              <Trash className="max-w-5" />
            </button>
          </div>
        </td>
      </tr>
    ));
  }, [jabatan?.data, currentPage, perPage]);

  useEffect(() => {
    document.title = "Jabatan";
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
                placeholder="Cari Nama..."
                className="h-9 w-56 rounded border border-gray-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                value={search ?? ""}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded border border-gray-300 px-2 shadow">
        {loading ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : jabatan?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">
              Tidak ada data jenis kendaraan
            </p>
          </div>
        ) : (
          <table className="w-full bg-white *:text-sm">
            <thead className="sticky top-0">
              <tr className="*:bg-white *:whitespace-nowrap [&_th>span]:block [&_th>span]:border-b [&_th>span]:border-gray-300 [&_th>span]:px-4 [&_th>span]:py-1.5">
                <th className="max-w-20 w-20">
                  <span>#</span>
                </th>
                <th className="text-left w-72">
                  <span>Nama Jabatan</span>
                </th>
                <th className="text-center">
                  <span>Upah Harian</span>
                </th>
                <th className="w-44 max-w-44 text-center">
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        )}
      </div>
      {jabatan && jabatan?.success != true && jabatan?.data?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={jabatan.last_page}
          from={jabatan.from}
          to={jabatan.to}
          total={jabatan.total}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default JabatanPages;
