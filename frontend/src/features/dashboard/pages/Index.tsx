import { Clock, LogOut, User, UserCheck } from "lucide-react";
import { useEffect } from "react";
import Card from "../components/Card";
import { useDashboard } from "../hooks/useDashboard.hooks";

const DashboardPage = () => {
  const { data, loading } = useDashboard();

  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4">
        <div className="grid w-full gap-2 rounded-md sm:grid-cols-2 lg:grid-cols-5">
          <Card
            title="Jumlah Pegawai"
            count={data?.jumlah_pegawai ?? 0}
            icon={User}
            iconClassName="bg-blue-500"
            loading={loading}
          />
          <Card
            title="Masuk Kerja"
            count={data?.masuk_kerja ?? 0}
            icon={UserCheck}
            iconClassName="bg-teal-500"
            loading={loading}
          />
          <Card
            title="Pulang Kerja"
            count={data?.pulang_kerja ?? 0}
            icon={LogOut}
            iconClassName="bg-red-500"
            loading={loading}
          />
          <Card
            title="Terlambat Masuk"
            count={0}
            icon={Clock}
            iconClassName="bg-amber-500"
            loading={loading}
          />
          <Card
            title="Pulang Cepat"
            count={0}
            icon={LogOut}
            iconClassName="bg-red-500"
            loading={loading}
          />
        </div>
        {/* <div className="w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-md">
          <table className="w-full bg-white">
            <thead>
              <tr className="*:p-2">
                <th className="w-16">#</th>
                <th className="text-left w-72">Nama Lengkap</th>
                <th className="">#</th>
                <th className="">#</th>
              </tr>
            </thead>
          </table>
        </div> */}
      </div>
    </>
  );
};

export default DashboardPage;
