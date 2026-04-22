import DateInput from "@/components/DateInput";
import { useEffect, useMemo, useState, type FormEvent } from "react";
// import { useDateRangeLimit } from "../hooks/useDateRangeLimit";
import { usePagination } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { LoaderCircle, RefreshCcw, X } from "lucide-react";
import { usePotonganGaji } from "../hooks/usePotonganGaji";
import Pagination from "@/components/Pagination";
import { useDepartment } from "@/hooks/useDepartment";
import { useShiftKerja } from "@/features/shiftKerja/hooks/useShiftKerja";
import { useJabatan } from "@/features/jabatan/hooks/useJabatan";
import { useFilterAsn } from "@/features/pns/hooks/useAsnFilter";
import { useAuth } from "@/features/auth";
import { useExportPotonganGaji } from "../hooks/useExportPotonganGaji";

const SpjPotonganGajiPages = () => {
  const { user } = useAuth();
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [shift, setShift] = useState("");
  const [korlap, setKorlap] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [tanggalSpj, setTanggalSpj] = useState("");
  const [toDate, setToDate] = useState("");
  const [potongan, setPotongan] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  // const { fromMin, fromMax, toMin, toMax } = useDateRangeLimit(
  //   fromDate,
  //   toDate,
  // );
  const debouncedSearch = useDebounce(search, 500);

  const { departments } = useDepartment();
  const { kategoriKerja } = useShiftKerja();
  const { penugasan } = useJabatan();
  const { datas } = useFilterAsn();

  const { mutate: exportGaji, isPending } = useExportPotonganGaji();
  const { gaji, loading } = usePotonganGaji(
    perPage,
    currentPage,
    debouncedSearch,
    appliedFromDate,
    appliedToDate,
    department,
    shift,
    korlap,
    jabatan,
    potongan,
  );

  console.log(gaji)

  const tableRows = useMemo(
    () =>
      gaji?.data?.map((k, i) => (
        <tr
          key={k.id ?? i}
          className="transition-colors *:border-b *:border-gray-300 *:px-2 *:py-1.5 hover:bg-gray-200"
        >
          <td className="text-center">{(currentPage - 1) * perPage + i + 1}</td>
          <td className="text-center font-medium">
            <a
              href={`spj-potongan-gaji/petugas?badgenumber=${k.badgenumber}&department=${k.department ?? undefined}&penugasan=${k.jabatan ?? undefined}&from_date=${fromDate}&to_date=${toDate}`}
              onClick={(e) => {
                if (!fromDate && !toDate) {
                  e.preventDefault();
                  alert("Pilih tanggal terlebih dahulu.");
                }
              }}
              target="_blank"
              className={["text-blue-500 hover:underline"].join(" ")}
            >
              {k.badgenumber}
            </a>
          </td>
          <td>{k.no_rekening ?? "-"}</td>
          <td>{k.nama}</td>
          <td>{k.jabatan ?? "-"}</td>
          <td>{k.department}</td>
          <td className="text-center">{k.jumlah_hari}</td>
          <td className="text-center">{k.jumlah_masuk}</td>
          <td className="text-center">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(k.gaji ?? 0)}
          </td>
          <td className="text-center">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(k.upah_kotor ?? 0)}
          </td>
          <td className="text-center">
            {k.gaji
              ? new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(k.potongan)
              : "Rp 0"}
          </td>
          <td className="text-center">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(k.upah_bersih ?? 0)}
          </td>
        </tr>
      )),
    [gaji?.data, currentPage, perPage, fromDate, toDate],
  );

  useEffect(() => {
    document.title = "SPJ Potongan Gaji";
  }, []);

  const handleSearchDate = (e: FormEvent) => {
    e.preventDefault();

    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);

    handlePageChange(1);
  };

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4 overflow-hidden">
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap">
            {/* Per page */}
            <label
              htmlFor="per_page"
              className="flex w-full w-max min-w-28 items-center gap-2 rounded"
            >
              <span className="text-sm font-medium text-white">Show:</span>
              <select
                name="per_page"
                id="per_page"
                className="h-full w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none"
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="2000">2000</option>
              </select>
            </label>
            <form
              onSubmit={handleSearchDate}
              className="flex items-center gap-2"
            >
              <span className="text-sm font-medium text-white">Tanggal:</span>
              <label htmlFor="from_date" className="flex items-center gap-2">
                <DateInput
                  id="from_date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="Tanggal Awal..."
                  // min={fromMin || undefined}
                  // max={fromMax || undefined}
                />
              </label>

              <label htmlFor="to_date" className="flex items-center gap-2">
                <DateInput
                  id="to_date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="Tanggal Akhir..."
                  // min={toMin || undefined}
                  // max={toMax || undefined}
                />
              </label>
              <button
                type="submit"
                className="cursor-pointer rounded-sm bg-blue-600 px-3 py-1 text-white shadow outline-none"
              >
                PROSES
              </button>
            </form>
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
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-2 sm:flex-wrap">
              <span className="text-sm font-medium text-white">Filter:</span>
              {!["operator"].includes(user?.role as string) && (
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
                      handlePageChange(1);
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
              )}
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
                    setJabatan(e.target.value);
                    handlePageChange(1);
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
                    setShift(e.target.value);
                    handlePageChange(1);
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
                  className={`${shift ? "cursor-pointer" : "cursor-default"}`}
                >
                  <X
                    className={`max-w-5 ${
                      shift
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
                  value={korlap}
                  onChange={(e) => {
                    setKorlap(e.target.value);
                    handlePageChange(1);
                  }}
                >
                  <option value="" disabled hidden>
                    Operator Lapangan
                  </option>
                  {datas?.map((p, index) => (
                    <option
                      key={p.id ?? index}
                      value={p.id}
                      className="text-xs font-medium"
                    >
                      {p.nama}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setKorlap("")}
                  className={`${korlap ? "cursor-pointer" : "cursor-default"}`}
                >
                  <X
                    className={`max-w-5 ${
                      korlap
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-30"
                    } `}
                  />
                </button>
              </label>
              <label
                htmlFor="potongan_upah"
                className="relative flex w-full w-max min-w-32 min-w-44 items-center justify-between gap-2 rounded border border-gray-300 bg-white pr-2 focus-within:ring-1 focus-within:ring-blue-400"
              >
                <select
                  name="potongan_upah"
                  id="potongan_upah"
                  className="h-full w-max cursor-pointer appearance-none py-1.5 pl-2 text-sm focus:outline-none"
                  value={potongan}
                  onChange={(e) => {
                    setPotongan(e.target.value);
                    handlePageChange(1);
                  }}
                >
                  <option value="" disabled hidden>
                    Potongan Upah
                  </option>
                  <option value="ada">Ada</option>
                  <option value="tidak ada">Tidak Ada</option>
                </select>
                <button
                  type="button"
                  onClick={() => setPotongan("")}
                  className={`${potongan ? "cursor-pointer" : "cursor-default"}`}
                >
                  <X
                    className={`max-w-5 ${
                      potongan
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-50"
                    }`}
                  />
                </button>
              </label>
              <DateInput
                id="tanggal_spj"
                value={tanggalSpj}
                onChange={(e) => setTanggalSpj(e.target.value)}
                placeholder="Tanggal SPJ..."
                // min={toMin || undefined}
                // max={toMax || undefined}
              />
            </div>
          </div>
          <button
            type="button"
            className="max-h-10 w-max min-w-[10ch] cursor-pointer self-start rounded bg-green-700 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none hover:bg-green-800 disabled:cursor-not-allowed disabled:hover:bg-green-700 md:text-sm"
            onClick={() => {
              exportGaji({
                search,
                department,
                jabatan,
                shift,
                korlap,
                fromDate: appliedFromDate,
                toDate: appliedToDate,
                tanggal_spj: tanggalSpj,
              });
            }}
            disabled={
              isPending ||
              Array.isArray(gaji) ||
              gaji?.data.length === 0 ||
              !appliedFromDate ||
              !appliedToDate
            }
          >
            {isPending ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              <div>Export Excel</div>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded border border-gray-300 bg-white shadow">
        {loading ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : gaji?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">Tidak ada data gaji</p>
          </div>
        ) : (
          <table className="w-full bg-white *:text-sm">
            <thead className="sticky top-0">
              <tr className="*:border-y *:border-gray-300 *:bg-white *:p-2 *:whitespace-nowrap [&_th>span]:block">
                <th className="max-w-20">
                  <span>#</span>
                </th>
                <th className="max-w-[20ch]">
                  <span>NIK</span>
                </th>
                <th className="text-left">
                  <span>No. Rekening</span>
                </th>
                <th className="text-left">
                  <span>Nama Lengkap</span>
                </th>
                <th className="text-left">
                  <span>Penugasan</span>
                </th>
                <th className="text-left">
                  <span>Unit Kerja</span>
                </th>
                <th className="text-center">
                  <span>
                    Jumlah <br /> Hari Kerja
                  </span>
                </th>
                <th className="text-center">
                  <span>
                    Jumlah <br /> Masuk Kerja
                  </span>
                </th>
                <th className="text-center">
                  <span>Upah Harian</span>
                </th>
                <th className="text-center">
                  <span>Total Upah Kerja</span>
                </th>
                <th className="text-center">
                  <span>Potongan Upah Kerja</span>
                </th>
                <th className="text-center">
                  <span>Upah Yang harus Dibayar</span>
                </th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
            {appliedFromDate && appliedToDate && (
              <tfoot>
                <tr className="sticky bottom-0 *:border-y *:border-gray-300 *:bg-white *:p-2 *:whitespace-nowrap [&_th>span]:block">
                  <td colSpan={8} />
                  <td className="text-right font-medium">
                    <span>Total :</span>
                  </td>
                  <td className="text-center">
                    <span>
                      {gaji?.total_gaji_harian
                        ? new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(
                            ((gaji?.total_gaji_harian ?? 0)),
                          )
                        : "Rp 0"}
                    </span>
                  </td>
                  <td className="text-center">
                    {gaji?.total_potongan
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(gaji?.total_potongan ?? 0)
                      : "Rp 0"}
                  </td>
                  <td className="text-center">
                    {gaji?.total_upah_bersih
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(gaji?.total_upah_bersih ?? 0)
                      : "Rp 0"}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>

      {gaji && gaji?.success !== true && gaji?.data?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={gaji.last_page}
          from={gaji.from}
          to={gaji.to}
          total={gaji.total}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default SpjPotonganGajiPages;
