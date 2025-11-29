import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useEffect, useMemo, useState } from "react";
import { useUnitKerja } from "../hooks/useUnitKerja";
import { LoaderCircle, Pencil } from "lucide-react";
import { useDialog } from "@/hooks/useDialog";
import Dialog from "@/components/Dialog";
import FormEdit from "../components/FormEdit";
import type { UnitKerja } from "../types";

const DepartmentPages = () => {
  const { openDialog } = useDialog<UnitKerja>();

  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination(25);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { unit, loading } = useUnitKerja(perPage, currentPage, debouncedSearch);

  const tableRows = useMemo(() => {
    return unit?.data?.map((row, index) => (
      <tr
        key={row.DeptID ?? index}
        className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200"
      >
        <td className="text-center">
          {(currentPage - 1) * perPage + index + 1}
        </td>
        <td>{row.DeptName}</td>
        <td className="sticky right-0 z-0 text-center">
          <button
            onClick={() => {
              openDialog(row);
              console.log(row);
            }}
            className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-300"
          >
            <Pencil className="max-w-5" />
          </button>
        </td>
      </tr>
    ));
  }, [unit?.data, currentPage, perPage, openDialog]);

  useEffect(() => {
    document.title = "Unit Kerja";
  }, []);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4 overflow-hidden">
        <div className="flex w-full flex-col gap-4">
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
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
            </select>
            <span className="text-sm text-gray-200">entries</span>
          </label>
          <div className="flex w-full flex-wrap items-center gap-2">
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
          {/* <div className="flex w-full flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-white">Pilih Tanggal:</span>
            <label htmlFor="from_date" className="flex items-center gap-2">
              <input
                id="from_date"
                type="date"
                className="h-9 w-56 rounded border border-gray-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white"
              />
            </label>
            <label htmlFor="to_date" className="flex items-center gap-2">
              <input
                id="to_date"
                type="date"
                className="h-9 w-56 rounded border border-gray-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none bg-white"
              />
            </label>
          </div> */}
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded border border-gray-300 bg-white shadow">
        {loading ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : unit?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">Tidak ada data unit kerja</p>
          </div>
        ) : (
          <table className="w-full *:text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="*:border-y *:border-gray-300 *:bg-white *:px-2 *:py-1.5 *:whitespace-nowrap [&_th>span]:block">
                <th className="w-20 max-w-20">
                  <span>#</span>
                </th>
                <th className="max-w-[10ch] text-left">
                  <span>Unit Kerja</span>
                </th>
                <th className="text-center">
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        )}
      </div>
      {unit && unit?.success != true && unit?.data?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={unit.last_page}
          from={unit.from}
          to={unit.to}
          total={unit.total}
          onPageChange={handlePageChange}
        />
      )}
      {/* <div className="absolute inset-0 bg-black/50 z-50 pointer-events-none"></div> */}
      <Dialog>
        <FormEdit />
      </Dialog>
    </>
  );
};

export default DepartmentPages;
