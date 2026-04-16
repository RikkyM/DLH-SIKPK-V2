const InformasiPages = () => {
  return (
    <>
      <div className="border-border-gray-300 flex-1 overflow-auto rounded bg-white p-2 shadow *:text-[.80rem] *:md:text-base">
        <div className="p-2 text-center font-bold">
          <h2>KETERANGAN MENU/SUBMENU</h2>
          <h2>SISTEM INFORMASI KEHADIRAN PETUGAS KEBERSIHAN</h2>
        </div>

        <ul className="list-inside list-decimal *:text-sm *:md:text-base [&>li]:font-bold px-1.5 md:px-3">
          <li>Dashboard</li>
          <div>
            <p>
              Halaman utama yang menampilkan ringkasan data secara umum, seperti
            </p>
            <ul className="mx-2 list-outside list-disc px-2 pb-3">
              <li>Jumlah petugas</li>
              <li>Kehadiran hari ini</li>
              <li>
                <p>Rekap cepat aktivitas</p>
                <p>Biasanya digunakan untuk monitoring cepat</p>
              </li>
            </ul>
          </div>
          <div className="mx-1 mb-3 border border-gray-400" />
          <li>Petugas</li>
          <div>
            <p>Menu untuk mengelola data petugas, meliputi:</p>
            <ul className="mx-2 list-outside list-disc px-2 pb-3">
              <li>Input data petugas baru</li>
              <li>Edit atau update data petugas</li>
              <li>Melihat daftar seluruh petugas</li>
            </ul>
          </div>
          <div className="mx-1 mb-3 border border-gray-400" />
          <li>Log Kehadiran</li>
          <div>
            <p>Menampilkan riwayat kehadiran secara detail (log), seperti:</p>
            <ul className="mx-2 list-outside list-disc px-2 pb-3">
              <li>Jam masuk dan pulang</li>
              <li>Tanggal kehadiran</li>
              <li>Aktivitas absensi yang tercatat</li>
            </ul>
          </div>
          <div className="mx-1 mb-3 border border-gray-400" />
          <li>Kehadiran Per Tanggal</li>
          <div>
            <p>Menampilkan data kehadiran berdasarkan tanggal tertentu:</p>
            <ul className="mx-2 list-outside list-disc px-2 pb-3">
              <li>Siapa saja yang hadir/tidak hadir di hari tersebut</li>
              <li>Memudahkan pengecekan harian</li>
            </ul>
          </div>
          <div className="mx-1 mb-3 border border-gray-400" />
          <li>Rekap Per Petugas</li>
          <div>
            <p>
              Rekapitulasi kehadiran yang disusun berdasarkan masing-masing
              petugas dalam periode tertentu. Menu ini digunakan untuk memantau
              kinerja dan kehadiran individu secara lebih rinci. Di dalam menu
              ini tersedia detail informasi sebagai berikut:
            </p>
            <ul className="mx-2 list-outside list-disc px-2 pb-3">
              <li>
                <span className="font-bold">Jam Masuk</span>: Waktu kedatangan
                petugas saat mulai bekerja
              </li>
              <li>
                <span className="font-bold">Jam Pulang</span>: Waktu petugas
                menyelesaikan pekerjaan
              </li>
              <li>
                <span className="font-bold">Jam Telat</span>: Durasi
                keterlambatan dari jam kerja yang telah ditentukan
              </li>
              <li>
                <span className="font-bold">Jam Pulang Cepat</span>: Durasi
                petugas pulang sebelum waktu kerja berakhir
              </li>
              <li>
                <span className="font-bold">Upah Kerja</span>: Besaran upah yang
                diperoleh berdasarkan kehadiran dan kinerja
              </li>
              <li>
                <span className="font-bold">Potongan Upah</span>: Pengurangan
                upah akibat ketidakhadiran, keterlambatan, atau pelanggaran
                lainnya
              </li>
              <li>
                <span className="font-bold">Keterangan</span>: Informasi
                tambahan seperti izin, sakit, cuti, atau catatan lainnya
              </li>
              <li>Keterangan lain (izin,sakit, dll)</li>
            </ul>
          </div>
          <div className="mx-1 mb-3 border border-gray-400" />
          <li>Rekap Tanggal Hadir</li>
          <div>
            <p>
              Rekap kehadiran dalam bentuk per tanggal (umumnya periode
              tertentu):
            </p>
            <ul className="mx-2 list-outside list-disc px-2 pb-3">
              <li>Digunakan untuk laporan bulanan/periodik</li>
              <li>Melihat tren kehadiran</li>
            </ul>
          </div>
          <div className="mx-1 mb-3 border border-gray-400" />
          <li>SPJ Upah Kerja</li>
          <div>
            <p>Menu untuk membuat atau melihat:</p>
            <ul className="mx-2 list-outside list-disc px-2 pb-3">
              <li>Surat Pertanggungjawaban (SPJ) upah kerja</li>
              <li>Perhitungan gaji/upah berdasarkan kehadiran</li>
            </ul>
          </div>
          <div className="mx-1 mb-3 border border-gray-400" />
          <li>SPJ Potongan Datang Telat / Pulang Cepat (DT/PC)</li>
          <div>
            <p>Digunakan untuk:</p>
            <ul className="mx-2 list-outside list-disc px-2 pb-3">
              <li>
                Menghitung potongan upah (misalnya karena tidak hadir,
                terlambat, atau pelanggaran)
              </li>
              <li>
                DT/PC biasanya mengacu pada jenis potongan tertentu sesuai
                aturan instansi
              </li>
            </ul>
          </div>
          <div className="mx-1 mb-3 border border-gray-400" />
          <li>Tambah / Update Kehadiran</li>
          <div>
            <p>Menu untuk:</p>
            <ul className="mx-2 list-outside list-disc px-2 pb-3">
              <li>
                Mengoreksi atau memperbarui data kehadiran petugas untuk kendala
                teknis, seperti mesin mati karena Listrik padam, mesin rusak,
                atau ada taruna dan Dinas yang tidak memungkinkan fingerprint
                tepat waktu, dalam hal ini di dukung dengan foto kegiatan di
                depan mesin absen / foto kegiatan di Lokasi taruna dengan
                tertera timestamp (tanggal, waktu, dan lokasi)
              </li>
            </ul>
          </div>
          {/* <div className="mx-1 mb-3 border border-gray-400" /> */}
        </ul>
      </div>
    </>
  );
};

export default InformasiPages;
