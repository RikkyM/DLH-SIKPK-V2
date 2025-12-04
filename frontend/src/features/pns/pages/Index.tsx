import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useEffect, useMemo, useState } from "react";
import { useAsn } from "../hooks/useAsn";
import Pagination from "@/components/Pagination";
import { LoaderCircle, Pencil, Trash } from "lucide-react";

const PnsPages = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination(10);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { asn, loading } = useAsn(perPage, currentPage, debouncedSearch);

  const tableRows = useMemo(() => {
    return asn?.data?.map((row, index) => (
      <tr
        key={row.id ?? index}
        className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200"
      >
        <td className="w-20 max-w-20 text-center">
          {(currentPage - 1) * perPage + index + 1}
        </td>
        <td className="text-center">{row.nip}</td>
        <td>{row.nama}</td>
        <td>{row.pangkat ?? "-"}</td>
        <td className="text-center">{row.golongan}</td>
        <td>{row.jabatan}</td>
        <td className="text-center">{row.unit_kerja ?? "-"}</td>
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
  }, [asn?.data, currentPage, perPage]);

  useEffect(() => {
    document.title = "Penugasan";
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
              {/* <option value="-1">Semua</option> */}
            </select>
            <span className="text-sm text-gray-200">entries</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="search" className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Search:</span>
              <input
                id="search"
                type="search"
                placeholder="Cari Nama..."
                className="h-9 w-56 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                value={search ?? ""}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handlePageChange(1);
                }}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded border border-gray-300 bg-white px-2 shadow">
        {loading ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : asn?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">
              Tidak ada data jenis kendaraan
            </p>
          </div>
        ) : (
          <table className="w-full bg-white *:text-sm">
            <thead className="sticky top-0">
              <tr className="*:bg-white *:whitespace-nowrap [&_th>span]:block [&_th>span]:border-b [&_th>span]:border-gray-300 [&_th>span]:px-4 [&_th>span]:py-1.5">
                <th className="w-20 max-w-20">
                  <span>#</span>
                </th>
                <th className="w-[26ch] text-center">
                  <span>NIP / NI PPPK</span>
                </th>
                <th className="text-left">
                  <span>Nama</span>
                </th>
                <th className="text-left">
                  <span>Pangkat</span>
                </th>
                <th className="text-left">
                  <span>Gol</span>
                </th>
                <th className="text-left">
                  <span>Jabatan</span>
                </th>
                <th className="text-left">
                  <span>Unit Kerja</span>
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
      {asn && asn?.success != true && asn?.data?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={asn.last_page}
          from={asn.from}
          to={asn.to}
          total={asn.total}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default PnsPages;
