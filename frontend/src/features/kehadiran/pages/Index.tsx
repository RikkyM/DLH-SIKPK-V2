import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useDepartment } from "@/hooks/useDepartment";
import { useKehadiran } from "@/hooks/useKehadiran";
import { usePagination } from "@/hooks/usePagination";
import { useSyncKehadiran } from "@/hooks/useSyncKehadiran";
import {
  LoaderCircle,
  RefreshCcw,
  //  LoaderCircle,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const KehadiranPages = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination(50);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [dateFocus, setDateFocus] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const {
    kehadiran,
    loading: loadingData,
    refetch,
  } = useKehadiran(perPage, currentPage, debouncedSearch, department, tanggal);

  const { departments } = useDepartment();

  const { loading: loadingKehadiran, handleSync } = useSyncKehadiran(refetch);

  // const tableRows = useMemo(() => {
  //   return kehadiran?.data?.map((k, i) => {
  //     // const p = kehadiran.find(item => item.check_time)
  //     // console.log(p)
  //     const jam = k.check_time.slice(11, 16);
  //     return (
  //       <tr
  //         key={k.id ?? i}
  //         className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200"
  //       >
  //         <td className="text-center">{(currentPage - 1) * perPage + i + 1}</td>
  //         <td className="px-4 py-1.5 text-center font-medium">
  //           {k.pegawai.badgenumber}
  //         </td>
  //         <td>{k.pegawai.nama}</td>
  //         <td>{k.pegawai.department?.DeptName}</td>
  //         <td>-</td>
  //         <td>
  //           {k.pegawai.shift?.jadwal ?? "-"}
  //           {/* Shift 2<br />
  //         06:00 - 16:00 */}
  //         </td>
  //         <td className="text-center whitespace-nowrap">
  //           {new Date(k.check_time.slice(0, 10)).toLocaleDateString("id-ID", {
  //             day: "2-digit",
  //             month: "short",
  //             year: "numeric",
  //           })}
  //         </td>
  //         <td className="text-center">
  //           {Number(k.check_type) === 0 ? jam : "-"}
  //         </td>

  //         {/* Jam Pulang */}
  //         <td className="text-center">
  //           {Number(k.check_type) === 1 ? jam : "-"}
  //         </td>
  //         <td className="text-center">-</td>
  //         <td className="text-center">Rp. 100.000</td>
  //         <td className="text-center">Rp. 0</td>
  //         <td>
  //           <div className="flex items-center justify-center gap-2">
  //             {/* narasi keterangan tetapi untuk edit */}
  //             <button>Keterangan</button>
  //           </div>
  //         </td>
  //       </tr>
  //     );
  //   });
  // }, [kehadiran?.data, currentPage, perPage]);

  const tableRows = useMemo(() => {
    if (!kehadiran?.data) return null;

    type RowGabungan = (typeof kehadiran.data)[number] & {
      tanggal: string;
      jam_masuk: string | "-";
      jam_pulang: string | "-";
    };

    const map = new Map<string, RowGabungan>();

    kehadiran.data.forEach((k) => {
      const tanggal = k.check_time.slice(0, 10);
      const jam = k.check_time.slice(11, 16);
      const key = `${k.pegawai_id}-${tanggal}`;

      if (!map.has(key)) {
        map.set(key, {
          ...k,
          tanggal,
          jam_masuk: "-",
          jam_pulang: "-",
        });
      }

      const item = map.get(key)!;

      if (Number(k.check_type) === 0) {
        item.jam_masuk = jam;
      } else if (Number(k.check_type) === 1) {
        item.jam_pulang = jam;
      }
    });

    const rowsGabungan = Array.from(map.values());

    return rowsGabungan.map((row, i) => (
      <tr
        key={row.id ?? i}
        className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200"
      >
        <td className="text-center">{(currentPage - 1) * perPage + i + 1}</td>
        <td className="px-4 py-1.5 text-center font-medium">
          {row.pegawai.badgenumber}
        </td>
        <td>{row.pegawai.nama}</td>
        <td>{row.pegawai.department?.DeptName}</td>
        <td>-</td>
        <td>{row.pegawai.shift?.jadwal ?? "-"}</td>
        <td className="text-center whitespace-nowrap">
          {new Date(row.tanggal).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </td>
        <td className="text-center">{row.jam_masuk}</td>
        <td className="text-center">{row.jam_pulang}</td>
        <td className="text-center">-</td>
        <td className="text-center">Rp. 100.000</td>
        <td className="text-center">Rp. 0</td>
        <td>
          <div className="flex items-center justify-center gap-2">
            <button>Keterangan</button>
          </div>
        </td>
      </tr>
    ));
  }, [kehadiran, currentPage, perPage]);

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
              {/* <option value="5">5</option>
              <option value="10">10</option> */}
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="2000">2000</option>
              <option value="-1">Semua</option>
            </select>
            <span className="text-sm text-gray-200">entries</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-white">
              Pilih Tanggal:
            </span>
            <label htmlFor="tanggal" className="flex items-center gap-2">
              <input
                id="tanggal"
                type={dateFocus ? "date" : "text"}
                className="h-9 w-56 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                value={tanggal || ""}
                placeholder={tanggal ? "" : "Pilih tanggal"}
                onChange={(e) => {
                  setTanggal(e.target.value);
                }}
                onFocus={() => setDateFocus(true)}
                onBlur={() => {
                  if (!tanggal) setDateFocus(false);
                  else setDateFocus(true);
                }}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="search" className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Search:</span>
              <input
                id="search"
                type="search"
                placeholder="Cari NIK / Nama..."
                className="h-9 w-56 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
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
                  Pilih Unit Kerja
                </option>
                {departments
                  ?.filter(
                    (department) =>
                      department.DeptName !== "NON AKTIF" &&
                      department.DeptName !== "",
                  )
                  .map((department, index) => (
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
                  } `}
                />
              </button>
            </label>
            <label
              htmlFor="penugasan"
              className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 pr-2 focus-within:ring-1 focus-within:ring-blue-400 bg-white"
            >
              <select
                name="penugasan"
                id="penugasan"
                className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                value={""}
                onChange={() => {}}
              >
                <option value="" disabled hidden>
                  Penugasan
                </option>
              </select>
              <button type="button">
                <X className="pointer-events-none max-w-5 opacity-30" />
              </button>
            </label>
            <label
              htmlFor="shift_kerja"
              className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 pr-2 focus-within:ring-1 focus-within:ring-blue-400 bg-white"
            >
              <select
                name="shift_kerja"
                id="shift_kerja"
                className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                value={""}
                onChange={() => {}}
              >
                <option value="" disabled hidden>
                  Shift Kerja
                </option>
              </select>
              <button
                type="button"
                // onClick={() => setDepartment("")}
                // className={`${
                //   department ? "cursor-pointer" : "cursor-default"
                // }`}
              >
                {/* <X
                  className={`max-w-5 ${
                    department
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-50"
                  }`}
                /> */}
                <X className="pointer-events-none max-w-5 opacity-30" />
              </button>
            </label>
            <label
              htmlFor="korlap"
              className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 pr-2 focus-within:ring-1 focus-within:ring-blue-400 bg-white"
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
                // onClick={() => setDepartment("")}
                // className={`${
                //   department ? "cursor-pointer" : "cursor-default"
                // }`}
              >
                {/* <X
                  className={`max-w-5 ${
                    department
                      ? "pointer-events-auto opacity-100"
                      : "pointer-events-none opacity-50"
                  }`}
                /> */}
                <X className="pointer-events-none max-w-5 opacity-30" />
              </button>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* <button
            className="max-h-10 w-max min-w-[10ch] cursor-pointer self-end rounded bg-green-700 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none md:text-sm"
          >
            <div className="flex items-center justify-center gap-2">Tambah</div>
          </button>
          <button
            className="max-h-10 w-max min-w-[10ch] cursor-pointer self-end rounded bg-green-700 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none md:text-sm"
          >
            <div className="flex items-center justify-center gap-2">
              Perbaikan
            </div>
          </button> */}
          <button
            className="max-h-10 w-max min-w-[10ch] cursor-pointer self-end rounded bg-green-700 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none md:text-sm"
            // onClick={handleSync}
          >
            {/* {loadingKehadiran ? (
                <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
              ) : (
              )} */}
            <div className="flex items-center justify-center gap-2">
              Export Excel
            </div>
          </button>
          <button
            className="max-h-10 w-max min-w-[17ch] cursor-pointer self-end rounded bg-green-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none disabled:cursor-not-allowed disabled:bg-green-600 md:text-sm"
            onClick={handleSync}
            disabled={loadingKehadiran}
          >
            {loadingKehadiran ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div>
                  <RefreshCcw className="mx-auto max-h-5 max-w-4" />
                </div>
                Update Kehadiran
              </div>
            )}
          </button>
        </div>
        {/* <div className="flex items-center gap-2">
          <button
            className="max-h-10 w-max min-w-[10ch] cursor-pointer self-end rounded bg-green-700 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none md:text-sm"
            onClick={handleSync}
          >
            {loading ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                Excel
              </div>
            )}
          </button>
          <button
            className="max-h-10 w-max min-w-[20ch] cursor-pointer self-end rounded bg-green-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none md:text-sm"
            onClick={handleSync}
          >
            {loading ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div>
                  <RefreshCcw className="mx-auto max-h-5 max-w-4" />
                </div>
                Sinkron Pegawai
              </div>
            )}
          </button>
        </div> */}
      </div>
      <div className="flex-1 touch-pan-x touch-pan-y overflow-auto rounded border border-gray-300 bg-white px-2 shadow">
        {loadingData ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : kehadiran?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">Tidak ada data kehadiran</p>
          </div>
        ) : (
          <table className="w-full bg-white *:text-sm">
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
                  <span>Unit Kerja</span>
                </th>
                <th className="text-left">
                  <span>Penugasan</span>
                </th>
                <th className="text-left">
                  <span>Kategori Kerja</span>
                </th>
                <th className="text-center">
                  <span>Tanggal</span>
                </th>
                <th className="text-center">
                  <span>Jam Masuk</span>
                </th>
                <th className="text-center">
                  <span>Jam Pulang</span>
                </th>
                <th className="text-center">
                  <span>Jam Telat</span>
                </th>
                <th className="text-center">
                  <span>Upah Kerja</span>
                </th>
                <th className="text-center">
                  <span>Potongan Upah</span>
                </th>
                <th className="text-center">
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* <tr className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200">
              <td className="text-center">1</td>
              <td className="px-4 py-1.5 text-center font-medium">
                1839274829182738
              </td>
              <td>Rikky Mahendra</td>
              <td>UPT DLH KERTAPATI</td>
              <td>-</td>
              <td>
                Shift 2<br />
                06:00 - 16:00
              </td>
              <td className="text-center">24 Nov 2025</td>
              <td className="text-center">06:25:15</td>
              <td className="text-center">16:03:00</td>
              <td className="text-center">00:25:15</td>
              <td className="text-center">Rp. 100.000</td>
              <td className="text-center">Rp. 0</td>
              <td>
                <div className="flex items-center justify-center gap-2">
                  <button>Keterangan</button>
                </div>
              </td>
            </tr> */}
              {tableRows}
            </tbody>
          </table>
        )}
      </div>
      {kehadiran &&
        kehadiran?.success != true &&
        kehadiran?.data?.length > 0 && (
          <Pagination
            currentPage={currentPage}
            lastPage={kehadiran.last_page}
            from={kehadiran.from}
            to={kehadiran.to}
            total={kehadiran.total}
            onPageChange={handlePageChange}
          />
        )}
    </>
  );
};

export default KehadiranPages;
