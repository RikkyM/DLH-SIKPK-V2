import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useEffect, useMemo, useState } from "react";
import { useJabatan } from "../hooks/useJabatan";
import { LoaderCircle, Pencil } from "lucide-react";
import Pagination from "@/components/Pagination";
import Dialog from "@/components/Dialog";
import { useDialog } from "@/hooks/useDialog";
import FormEdit from "../components/FormEdit";
import FormTambah from "../components/FormTambah";

const JabatanPages = () => {
  const { mode, openDialog } = useDialog();
  const { currentPage, perPage, handlePageChange, handlePerPageChange } =
    usePagination(25);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const {
    jabatan,
    loading,
    getJabatan: refetch,
  } = useJabatan(perPage, currentPage, debouncedSearch);

  const tableRows = useMemo(() => {
    return jabatan?.data?.map((row, index) => (
      <tr
        key={row.id ?? index}
        className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200 bg-white"
      >
        <td className="w-20 max-w-20 text-center">
          {(currentPage - 1) * perPage + index + 1}
        </td>
        <td className="text-center">{row.no_rekening ?? "-"}</td>
        <td>{row.nama}</td>
        <td className="text-center">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(row.gaji ?? 0)}
        </td>
        {/* <td className="text-center">-</td> */}
        <td>{row.kpa ?? "-"}</td>
        <td>{row.bp ?? "-"}</td>
        <td>{row.bpp ?? "-"}</td>
        <td>{row.pptk ?? "-"}</td>
        <td>{row.kasubbag_keuangan ?? "-"}</td>
        <td className="w-44 max-w-44 bg-inherit sticky right-0">
          <div className="flex w-full items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => openDialog({ mode: "edit", data: row })}
              className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-300"
            >
              <Pencil className="max-w-5" />
            </button>
            {/* <button className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-300">
              <Trash className="max-w-5" />
            </button> */}
          </div>
        </td>
      </tr>
    ));
  }, [jabatan?.data, currentPage, perPage, openDialog]);

  useEffect(() => {
    document.title = "Penugasan";
  }, []);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4">
        <div className="flex w-full flex-col gap-4">
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
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
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
            <button
              type="button"
              onClick={() => openDialog({ mode: "add" })}
              className="cursor-pointer rounded bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600"
            >
              Tambah
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded border border-gray-300 bg-white px-2 shadow">
        {loading ? (
          <div className="flex h-full w-full items-center">
            <LoaderCircle className="mx-auto animate-spin" />
          </div>
        ) : jabatan?.data?.length === 0 ? (
          <div className="flex h-full w-full items-center">
            <p className="mx-auto text-center">
              Tidak ada data jenis kendaraan
            </p>
          </div>
        ) : (
          <table className="w-full bg-white *:text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="*:border-b *:border-gray-300 *:bg-white *:px-4 *:py-1.5 [&_th>span]:block">
                <th className="w-20 max-w-20">
                  <span>#</span>
                </th>
                <th className="w-72 text-center whitespace-nowrap">
                  <span>No. Rekening</span>
                </th>
                <th className="w-72 text-left">
                  <span>Nama Jabatan</span>
                </th>
                <th className="text-center">
                  <span>Upah Harian</span>
                </th>
                {/* <th className="text-center">
                  <span>Kode Rekening</span>
                </th> */}
                <th className="text-left">
                  <span>Kuasa Pengguna Anggaran</span>
                </th>
                <th className="text-left">
                  <span>Bendahara Pengeluaran</span>
                </th>
                <th className="text-left">
                  <span>Bendahara Pengeluaran Pembantu</span>
                </th>
                <th className="text-left">
                  <span>PPTK</span>
                </th>
                <th className="text-left">
                  <span>Kasubbag Keuangan</span>
                </th>
                <th className="w-44 max-w-44 text-center sticky top-0 right-0 bg-inherit">
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        )}
      </div>
      <Dialog>
        {mode === "add" && <FormTambah refetch={refetch} />}
        {mode === "edit" && <FormEdit refetch={refetch} />}
      </Dialog>
      {jabatan && jabatan?.success != true && jabatan?.data?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={jabatan.last_page}
          from={jabatan.from}
          to={jabatan.to}
          total={jabatan.total}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default JabatanPages;
