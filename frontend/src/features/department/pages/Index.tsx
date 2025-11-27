import Pagination from "@/components/Pagination";

const DepartmentPages = () => {
  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4 overflow-hidden">
        <div className="flex w-full flex-col gap-4">
          <label
            htmlFor="per_page"
            className="flex w-full w-max items-center gap-2 rounded"
          >
            <span className="text-sm font-semibold">Show:</span>
            <select
              name="per_page"
              id="per_page"
              className="h-full w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none"
              value={"50"}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="-1">Semua</option>
            </select>
            <span className="text-sm text-gray-500">entries</span>
          </label>
          <div className="flex w-full flex-wrap items-center gap-2">
            <label htmlFor="search" className="flex items-center gap-2">
              <span className="text-sm font-medium">Search:</span>
              <input
                id="search"
                type="search"
                placeholder="Cari NIK / Nama..."
                className="h-9 w-full max-w-56 rounded border border-gray-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
            </label>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Pilih Tanggal:</span>
            <label htmlFor="from_date" className="flex items-center gap-2">
              <input
                id="from_date"
                type="date"
                className="h-9 w-56 rounded border border-gray-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
            </label>
            <label htmlFor="to_date" className="flex items-center gap-2">
              <input
                id="to_date"
                type="date"
                className="h-9 w-56 rounded border border-gray-300 px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
              />
            </label>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded border border-gray-300 shadow">
        <table className="w-full bg-white *:text-sm">
          <thead className="sticky top-0">
            <tr className="*:border-y *:border-gray-300 *:bg-white *:p-2 *:whitespace-nowrap [&_th>span]:block">
              <th className="max-w-20 w-20">
                <span>#</span>
              </th>
              <th className="max-w-[20ch]">
                <span>Department</span>
              </th>
              {/* <th className="text-left">
                <span>Nama Lengkap</span>
              </th> */}
              <th className="text-center sticky top-0 right-0 z-10">
                <span>Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="transition-colors hover:bg-gray-200">
              <td className="px-4 py-1.5 text-center">1</td>
              <td className="px-4 py-1.5 text-center font-medium">
                1839274829182738
              </td>
              {/* <td>Rikky Mahendra</td> */}
              <td className="text-center">
                <div>
                  <button>Edit</button>
                </div>
              </td>
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

export default DepartmentPages;
