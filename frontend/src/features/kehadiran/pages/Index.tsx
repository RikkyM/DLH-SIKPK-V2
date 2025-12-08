import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, RefreshCcw, X } from "lucide-react";
import { useDepartment } from "@/hooks/useDepartment";
import { useJabatan } from "@/features/jabatan/hooks/useJabatan";
import { useShiftKerja } from "@/features/shiftKerja/hooks/useShiftKerja";
import { useDebounce } from "@/hooks/useDebounce";
import { useExportKehadiran, useKehadiranManual } from "@/hooks/useKehadiran";
import { usePagination } from "@/hooks/usePagination";
import DateInput from "@/components/DateInput";
import Pagination from "@/components/Pagination";

const KehadiranPages = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination(50);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [shift, setShift] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [hasQuery, sethasQuery] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const { kehadiran, loading: loadingData, refetch } = useKehadiranManual();
  const { fetch: exportExcel, loading: loadingExport } = useExportKehadiran();

  const { departments } = useDepartment();
  const { penugasan } = useJabatan();
  const { kategoriKerja } = useShiftKerja();

  const tableRows = useMemo(() => {
    return kehadiran?.data.map((row, i) => {
      const hitungMenit = (
        jamAbsen?: string | null,
        jamShift?: string | null,
      ): number => {
        if (!jamAbsen || !jamShift || jamAbsen === "-" || jamShift === "-") {
          return 0;
        }

        const [jamA, menitA] = jamAbsen.split(":").map(Number);
        const [jamS, menitS] = jamShift.split(":").map(Number);

        const menitAbsen = jamA * 60 + menitA;
        const menitShift = jamS * 60 + menitS;

        const telat = menitAbsen - menitShift;

        return telat > 0 ? telat : 0;
      };

      const formatJam = (menit: number): string => {
        if (menit === 0) return "-";

        const jam = Math.floor(menit / 60);
        const sisaMenit = menit % 60;
        return `${jam.toString().padStart(2, "0")}:${sisaMenit.toString().padStart(2, "0")}`;
      };

      const menitTelat = hitungMenit(
        row.jam_masuk,
        row.pegawai.shift?.jam_masuk ?? "-",
      );

      return (
        <tr
          key={row.id ?? i}
          className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200"
        >
          <td className="text-center">{(currentPage - 1) * perPage + i + 1}</td>
          <td>{row.pegawai.badgenumber}</td>
          <td>{row.pegawai.nama}</td>
          <td>{row?.pegawai.department?.DeptName ?? "-"}</td>
          <td>{row?.pegawai.jabatan?.nama ?? "-"}</td>
          <td className="whitespace-nowrap">
            {row.pegawai.shift ? (
              <>
                {row.pegawai.shift.jadwal?.replace(/kategori\s*(\d+)/i, "K$1")}{" "}
                -{" "}
                {row.pegawai.shift.jam_masuk &&
                  row.pegawai.shift.jam_keluar && (
                    <>
                      {row.pegawai.shift?.jam_masuk?.slice(0, 5)} s.d{" "}
                      {row.pegawai.shift?.jam_keluar?.slice(0, 5)}
                    </>
                  )}
              </>
            ) : (
              "-"
            )}
          </td>
          <td className="whitespace-nowrap">{row.tanggal ? 
          new Date(row.tanggal).toLocaleDateString('id-ID', {
            day: "2-digit",
            month: "short",
            year: 'numeric'
          }) : "-"}</td>
          <td className="text-center">
            {row.jam_masuk ? row.jam_masuk.slice(0, 5) : "-"}
          </td>
          <td className="text-center">
            {row.jam_pulang ? row.jam_pulang.slice(0, 5) : "-"}
          </td>
          <td className="text-center">{formatJam(menitTelat)}</td>
          <td className="text-center">-</td>
          <td className="text-center">
            -
            {/* {row.upah
            ? new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(row.upah)
            : "-"} */}
          </td>
          <td>-</td>
          <td>-</td>
          <td className="sticky right-0 bg-white">
            <div className="flex items-center justify-center gap-2">
              <button>Detail</button>
            </div>
          </td>
        </tr>
      );
    });
  }, [kehadiran, currentPage, perPage]);

  useEffect(() => {
    if (!hasQuery) return;
    if (!appliedFromDate || !appliedToDate) return;
    void refetch({
      page: currentPage,
      perPage,
      search: debouncedSearch,
      department,
      jabatan,
      shift,
      fromDate: appliedFromDate,
      toDate: appliedToDate,
    });
  }, [
    hasQuery,
    currentPage,
    perPage,
    debouncedSearch,
    department,
    jabatan,
    shift,
    appliedFromDate,
    appliedToDate,
    refetch,
  ]);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
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
                <option value="1000">1000</option>
              </select>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-white">Tanggal:</span>
              <label htmlFor="from_date" className="flex items-center gap-2">
                <DateInput
                  id="from_date"
                  value={fromDate || ""}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="Tanggal Awal..."
                />
              </label>
              <label htmlFor="toDate" className="flex items-center gap-2">
                <DateInput
                  id="toDate"
                  value={toDate || ""}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="Tanggal Akhir..."
                />
              </label>

              <button
                type="button"
                className="h-9 cursor-pointer rounded bg-blue-600 px-3 text-sm font-medium text-white shadow hover:bg-blue-700"
                onClick={() => {
                  if (!fromDate || !toDate) {
                    setAppliedFromDate("");
                    setAppliedToDate("");
                    sethasQuery(false);
                    return;
                  }

                  handlePageChange(1);
                  setAppliedFromDate(fromDate);
                  setAppliedToDate(toDate);
                  sethasQuery(true);
                }}
              >
                Cari
              </button>
            </div>
          </div>
          <label htmlFor="search" className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">Cari:</span>
            <input
              id="search"
              type="search"
              placeholder="NIK / Nama..."
              className="h-9 w-[270px] rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handlePageChange(1);
              }}
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-white">Filter:</span>
              <label
                htmlFor="department"
                className="relative flex w-full w-max items-center gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400"
              >
                <select
                  name="department"
                  id="department"
                  className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                  value={department ?? ""}
                  onChange={(e) => {
                    handlePageChange(1);
                    setDepartment(e.target.value);
                  }}
                >
                  <option value="" disabled hidden>
                    Unit Kerja
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
                className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400"
              >
                <select
                  name="penugasan"
                  id="penugasan"
                  className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                  value={jabatan}
                  onChange={(e) => {
                    handlePageChange(1);
                    setJabatan(e.target.value);
                  }}
                >
                  <option value="" disabled hidden>
                    Penugasan
                  </option>
                  {penugasan?.map((p, index) => (
                    <option
                      key={p.id ?? index}
                      value={p.id}
                      className="text-xs font-medium"
                    >
                      {p?.nama}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setJabatan("")}
                  className={`${jabatan ? "cursor-pointer" : "cursor-default"}`}
                >
                  <X
                    className={`max-w-5 ${
                      jabatan
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-30"
                    }`}
                  />
                </button>
              </label>
              <label
                htmlFor="shift_kerja"
                className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400"
              >
                <select
                  name="shift_kerja"
                  id="shift_kerja"
                  className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                  value={shift}
                  onChange={(e) => {
                    handlePageChange(1);
                    setShift(e.target.value);
                  }}
                >
                  <option value="" disabled hidden>
                    Kategori Kerja
                  </option>
                  {kategoriKerja?.map((p, index) => (
                    <option
                      key={p.id ?? index}
                      value={p.id}
                      className="text-xs font-medium"
                    >
                      {p?.jadwal.replace(/kategori\s*(\d+)/i, "K$1")} -{" "}
                      {p?.jam_masuk.slice(0, 5)} s.d {p?.jam_keluar.slice(0, 5)}{" "}
                      WIB
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShift("")}
                  className={`${
                    kategoriKerja ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <X
                    className={`max-w-5 ${
                      shift
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-50"
                    }`}
                  />
                </button>
              </label>
              <label
                htmlFor="korlap"
                className="relative flex w-full w-max min-w-32 items-center justify-between gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400"
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
        </div>
        <div className="flex items-center gap-2">
          <button
            className="max-h-10 w-max min-w-[10ch] cursor-pointer self-end rounded bg-green-700 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none disabled:cursor-not-allowed md:text-sm"
            onClick={() =>
              exportExcel({ name: "Kehadiran", search, fromDate, toDate })
            }
            disabled={kehadiran === null}
          >
            {loadingExport ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                Export Excel
              </div>
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 touch-pan-x touch-pan-y overflow-auto rounded border border-gray-300 bg-white shadow">
        {loadingData ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : !kehadiran && !appliedFromDate && !appliedToDate ? null : kehadiran
            ?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">Tidak ada data kehadiran</p>
          </div>
        ) : (
          <table className="w-full bg-white *:text-sm">
            <thead className="sticky top-0 z-10">
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
                <th className="text-center">
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
                  <span>Jam Pulang Cepat</span>
                </th>
                <th className="text-center">
                  <span>Upah Kerja</span>
                </th>
                <th className="text-center">
                  <span>Potongan Upah</span>
                </th>
                <th className="text-left">
                  <span>Keterangan</span>
                </th>
                <th className="sticky right-0 text-center">
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
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
            // onPageChange={(newPage) => {
            //   handlePageChange(newPage);
            //   refetch({
            //     page: newPage,
            //     perPage,
            //     search: debouncedSearch,
            //     department,
            //     jabatan,
            //     shift,
            //     fromDate,
            //     toDate,
            //   });
            // }}
          />
        )}
    </>
  );
};

export default KehadiranPages;
