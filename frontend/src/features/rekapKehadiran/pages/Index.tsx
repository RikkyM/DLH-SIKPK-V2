import DateInput from "@/components/DateInput";
import Pagination from "@/components/Pagination";
import { useJabatan } from "@/features/jabatan/hooks/useJabatan";
import { usePegawai } from "@/features/pegawai/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { useDepartment } from "@/hooks/useDepartment";
import { usePagination } from "@/hooks/usePagination";
import { useSyncKehadiran } from "@/hooks/useSyncKehadiran";
import { LoaderCircle, RefreshCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CHECK_TYPES = [
  { type: 0, key: "masuk", label: "Masuk" }, // Masuk
  { type: 1, key: "pulang", label: "Pulang" }, // Pulang
];

const RekapTanggalHadirPages = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination();

  // const idRef = useRef<HTMLTableCellElement>(null);
  // const nikRef = useRef<HTMLTableCellElement>(null);
  // const namaRef = useRef<HTMLTableCellElement>(null);
  // const unitKerjaRef = useRef<HTMLTableCellElement>(null);
  // const penugasanRef = useRef<HTMLTableCellElement>(null);
  // const jumlahHariRef = useRef<HTMLTableCellElement>(null);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [jabatan, setJabatan] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // const [columnWidths, setColumnWidths] = useState({
  //   id: 0,
  //   nik: 0,
  //   nama: 0,
  //   unitKerja: 0,
  //   penugasan: 0,
  //   jumlahHari: 0,
  // });

  const {
    pegawai,
    loading: loadingData,
    refetch,
  } = usePegawai(perPage, currentPage, debouncedSearch, department, jabatan);

  const { departments } = useDepartment();
  const { penugasan } = useJabatan();

  const { loading: loadingKehadiran, handleSync } = useSyncKehadiran(refetch);

  // useEffect(() => {
  //   const updateWidth = () => {
  //     if (
  //       idRef.current &&
  //       nikRef.current &&
  //       namaRef.current &&
  //       unitKerjaRef.current &&
  //       penugasanRef.current &&
  //       jumlahHariRef.current
  //     ) {
  //       setColumnWidths({
  //         id: idRef.current.offsetWidth,
  //         nik: nikRef.current.offsetWidth,
  //         nama: namaRef.current.offsetWidth,
  //         unitKerja: unitKerjaRef.current.offsetWidth,
  //         penugasan: penugasanRef.current.offsetWidth,
  //         jumlahHari: jumlahHariRef.current.offsetWidth,
  //       });
  //     }
  //   };

  //   updateWidth();
  //   window.addEventListener("resize", updateWidth);
  //   return () => window.removeEventListener("resize", updateWidth);
  // }, [pegawai?.data]);

  const getLast7Days = () => {
    const days: string[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
      days.push(iso);
    }

    return days;
  };

  const formatTanggalID = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const last7Days = useMemo(() => getLast7Days(), []);

  const tableRows = useMemo(() => {
    return pegawai?.data.map((p, index) => (
      <tr
        key={p.id ?? index}
        className="divide-x divide-gray-200 border-b border-gray-200 transition-colors *:bg-white *:px-4 *:py-2 hover:*:bg-gray-200 [&_th>span]:block"
      >
        <td className="w-[20ch] text-center">
          {(currentPage - 1) * perPage + index + 1}
        </td>
        <td
          className="text-center font-medium"
          // style={{ left: `${columnWidths.id}px` }}
        >
          <span className="w-[16ch]">{p.badgenumber}</span>
        </td>
        <td
          className=""
          // style={{ left: `${columnWidths.id + columnWidths.nik}px` }}
        >
          <span className="w-[18ch]">{p.nama}</span>
        </td>
        <td
          className=""
          style={
            {
              // left: `${columnWidths.id + columnWidths.nik + columnWidths.nama}px`,
            }
          }
        >
          <span className="">{p?.department?.DeptName}</span>
        </td>
        <td
          className="capitalize"
          style={
            {
              // left: `${columnWidths.id + columnWidths.nik + columnWidths.nama + columnWidths.unitKerja}px`,
            }
          }
        >
          {p?.jabatan?.nama.toLowerCase() ?? "-"}
        </td>
        <td
          className="text-center"
          style={
            {
              // left: `${columnWidths.id + columnWidths.nik + columnWidths.nama + columnWidths.unitKerja + columnWidths.penugasan}px`,
            }
          }
        >
          -
        </td>

        {/* Per tanggal, per check_type (M / K / L) */}
        {last7Days.map((tanggal) =>
          CHECK_TYPES.map((ct) => {
            const record = p.kehadirans?.find(
              (k) =>
                k.check_time?.slice(0, 10) === tanggal &&
                Number(k.check_type) === ct.type,
            );

            const jam = record
              ? record.check_time.slice(11, 16) // HH:MM
              : null;

            return (
              <td key={`${p.id}-${tanggal}-${ct.key}`} className="text-center">
                {jam ? (
                  <span className="text-xs font-medium">{jam}</span>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </td>
            );
          }),
        )}
      </tr>
    ));
  }, [pegawai?.data, currentPage, perPage, last7Days]);

  useEffect(() => {
    document.title = "Kehadiran";
  }, []);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
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
                <option value="2000">2000</option>
              </select>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-white">Tanggal:</span>
              <label htmlFor="from_date" className="flex items-center gap-2">
                <DateInput
                  id="from_date"
                  value={""}
                  onChange={() => {}}
                  placeholder="Tanggal Awal..."
                />
              </label>
              <label htmlFor="to_date" className="flex items-center gap-2">
                <DateInput
                  id="to_date"
                  value={""}
                  onChange={() => {}}
                  placeholder="Tanggal Akhir..."
                />
              </label>
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
          </div>
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
                  onChange={(e) => setJabatan(e.target.value)}
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
                    } `}
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
                  onClick={() => setJabatan("")}
                  className={`${jabatan ? "cursor-pointer" : "cursor-default"}`}
                >
                  <X
                    className={`max-w-5 ${
                      jabatan
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-30"
                    } `}
                  />
                </button>
              </label>
            </div>
          </div>
        </div>
        {/* <button
          className="max-h-10 w-max min-w-[17ch] cursor-pointer self-end rounded bg-green-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none md:text-sm"
          onClick={handleSync}
        >
          {loadingKehadiran ? (
            <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
          ) : (
            <div className="flex items-center justify-center gap-2">
              <div>
                <RefreshCcw className="mx-auto max-h-5 max-w-4" />
              </div>
              Fetch Data
            </div>
          )}
        </button> */}
        <div className="flex items-center gap-2">
          <button
            className="max-h-10 w-max min-w-[10ch] cursor-pointer self-end rounded bg-green-700 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none md:text-sm"
            // onClick={handleSync}
          >
            {loadingKehadiran ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                Export Excel
              </div>
            )}
          </button>
          <button
            className="max-h-10 w-max min-w-[20ch] cursor-pointer self-end rounded bg-green-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none md:text-sm"
            onClick={handleSync}
          >
            {loadingKehadiran ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                Export Tanda Tangan
              </div>
            )}
          </button>
          {/* <button
            className="max-h-10 w-max min-w-[22ch] cursor-pointer self-end rounded bg-green-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none md:text-sm"
            onClick={handleSync}
          >
            {loadingKehadiran ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div>
                  <RefreshCcw className="mx-auto max-h-5 max-w-4" />
                </div>
                Sinkron Kehadiran
              </div>
            )}
          </button> */}
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded border border-gray-300 bg-white shadow">
        {loadingData ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : pegawai?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">Tidak ada data pegawai</p>
          </div>
        ) : (
          <table className="w-full bg-white *:text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="divide-x divide-gray-200 *:border-y *:border-gray-300 *:bg-white *:px-4 *:py-2 *:whitespace-nowrap [&_th>span]:block">
                <th
                  // ref={idRef}
                  rowSpan={2}
                  className="w-[4ch] max-w-[2ch] align-middle"
                >
                  <span>#</span>
                </th>
                <th
                  // ref={nikRef}
                  rowSpan={2}
                  className={`align-middle`}
                  // style={{ left: `${columnWidths.id}px` }}
                >
                  <span className="w-[16ch]">NIK</span>
                </th>
                <th
                  // ref={namaRef}
                  rowSpan={2}
                  className="text-left align-middle"
                  // style={{ left: `${columnWidths.id + columnWidths.nik}px` }}
                >
                  <span className="w-[18ch]">Nama Lengkap</span>
                </th>
                <th
                  rowSpan={2}
                  // ref={unitKerjaRef}
                  className="text-left align-middle"
                  style={
                    {
                      // left: `${columnWidths.id + columnWidths.nik + columnWidths.nama}px`,
                    }
                  }
                >
                  <span>Unit Kerja</span>
                </th>
                <th
                  // ref={penugasanRef}
                  rowSpan={2}
                  className="text-left align-middle"
                  style={
                    {
                      // left: `${columnWidths.id + columnWidths.nik + columnWidths.nama + columnWidths.unitKerja}px`,
                    }
                  }
                >
                  <span>Penugasan</span>
                </th>
                <th
                  // ref={jumlahHariRef}
                  rowSpan={2}
                  className="text-center align-middle"
                  style={
                    {
                      // left: `${columnWidths.id + columnWidths.nik + columnWidths.nama + columnWidths.unitKerja + columnWidths.penugasan}px`,
                    }
                  }
                >
                  <span>
                    Jumlah <br />
                    Hari Kerja
                  </span>
                </th>

                {last7Days.map((tanggal) => (
                  <th
                    key={tanggal}
                    className="text-center"
                    colSpan={CHECK_TYPES.length}
                  >
                    <span>{formatTanggalID(tanggal)}</span>
                  </th>
                ))}
              </tr>

              {/* HEADER BARIS 2: M / K / L di bawah tiap tanggal */}
              <tr className="*:border-y *:border-gray-300 *:bg-white *:p-2 *:whitespace-nowrap [&_th>span]:block">
                {last7Days.map((tanggal) =>
                  CHECK_TYPES.map((ct) => (
                    <th
                      key={`${tanggal}-${ct.key}`}
                      className="border-x border-gray-200 text-center"
                    >
                      <span>{ct.label}</span>
                    </th>
                  )),
                )}
              </tr>
            </thead>

            <tbody className="sticky">{tableRows}</tbody>
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

export default RekapTanggalHadirPages;
