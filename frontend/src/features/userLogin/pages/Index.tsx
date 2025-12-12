import { useMemo, useState } from "react";
import { useUser } from "../hooks/useUser";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { Pencil } from "lucide-react";

const UserLoginPages = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination(50);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { datas } = useUser(perPage, currentPage, debouncedSearch);

  const tableRows = useMemo(() => {
    return datas?.map((row, index) => (
      <tr
        key={row.id ?? index}
        className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200"
      >
        <td className="w-10 max-w-10 text-center">
          {(currentPage - 1) * perPage + index + 1}
        </td>
        <td>{row.username}</td>
        <td>{row?.department?.DeptName ?? "-"}</td>
        <td className="capitalize">{row.role ?? "-"}</td>
        <td className="text-center">
          <div>
            <button className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-300">
              <Pencil className="max-w-5" />
            </button>
            <button></button>
          </div>
        </td>
      </tr>
    ));
  }, [datas, perPage, currentPage]);

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
                placeholder="Cari Username..."
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
      <div className="flex-1 overflow-auto rounded border border-gray-300 bg-white shadow">
        <table className="w-full bg-white *:text-sm">
          <thead className="sticky top-0">
            <tr className="*:bg-white *:whitespace-nowrap [&_th>span]:block [&_th>span]:border-b [&_th>span]:border-gray-300 [&_th>span]:px-4 [&_th>span]:py-1.5">
              <th className="w-10">
                <span className="w-10">#</span>
              </th>
              <th className="text-left">
                <span>Username</span>
              </th>
              <th className="text-left">
                <span>Unit Kerja</span>
              </th>
              <th className="text-left">
                <span>Role</span>
              </th>
              <th className="w-44 max-w-44 text-center">
                <span>Action</span>
              </th>
            </tr>
          </thead>
          <tbody>{tableRows}</tbody>
        </table>
      </div>
    </>
  );
};

export default UserLoginPages;
