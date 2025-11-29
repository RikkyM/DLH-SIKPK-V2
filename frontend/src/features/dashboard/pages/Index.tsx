import { Clock, LogOut, User, UserCheck } from "lucide-react";
import { useEffect } from "react";
import Card from "../components/Card";

const DashboardPage = () => {
  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4">
        <div className="grid w-full gap-4 rounded-md sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Jumlah Pegawai"
            count={1667}
            icon={User}
            iconClassName="bg-blue-500"
          />
          <Card
            title="Hadir"
            count={103}
            icon={UserCheck}
            iconClassName="bg-teal-500"
          />
          <Card
            title="Telat Absen"
            count={39}
            icon={Clock}
            iconClassName="bg-amber-500"
          />
          <Card
            title="Pulang Cepat"
            count={0}
            icon={LogOut}
            iconClassName="bg-red-500"
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
