import { AlarmMinus, Clock, Home, LogOut, User, UserCheck } from "lucide-react";
import { useEffect } from "react";
import Card from "../components/Card";
import { useDashboard } from "../hooks/useDashboard.hooks";

const DashboardPage = () => {
  const { data, loading } = useDashboard();

  // const footerLength = data?.headers?.length ?? 0;

  // const { loading: loadingButton, handleSync } = useSyncKehadiran(refetch);

  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-3">
        <p className="font-bold text-white">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <div className="grid w-full gap-2 rounded-md sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Jumlah Pegawai"
            count={data?.jumlah_pegawai ?? 0}
            icon={User}
            iconClassName="bg-blue-500"
            loading={loading}
          />
          <Card
            title="Finger Masuk"
            count={data?.masuk_kerja ?? 0}
            icon={UserCheck}
            iconClassName="bg-teal-500"
            loading={loading}
          />
          <Card
            title="Finger Pulang"
            count={data?.pulang_kerja ?? 0}
            icon={LogOut}
            iconClassName="bg-red-500"
            loading={loading}
          />
          <Card
            title="Finger Masuk Telat"
            count={0}
            icon={Clock}
            iconClassName="bg-amber-500"
            loading={loading}
          />
          <Card
            title="Finger Pulang Cepat"
            count={0}
            icon={AlarmMinus}
            iconClassName="bg-red-500"
            loading={loading}
          />
          <Card
            title="Tidak Finger Masuk"
            count={data?.tidakFingerMasuk ?? 0}
            icon={Home}
            iconClassName="bg-teal-500"
            loading={loading}
          />
          <Card
            title="Tidak Finger Pulang"
            count={data?.tidakFingerPulang ?? 0}
            icon={Home}
            iconClassName="bg-red-500"
            loading={loading}
          />
        </div>
        <div>
          {/* <button
            className="flex max-h-10 w-max min-w-[20ch] cursor-pointer items-center justify-center gap-2 self-end rounded bg-green-500 px-2 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow outline-none disabled:cursor-not-allowed disabled:bg-green-600 md:text-sm"
            onClick={handleSync}
            disabled={loadingButton}
          >
            {loadingButton ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div>
                  <RefreshCcw className="mx-auto max-h-5 max-w-4" />
                </div>
                Update Kehadiran
              </div>
            )}
          </button> */}
        </div>
        <div className="flex h-max w-full flex-col rounded-md border border-gray-300 bg-white shadow-md">
          <div className="sticky top-0 left-0 z-10 p-3">
            <h4 className="font-semibold">Jumlah Petugas Kebersihan</h4>
            <p className="text-xs text-gray-400">
              Data petugas kebersihan berdasarkan wilayah UPTD
            </p>
          </div>

          <div className="max-h-[510px] grow overflow-auto">
            <table className="w-full p-3">
              <thead className="sticky z-10">
                <tr className="*:sticky *:top-0 *:bg-white *:p-2">
                  <th className="w-16">#</th>
                  <th className="left-0 sticky top-0 left-0 z-20 w-72 bg-white text-left whitespace-nowrap">
                    Nama UPTD
                  </th>
                  <th className="">Total</th>
                  {data?.headers.map((data) => (
                    <th key={data}>{data}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.data_table.map((item, index) => {
                  return (
                    <tr
                      key={item.nama}
                      className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:*:bg-gray-200"
                    >
                      <td>{index + 1}</td>
                      <td className="sticky left-0  bg-white whitespace-nowrap">
                        {item.nama}
                      </td>
                      <td className="text-center whitespace-nowrap">
                        {item.total}
                      </td>
                      {data.headers.map((header) => {
                        const key = header.toLowerCase().replace(/\s+/g, "_");

                        return (
                          <td key={key} className="text-center">
                            {item[key] ?? 0}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="transition-colors *:sticky *:bottom-0 *:border-b *:border-gray-300 *:bg-white *:px-4 *:py-1.5 hover:*:bg-gray-200">
                  <td></td>
                  <td className="left-0 z-10 font-bold">Total</td>
                  <td className="text-center">
                    {data?.data_table.reduce(
                      (acc, curr) => acc + Number(curr.total ?? 0),
                      0,
                    )}
                  </td>
                  {data?.headers.map((h) => {
                    const key = h.toLowerCase().replace(/\s+/g, "_");

                    const total = data?.data_table.reduce(
                      (acc, curr) => acc + Number(curr[key] ?? 0),
                      0,
                    );

                    return (
                      <td key={h} className="text-center">
                        {total}
                      </td>
                    );
                  })}
                  {/* <td colSpan={footerLength}>
                    
                  </td> */}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
