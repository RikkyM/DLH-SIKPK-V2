import Pagination from "@/components/Pagination";
import { useEffect } from "react";

const UpahPages = () => {
  useEffect(() => {
    document.title = "SPJ Gaji";
  }, []);

  return (
    <>
      <div className="flex w-full justify-between mb-2 flex-wrap gap-4 overflow-hidden">
        <div className="flex gap-4 flex-col w-full">
          <label
            htmlFor="per_page"
            className="w-max flex items-center gap-2 rounded w-full"
          >
            <span className="font-semibold text-sm">Show:</span>
            <select
              name="per_page"
              id="per_page"
              className="h-full w-full text-sm px-3 py-1.5 focus:outline-none border border-gray-300 rounded"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
            </select>
            <span className="text-gray-500 text-sm">entries</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap w-full">
            <label htmlFor="search" className="flex items-center gap-2">
              <span className="font-medium text-sm">Search:</span>
              <input
                id="search"
                type="search"
                placeholder="Cari NIK / Nama..."
                className="h-9 w-full max-w-56 text-sm px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </label>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full">
            <span className="font-medium text-sm">Pilih Tanggal:</span>
            <label htmlFor="from_date" className="flex items-center gap-2">
              <input
                id="from_date"
                type="date"
                className="h-9 w-56 text-sm px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </label>
            <label htmlFor="to_date" className="flex items-center gap-2">
              <input
                id="to_date"
                type="date"
                className="h-9 w-56 text-sm px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </label>
          </div>
        </div>
      </div>
      <div className="overflow-auto border rounded border-gray-300 shadow flex-1 px-2">
        <table className="w-full bg-white *:text-sm">
          <thead className="sticky top-0">
            <tr className="*:whitespace-nowrap  *:bg-white [&_th>span]:block *:border-y *:border-gray-300 *:p-2">
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
                <span>Jabatan</span>
              </th>
              <th className="text-left">
                <span>Department</span>
              </th>
              <th className="text-left">
                <span>Jumlah Hari Kerja</span>
              </th>
              <th className="text-left">
                <span>Jumlah Masuk Kerja</span>
              </th>
              <th className="text-left">
                <span>Gaji/Upah Harian</span>
              </th>
              <th className="text-left">
                <span>Total Gaji/Upah</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-200 transition-colors">
              <td className="px-4 py-1.5 text-center">1</td>
              <td className="px-4 py-1.5 text-center font-medium">
                1839274829182738
                </td>
              <td>Rikky Mahendra</td>
              <td className="text-center">-</td>
              <td>UPT DLH KERTAPATI</td>
              <td className="text-center">-</td>
              <td className="text-center">-</td>
              <td className="text-center">-</td>
              <td className="text-center">-</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={1}
        lastPage={100}
        from={1}
        to={10}
        total={1000}
        onPageChange={() => {}}
      />
    </>
  );
};

export default UpahPages;
