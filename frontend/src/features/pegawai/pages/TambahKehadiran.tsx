import Combobox from "@/components/Combobox";
import DateInput from "@/components/DateInput";
import { useDateRangeLimit } from "@/features/gaji/hooks/useDateRangeLimit";
import { useJabatan } from "@/features/jabatan/hooks/useJabatan";
import { useFilterAsn } from "@/features/pns/hooks/useAsnFilter";
import { useShiftKerja } from "@/features/shiftKerja/hooks/useShiftKerja";
import { useDebounce } from "@/hooks/useDebounce";
import { useDepartment } from "@/hooks/useDepartment";
import { usePagination } from "@/hooks/usePagination";
import { useMemo, useState, type FormEvent } from "react";
import { useDataKehadiran } from "../hooks/useDataKehadiran";
import { LoaderCircle } from "lucide-react";
import Pagination from "@/components/Pagination";

interface State {
  search?: string;
  department: number | null;
  jabatan: number | null;
  shift: number | null;
  korlap: number | null;
  fromDate?: string;
  toDate?: string;
  appliedFromDate?: string;
  appliedToDate?: string;
}

const CHECK_TYPE: Record<number, string> = {
  0: "Masuk",
  1: "Pulang",
};

const TambahKehadiran = () => {
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination();

  const [state, setState] = useState<State>({
    search: "",
    department: null,
    jabatan: null,
    shift: null,
    korlap: null,
    fromDate: "",
    toDate: "",
    appliedFromDate: "",
    appliedToDate: "",
  });
  const { fromMin, fromMax, toMin, toMax } = useDateRangeLimit(
    state.fromDate,
    state.toDate,
  );

  const debouncedSearch = useDebounce(state.search, 500);

  const { dataKehadiran, loading } = useDataKehadiran(
    perPage,
    currentPage,
    debouncedSearch,
    state.appliedFromDate,
    state.appliedToDate,
    state.department,
    state.shift,
    state.korlap,
    state.jabatan,
  );

  const tableRows = useMemo(() => {
    return dataKehadiran?.data?.map((k, i) => (
      <tr
        key={k.id ?? i}
        className="transition-colors *:border-b *:border-gray-300 *:px-2 *:py-1.5 hover:bg-gray-200"
      >
        <td className="text-center">{(currentPage - 1) * perPage + i + 1}</td>
        <td className="text-center font-medium">{k.pegawai?.badgenumber}</td>
        <td>{k.pegawai?.nama}</td>

        <td>{k.pegawai?.jabatan?.nama ?? "-"}</td>
        <td>{k.pegawai.department?.DeptName}</td>
        <td className="text-center">{CHECK_TYPE[k.check_type]}</td>
        <td className="text-center">
          {new Date(k.check_time.slice(0, 10)).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </td>
        <td className="text-center">{k.check_time.slice(11, 19)}</td>
      </tr>
    ));
  }, [dataKehadiran, currentPage, perPage]);

  const { departments, loading: deptLoad } = useDepartment();
  const { kategoriKerja, loading: shiftLoad } = useShiftKerja();
  const { penugasan, loading: penugasanLoad } = useJabatan();
  const { datas, loading: datasLoad } = useFilterAsn();

  const kategoriKerjaOptions = kategoriKerja.map((k) => ({
    ...k,
    jadwal: `${k.jadwal.replace(/kategori\s*(\d+)/i, "K$1")} 
  ${k.jam_masuk.slice(0, 5)} s.d ${k.jam_keluar.slice(0, 5)} WIB`,
  }));

  const penugasanOptions = penugasan.map((k) => ({ ...k }));

  const handleSearchDate = (e: FormEvent) => {
    e.preventDefault();

    setState((prev) => ({
      ...prev,
      appliedFromDate: state.fromDate,
      appliedToDate: state.toDate,
    }));

    handlePageChange(1);
  };

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4">
        <div className="flex w-full flex-col gap-4">
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
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-sm font-medium text-white">Tanggal:</span>
              <label htmlFor="from_date" className="flex items-center gap-2">
                <DateInput
                  id="from_date"
                  value={state.fromDate ?? ""}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, fromDate: e.target.value }))
                  }
                  placeholder="Tanggal Awal..."
                  min={fromMin || undefined}
                  max={fromMax || undefined}
                />
              </label>

              <label htmlFor="to_date" className="flex items-center gap-2">
                <DateInput
                  id="to_date"
                  value={state.toDate ?? ""}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, toDate: e.target.value }))
                  }
                  placeholder="Tanggal Akhir..."
                  min={toMin || undefined}
                  max={toMax || undefined}
                />
              </label>
              <button
                type="submit"
                className="cursor-pointer rounded-sm bg-blue-600 px-3 py-1 text-white shadow outline-none"
              >
                Cari
              </button>
            </form>
            <label htmlFor="search" className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Cari:</span>
              <input
                id="search"
                type="search"
                placeholder="NIK / Nama..."
                className="h-9 w-[270px] rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                value={state.search}
                onChange={(e) => {
                  setState((prev) => ({ ...prev, search: e.target.value }));
                  handlePageChange(1);
                }}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex w-full flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-white">Filter:</span>

              <Combobox
                datas={departments}
                getLoading={deptLoad}
                labelKey="DeptName"
                valueKey="DeptID"
                placeholder="Unit Kerja"
                className="bg-white"
                maxWidth="max-w-58"
                value={state.department ?? ""}
                onChange={(value) => {
                  setState((prev) => ({
                    ...prev,
                    department: value ? Number(value) : null,
                  }));
                  handlePageChange(1);
                }}
              />
              <Combobox
                datas={penugasanOptions}
                getLoading={penugasanLoad}
                labelKey="nama"
                valueKey="id"
                placeholder="Penugasan"
                className="bg-white"
                maxWidth="max-w-65"
                value={state.jabatan ?? undefined}
                onChange={(value) => {
                  setState((prev) => ({
                    ...prev,
                    jabatan: value ? Number(value) : null,
                  }));
                  handlePageChange(1);
                }}
              />
              <Combobox
                datas={kategoriKerjaOptions}
                getLoading={shiftLoad}
                labelKey="jadwal"
                valueKey="id"
                placeholder="Kategori Kerja"
                className="bg-white"
                maxWidth="max-w-54"
                value={state.shift ?? undefined}
                onChange={(value) => {
                  setState((prev) => ({
                    ...prev,
                    shift: value ? Number(value) : null,
                  }));
                  handlePageChange(1);
                }}
              />
              <Combobox
                datas={datas}
                getLoading={datasLoad}
                labelKey="nama"
                valueKey="id"
                placeholder="Operator Lapangan"
                className="bg-white"
                maxWidth="max-w-82"
                value={state.korlap ?? undefined}
                onChange={(value) => {
                  setState((prev) => ({
                    ...prev,
                    korlap: value ? Number(value) : null,
                  }));
                  handlePageChange(1);
                }}
              />

              {/* <label
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
              </label> */}

              {/* <label
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
              </label> */}

              {/* <label
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
              </label> */}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded border border-gray-300 bg-white shadow">
        {loading ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : dataKehadiran?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">Tidak ada data kehadiran</p>
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
                  <span>Nama Lengkap</span>
                </th>
                <th className="text-left">
                  <span>Unit Kerja</span>
                </th>
                <th className="text-left">
                  <span>Penugasan</span>
                </th>
                <th className="text-center">
                  <span>Finger</span>
                </th>
                <th className="text-center">
                  <span>Tanggal</span>
                </th>
                <th className="text-center">
                  <span>Waktu</span>
                </th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        )}
      </div>
      {dataKehadiran &&
        dataKehadiran?.success !== true &&
        dataKehadiran?.data?.length > 0 && (
          <Pagination
            currentPage={currentPage}
            lastPage={dataKehadiran.last_page}
            from={dataKehadiran.from}
            to={dataKehadiran.to}
            total={dataKehadiran.total}
            onPageChange={handlePageChange}
          />
        )}
    </>
  );
};

export default TambahKehadiran;
