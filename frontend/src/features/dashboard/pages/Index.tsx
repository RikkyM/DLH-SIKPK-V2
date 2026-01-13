import { AlarmMinus, Clock, Home, LogOut, User, UserCheck } from "lucide-react";
import { useEffect } from "react";
import Card from "../components/Card";
import { useDashboard } from "../hooks/useDashboard.hooks";

const DashboardPage = () => {
  const { data, loading } = useDashboard();

  // const { loading: loadingButton, handleSync } = useSyncKehadiran(refetch);

  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4">
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
        <div className="w-full rounded-md border border-gray-300 bg-white p-3 shadow-md">
          <h4 className="font-semibold">Jumlah Petugas Kebersihan</h4>
          <p className="text-xs text-gray-400">
            Data petugas kebersihan berdasarkan wilayah UPTD
          </p>
          <div className="overflow-auto">
            <table className="w-full bg-white">
              <thead>
                <tr className="*:p-2">
                  <th className="w-16">#</th>
                  <th className="sticky left-0 z-10 w-72 bg-white text-left whitespace-nowrap">
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
                  // const convertHeaders = data?.headers.map((itm) =>
                  //   itm.toLowerCase().replace(" ", "_"),
                  // );

                  // console.log(item[convertHeaders]);
                  return (
                    <tr
                      key={item.nama}
                      className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:*:bg-gray-200"
                    >
                      <td>{index + 1}</td>
                      <td className="whitespace-nowrap sticky left-0 bg-white z-10">{item.nama}</td>
                      <td className="whitespace-nowrap">{item.total}</td>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
