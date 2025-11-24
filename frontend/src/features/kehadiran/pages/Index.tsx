const KehadiranPages = () => {
  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4"></div>
      <div className="flex-1 overflow-auto rounded border border-gray-300 px-2 shadow">
        <table className="w-full bg-white *:text-sm">
          <thead className="sticky top-0">
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
                <span>Penugasan</span>
              </th>
              <th className="text-left">
                <span>Department</span>
              </th>
              <th className="text-left">
                <span>Shift Kerja</span>
              </th>
              <th className="text-center">
                <span>Tanggal</span>
              </th>
              <th className="text-left">
                <span>Jam Masuk</span>
              </th>
              <th className="text-left">
                <span>Jam Pulang</span>
              </th>
              <th className="text-left">
                <span>Jam Telat</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="transition-colors *:border-b *:border-gray-300 *:px-4 *:py-1.5 hover:bg-gray-200">
              <td className="text-center">1</td>
              <td className="px-4 py-1.5 text-center font-medium">
                1839274829182738
              </td>
              <td>Rikky Mahendra</td>
              <td>-</td>
              <td>UPT DLH KERTAPATI</td>
              <td>Shift 2<br/>
                06:00 - 16:00
              </td>
              <td className="text-center">24 Nov 2025</td>
              <td>06:25:15</td>
              <td>16:03:00</td>
              <td>00:25:15</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default KehadiranPages;
