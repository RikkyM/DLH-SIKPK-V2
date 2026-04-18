import { AlarmMinus, Clock, Home, LogOut, User, UserCheck } from "lucide-react";
import { useEffect } from "react";
import Card from "../components/Card";
import { useDashboard } from "../hooks/useDashboard.hooks";

const DashboardPage = () => {
  const { data, loading } = useDashboard();

  // const [open, setOpen] = useState<number | null>(null);

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
        
        {/* <div className="w-full rounded-sm border border-gray-300 bg-white p-3 shadow-md">
          <div className="rounded">
            <div className="grid w-full grid-cols-[60px_1fr_250px] divide-x divide-gray-300 border-b border-gray-300 font-medium *:p-2">
              <h2 className="text-center">No.</h2>
              <h2>Nama Department</h2>
              <h2 className="text-center">Jumlah</h2>
            </div>

            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index}>
                <button
                  type="button"
                  onClick={() =>
                    setOpen((prev) => (prev === index ? null : index))
                  }
                  className="grid w-full cursor-pointer grid-cols-[60px_1fr_250px] divide-x divide-gray-300 text-left outline-none *:px-2 hover:bg-gray-200 *:py-1.5"
                >
                  <div className="text-center">{index + 1}</div>
                  <div>Contoh Department {index + 1}</div>
                  <div className="text-center">{10 * (index + 1)}</div>
                </button>
                <div
                  className={`grid bg-white transition-all duration-500 ${open === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <ul className="flex flex-col overflow-hidden">
                    {[
                      "Crew Angkutan Sampah",
                      "Penyapuan",
                      "Penyapuan Keliling",
                      "Sopir Angkutan Sampah",
                    ].map((data, i) => (
                      <li
                        key={i}
                        className="grid grid-cols-[60px_1fr_250px] divide-x divide-gray-300 *:px-2 *:pb-2"
                      >
                        <div />
                        <div>
                          {String.fromCharCode(97 + i)}. {data}
                        </div>
                        <div className="text-center">{10 * (index + 1)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div> */}
        
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
                  <th className="sticky top-0 left-0 z-20 w-72 bg-white text-left whitespace-nowrap">
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
                      <td className="sticky left-0 bg-white whitespace-nowrap">
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
