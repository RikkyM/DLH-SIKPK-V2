<?php

namespace App\Exports\Kehadiran;

use App\Models\Departments;
use App\Models\EncryptFile;
use App\Models\Holiday;
use App\Models\Jabatan;
use App\Models\Pegawai;
use App\Models\PegawaiAsn;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\{FromCollection, ShouldAutoSize, WithCustomStartCell, WithDrawings, WithEvents, WithHeadings, WithMapping};
// use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\{AfterSheet, BeforeExport};
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\{Alignment, Border};
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
// use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RekapTanggalHadirExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithEvents, WithCustomStartCell, WithDrawings
{

    private Request $request;

    private Carbon $from;
    private Carbon $to;

    /** @var Carbon[] */
    private array $dates = [];

    /** @var array<int, array<string, array{masuk:string, pulang:string}>> */
    private array $absensi = [];

    /** @var array<int,int> */
    private array $jumlahHariKerja = [];

    private int $no = 0;

    private int $startRow = 7;

    private array $tanggalSkip = [];
    private array $holidays = [];

    private function toKategoriKode(string $jadwal): string
    {
        $jadwal = trim($jadwal);

        if ($jadwal === '') return '-';

        // Kalau sudah format K1/K2 dst, biarkan
        if (preg_match('/^k\s*\d+$/i', $jadwal)) {
            return strtoupper(str_replace(' ', '', $jadwal)); // "k 1" -> "K1"
        }

        // Ambil angka dari "Kategori 1" / "kategori 2" / dll
        if (preg_match('/kategori\s*(\d+)/i', $jadwal, $m)) {
            return 'K' . $m[1];
        }

        // Fallback: ambil angka pertama apapun (misal "Shift 3" -> K3)
        if (preg_match('/(\d+)/', $jadwal, $m)) {
            return 'K' . $m[1];
        }

        return '-';
    }

    public function __construct(Request $request)
    {
        $this->request = $request;

        $tz = 'Asia/Jakarta';

        $fromDate = $request->input('from_date');
        $toDate   = $request->input('to_date');

        if (!$fromDate && !$toDate) {
            $this->to   = Carbon::today($tz)->startOfDay();
            $this->from = (clone $this->to)->subDays(6)->startOfDay();
        } else {
            if ($fromDate && $toDate) {
                $this->from = Carbon::parse($fromDate, $tz)->startOfDay();
                $this->to   = Carbon::parse($toDate, $tz)->startOfDay();
            } elseif ($fromDate && !$toDate) {
                $this->from = Carbon::parse($fromDate, $tz)->startOfDay();
                $this->to   = (clone $this->from);
            } else { // !$fromDate && $toDate
                $this->to   = Carbon::parse($toDate, $tz)->startOfDay();
                $this->from = (clone $this->to);
            }
        }

        if ($this->from->gt($this->to)) {
            [$this->from, $this->to] = [$this->to, $this->from];
        }

        $diffDays = $this->from->diffInDays($this->to);
        if ($diffDays > 30) {
            abort(422, 'Rentang tanggal maksimal 30 hari.');
        }

        // build dates list (inklusif)
        $cursor = $this->from->copy();
        while ($cursor->lte($this->to)) {
            $this->dates[] = $cursor->copy();
            $cursor->addDay();
        }

        foreach ($this->dates as $d) {
            if ($d->isWeekend()) {
                $this->tanggalSkip[] = $d->toDateString();
            }
        }

        // Catatan untuk ambil tanggal libur
        // $this->holidays = Holiday::whereBetween('date', [
        //     $this->from->toDateString(),
        //     $this->to->toDateString()
        // ])->pluck(DB::raw('DATE(date)'))->toArray();

        // foreach ($this->dates as $d) {
        //     if ($d->isWeekend() || in_array($d->toDateString(), $this->holidays)) {
        //         $this->tanggalSkip[] = $d->toDateString();
        //     }
        // }
    }

    public function startCell(): string
    {
        return 'A' . $this->startRow;
    }

    public function drawings()
    {
        $logoPath = public_path('img/logo_palembang.webp');
        if (!is_file($logoPath)) {
            return [];
        }

        $drawing = new Drawing();
        $drawing->setName('Logo');
        $drawing->setDescription('Logo');
        $drawing->setPath($logoPath);
        $drawing->setHeight(55);
        $drawing->setCoordinates('C2');

        $drawing->setOffsetX(60);
        $drawing->setOffsetY(-5);

        return [$drawing];
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection(): Collection
    {
        $perPage    = (int) $this->request->input('per_page', 50); // tidak dipakai di export, tapi aman
        $search     = $this->request->input('search');
        $department = $this->request->input('department');
        $jabatan    = $this->request->input('jabatan');
        $shift      = $this->request->input('shift');
        $korlap     = $this->request->input('korlap');

        $canSeeAll = in_array(Auth::user()->role, ['superadmin', 'admin', 'keuangan', 'viewer'], true);

        $datas = Pegawai::with([
            'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
            'kehadirans' => fn($q) => $q
                ->whereBetween('check_time', [
                    $this->from->copy()->startOfDay(),
                    $this->to->copy()->endOfDay(),
                ])
                ->orderBy('check_time'),
            'shift',
            'jabatan',
        ])
            ->where(function ($data) {
                $data->where('nama', '!=', '')
                    ->whereNotNull('nama')
                    ->where('nama', 'not like', '%admin%');
            })
            ->when(
                empty($department) || (int) $department !== 23,
                fn($data) => $data->where('id_department', '!=', 23)
            )
            ->when(!$canSeeAll, fn($data) => $data->where('id_department', Auth::user()->id_department))
            ->when(!empty($department) && $canSeeAll, fn($data) => $data->where('id_department', $department))
            ->when(!empty($jabatan), fn($data) => $data->where('id_penugasan', $jabatan))
            ->when(!empty($shift), fn($data) => $data->where('id_shift', $shift))
            ->when(!empty($korlap), fn($data) => $data->where('id_korlap', $korlap))
            ->when($search, function ($data) use ($search) {
                $data->where(function ($d) use ($search) {
                    $d->where('nama', 'like', "%{$search}%")
                        ->orWhere('badgenumber', 'like', "%{$search}%");
                });
            })
            ->orderBy('nama', 'asc')
            ->get();

        // Build lookup absensi + hitung jumlah hari kerja
        foreach ($datas as $p) {
            $pid = (int) $p->id;

            // init default
            foreach ($this->dates as $d) {
                $k = $d->format('Y-m-d');
                $this->absensi[$pid][$k] = ['masuk' => '-', 'pulang' => '-'];
            }

            // isi dari kehadirans
            foreach ($p->kehadirans as $h) {
                $tgl = Carbon::parse($h->check_time)->format('Y-m-d');
                if (!isset($this->absensi[$pid][$tgl])) continue;

                $time = Carbon::parse($h->check_time)->format('H:i');

                // Sesuaikan check_type kamu:
                // biasanya "I" untuk masuk, "O" untuk pulang.
                $type = (int) $h->check_type; // 0 masuk, 1 pulang

                if ($type === 0) {
                    $curr = $this->absensi[$pid][$tgl]['masuk'];
                    if ($curr === '-' || $time < $curr) {
                        $this->absensi[$pid][$tgl]['masuk'] = $time;
                    }
                }

                if (
                    $type === 1
                ) {
                    $curr = $this->absensi[$pid][$tgl]['pulang'];
                    if ($curr === '-' || $time > $curr) {
                        $this->absensi[$pid][$tgl]['pulang'] = $time;
                    }
                }
            }

            // jumlah hari kerja: minimal salah satu tidak '-'
            $count = 0;
            foreach ($this->dates as $d) {
                $k = $d->format('Y-m-d');
                $m = $this->absensi[$pid][$k]['masuk'] ?? '-';
                $o = $this->absensi[$pid][$k]['pulang'] ?? '-';
                if ($m !== '-' || $o !== '-') $count++;
            }
            $this->jumlahHariKerja[$pid] = $count;
        }

        return $datas;
    }


    public function headings(): array
    {
        // row 1
        $h1 = ['#',  'Nama Lengkap', 'Unit Kerja', 'Penugasan', "Kategori\nKerja", "Jumlah\nHari\nKerja", "Jumlah\nMasuk\nKerja"];
        foreach ($this->dates as $d) {
            $h1[] = $d->translatedFormat('l, d M Y');
            $h1[] = '';
        }

        $h1[] = 'Keterangan';

        // row 2
        $h2 = ['',  '', '', '', '', '', ''];
        foreach ($this->dates as $d) {
            $h2[] = 'Masuk';
            $h2[] = 'Pulang';
        }

        $h2[] = '';

        return [$h1, $h2];
    }

    public function map($p): array
    {
        // dd($p);
        $this->no++;
        $pid = (int) $p->id;

        $unitKerja = $p->department->DeptName ?? '-';

        $penugasan = $p->jabatan->nama
            ?? $p->jabatan->PenugasanName
            ?? '-';

        $jadwal = (string) ($p->shift->jadwal ?? "");
        $kategoriKerja = $this->toKategoriKode($jadwal);
        // $jumlahHari = $this->from->copy()->startOfDay()
        //     ->diffInDays($this->to->copy()->endOfDay());
        $jumlahHari = count($this->dates);
        // $hariKerja = $this->jumlahHariKerja[$pid] ?? 0;
        // $hariKerja = $p->kehadirans
        //     ->groupBy(function ($item) {
        //         $tanggal = Carbon::parse($item->check_time)->toDateString();
        //         return $tanggal . "_" . $item->check_type;
        //     })
        //     ->count() / 2 ?: 0;

        $hariKerja = 0;

        $perTanggal = $p->kehadirans
            ->groupBy(function ($item) {
                return Carbon::parse($item->check_time)->toDateString();
            })
            ->reject(function ($records, $tanggal) use ($p) {
                return optional($p->jabatan)->is_holiday && in_array($tanggal, $this->tanggalSkip);
            });

        foreach ($perTanggal as $tanggal => $records) {

            $masuk  = $records->where('check_type', 0)->first();
            $pulang = $records->where('check_type', 1)->first();

            $statusMasuk  = $masuk?->status_kerja;
            $statusPulang = $pulang?->status_kerja;

            $isMangkirMasuk  = $statusMasuk === 'mangkir';
            $isMangkirPulang = $statusPulang === 'mangkir';

            $hasMasuk  = (bool) $masuk;
            $hasPulang = (bool) $pulang;

            if (!$hasMasuk && !$hasPulang) {
                continue;
            }

            if (
                ($hasMasuk && !$hasPulang && $isMangkirMasuk) ||
                (!$hasMasuk && $hasPulang && $isMangkirPulang)
            ) {
                continue;
            }

            if ($isMangkirMasuk && $isMangkirPulang) {
                continue;
            }

            if ($isMangkirMasuk || $isMangkirPulang) {
                $hariKerja += 0.5;
                continue;
            }

            if ($hasMasuk && $hasPulang) {
                $hariKerja += 1;
            } elseif ($hasMasuk || $hasPulang) {
                $hariKerja += 0.5;
            }
        }

        $jumlahHariPegawai = $jumlahHari;
        if (optional($p->jabatan)->is_holiday) {
            $jumlahHariPegawai -= count($this->tanggalSkip);
        }

        $hasil = $this->hitungPotongan($p, $jumlahHariPegawai, $this->tanggalSkip);

        $totalMaksimal = ($hasil['gaji'] * $jumlahHariPegawai);

        $persentase = $totalMaksimal > 0
            ? round(($hasil['upah_bersih'] / $totalMaksimal) * 100, 2)
            : 0;

        $row = [
            $this->no,
            // (string) ("'" . $p->badgenumber ?? '-'),
            (string) ($p->nama ?? '-'),
            (string) $unitKerja,
            (string) $penugasan,
            (string) $kategoriKerja,
            $jumlahHari,
            $hasil['jumlah_masuk'] > 0 ? $hasil['jumlah_masuk'] : "-",
            // $hariKerja > 0 ? $hariKerja : "-"
            // (int) ($this->jumlahHariKerja[$pid] ?? 0),
        ];

        // foreach ($this->dates as $d) {
        //     $k = $d->format('Y-m-d');
        //     $row[] = $this->absensi[$pid][$k]['masuk'] ?? '-';
        //     $row[] = $this->absensi[$pid][$k]['pulang'] ?? '-';
        // }

        foreach ($this->dates as $d) {
            $k = $d->format('Y-m-d');

            if (optional($p->jabatan)->is_holiday && in_array($k, $this->tanggalSkip)) {
                $row[] = '-';
                $row[] = '-';
                continue;
            }

            $records = $p->kehadirans->filter(function ($item) use ($k) {
                // $tanggal = Carbon::parse($item->check_time)->toDateString();
                // return !in_array($tanggal, $this->tanggalSkip);
                return Carbon::parse($item->check_time)->toDateString() === $k;
            });

            $statusMasuk  = $records->where('check_type', 0)->first()?->status_kerja;
            $statusPulang = $records->where('check_type', 1)->first()?->status_kerja;

            $masuk  = $this->absensi[$pid][$k]['masuk'] ?? '-';
            $pulang = $this->absensi[$pid][$k]['pulang'] ?? '-';

            if ($statusMasuk === 'mangkir') {
                $masuk = 'Mangkir';
            }

            if ($statusPulang === 'mangkir') {
                $pulang = 'Mangkir';
            }

            $row[] = $masuk;
            $row[] = $pulang;
        }

        $row[] = ($persentase . "%");

        return $row;
    }

    public function registerEvents(): array
    {
        $password = EncryptFile::where('type', 'excel')
            ->where('is_active', true)
            ->whereNotNull('password')
            ->value('password');
        return [
            BeforeExport::class => function (BeforeExport $event) use ($password) {
                $writer = $event->writer;
                $spreadsheet = $writer->getDelegate();

                $security = $spreadsheet->getSecurity();
                $security->setLockWindows(true);
                $security->setLockStructure(true);
                $security->setWorkbookPassword($password);
            },
            AfterSheet::class => function (AfterSheet $event) use ($password) {
                $protected = $event->sheet;
                $protection = $protected->getProtection();
                $protection->setSheet(true);
                $protection->setPassword($password);

                $protection->setFormatColumns(false);
                $protection->setFormatRows(false);
                // $protection->setFormatCells(false); 

                // $protection->setFormatColumns(true);

                $sheet = $event->sheet->getDelegate();

                $sheet->getParent()->getDefaultStyle()
                    ->getFont()
                    ->setName('Arial')
                    ->setSize(10);

                // Pastikan semua cell ikut Arial 10

                // $sheet->getStyle('C:C')->getProtection()->setLocked(false);

                // =========================
                // HITUNG LAST COL TABEL
                // =========================
                $fixedCols = 7; // A..G
                $parafCols = 1;
                $lastCol = $this->colLetter($fixedCols + (count($this->dates) * 2) + $parafCols);

                $sheet->getStyle("A1:{$lastCol}{$sheet->getHighestRow()}")
                    ->getFont()
                    ->setName('Arial')
                    ->setSize(10);

                // =========================
                // KOP SURAT + INFO (seperti gambar)
                // =========================
                // Kamu bisa ubah teksnya sesuai kebutuhan.
                // Area atas: 1..5
                $sheet->mergeCells("A1:D1");
                $sheet->mergeCells("A2:D2");
                $sheet->mergeCells("A3:D3");
                $sheet->mergeCells("A4:D5");
                // $sheet->mergeCells("A4:D4");
                // $sheet->mergeCells("A5:D5");

                $sheet->setCellValue("A4", "PEMERINTAH KOTA PALEMBANG\nDINAS LINGKUNGAN HIDUP");

                $sheet->getStyle('A4:E5')->getFont()
                    ->setBold(true)
                    ->setSize(12);

                $sheet->mergeCells("F2:O2");
                $sheet->mergeCells("F3:O3");
                $sheet->mergeCells("F4:O4");
                $sheet->mergeCells("F5:O5");

                $sheet->getStyle("A4:E5")->getAlignment()
                    ->setWrapText(true)
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);
                $sheet->getStyle("H4:{$lastCol}4")->getAlignment()
                    ->setVertical(Alignment::VERTICAL_TOP);

                $periode = $this->from->translatedFormat('d F Y') . " s.d " . $this->to->translatedFormat('d F Y');

                $jabatanId    = $this->request->input('jabatan');

                $jabatanName = '-';
                if (!empty($jabatanId)) {
                    $jabatanName = Jabatan::whereKey($jabatanId)->value('nama') ?? "-";
                }

                $departmentId = $this->request->input('department') ?? Auth::user()->id_department;

                $DeptName = "-";
                $kuptd = null;
                $kasubbag = null;
                $operator = null;
                if (!empty($departmentId)) {
                    $DeptName = Departments::whereKey($departmentId)->value('DeptName') ?? "-";
                    $DeptName = $this->normalizeDeptName($DeptName);
                    $kuptd = PegawaiAsn::where('id_department', $departmentId)->where('role', "KUPTD")->first();
                    $kasubbag = PegawaiAsn::where('id_department', $departmentId)->where('role', "KASUBBAG")->first();
                    $operator = User::where('id_department', $departmentId)->where('role', 'operator')->first();
                }

                $lokasi = Auth::user()->role === 'operator'
                    ? Departments::where('DeptID', Auth::user()->id_department)->first()
                    : Departments::where('DeptID', $this->request->input('department'))->first();

                $sekretariatdlh = $this->request->input('department') === '2' || Auth::user()->username === 'dlhsekretariat';

                // $sheet->setCellValue("O2", "PERIHAL      : DAFTAR HADIR PEKERJA HARIAN LEPAS (PHL) {$jabatanName}");
                $sheet->setCellValue("F2", "PERIHAL      : " . ($sekretariatdlh ? "DAFTAR TENAGA PENYEDIA JASA LAINNYA PERSEORANGAN (PJLP)" : "DAFTAR TENAGA PENYEDIA JASA LAINNYA PERSEORANGAN (PJLP)"));
                $sheet->setCellValue("F3", "UNIT KERJA   : " . ($sekretariatdlh ? "SEKRETARIAT" : "UPTD LINGKUNGAN HIDUP KECAMATAN {$DeptName}"));
                $sheet->setCellValue("F4", "LOKASI KERJA : " . ($sekretariatdlh ? "DINAS LINGKUNGAN HIDUP KOTA PALEMBANG" : ("WILAYAH KECAMATAN " . $lokasi?->DeptName)));
                $sheet->setCellValue("F5", "PERIODE      : {$periode}");

                // Style kop
                // $sheet->getStyle("A1:{$lastCol}4")->getFont()->setBold(true)->setSize(11);
                // $sheet->getStyle("A1:A3")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                // $sheet->getStyle("A1:A3")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                // $sheet->getStyle("F1:{$lastCol}4")->getAlignment()->setWrapText(true);
                // $sheet->getStyle("F1:{$lastCol}4")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                // $sheet->getStyle("F1:{$lastCol}4")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                $sheet->getStyle("H1:{$lastCol}3")->getAlignment()
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // F4 khusus TOP
                $sheet->getStyle("H4:{$lastCol}4")->getAlignment()
                    ->setVertical(Alignment::VERTICAL_TOP);

                $sheet->getRowDimension(1)->setRowHeight(18);
                $sheet->getRowDimension(2)->setRowHeight(18);
                $sheet->getRowDimension(3)->setRowHeight(18);
                $sheet->getRowDimension(4)->setRowHeight(18);
                // $sheet->getRowDimension(5)->setRowHeight(18);

                // posisi head table
                $headerRow1 = $this->startRow;      // headings row 1
                $headerRow2 = $this->startRow + 1;  // headings row 2
                $dataRowStart = $this->startRow + 2;

                // Freeze header (2 baris)
                $sheet->freezePane("A{$dataRowStart}");

                $firstDateIndex = 8; // G
                $lastColIndex   = Coordinate::columnIndexFromString($lastCol);
                $lastDateIndex  = $lastColIndex - 1; // sebelum kolom Paraf



                for ($i = $firstDateIndex; $i <= $lastDateIndex; $i++) {
                    $col = Coordinate::stringFromColumnIndex($i);

                    // karena header kamu panjang dan merge, ini lebih stabil dari AutoSize
                    $sheet->getColumnDimension($col)->setAutoSize(false);
                    $sheet->getColumnDimension($col)->setWidth(7.7); // coba 11-14 sesuai selera
                }

                // pastikan header wrap biar turun baris kalau masih sempit
                $sheet->getStyle("H{$headerRow1}:{$sheet->getCellByColumnAndRow($lastDateIndex,$headerRow2)->getColumn()}{$headerRow2}")
                    ->getAlignment()
                    ->setWrapText(true);


                // Merge kolom tetap A..G (row1-row2)
                foreach (['A', 'B', 'C', 'D', 'E', 'F', 'G'] as $c) {
                    $sheet->mergeCells("{$c}{$headerRow1}:{$c}{$headerRow2}");
                }

                // Merge tiap tanggal (2 kolom per hari) pada header row1
                $startColIndex = $fixedCols + 1; // setelah G => H (8)
                $col = $startColIndex;

                foreach ($this->dates as $d) {
                    $from = $this->colLetter($col) . $headerRow1;
                    $to   = $this->colLetter($col + 1) . $headerRow1;
                    $sheet->mergeCells("{$from}:{$to}");
                    $col += 2;
                }

                // Merge kolom paraf terakhir
                $sheet->mergeCells("{$lastCol}{$headerRow1}:{$lastCol}{$headerRow2}");
                $sheet->getColumnDimension($lastCol)->setAutoSize(false);
                $sheet->getColumnDimension($lastCol)->setWidth(10.7);

                // foreach (['A', 'B', 'C'] as $col) {
                //     $sheet->getColumnDimension($col)->setAutoSize(false);
                // }

                // Lebar sesuai kebutuhan (silakan adjust)
                $sheet->getColumnDimension('A')->setAutoSize(false)->setWidth(4);    // # / nomor
                $sheet->getColumnDimension('B')->setAutoSize(false)->setWidth(20);   // Nama
                $sheet->getColumnDimension('C')->setAutoSize(false)->setWidth(23);
                $sheet->getColumnDimension('D')->setAutoSize(false)->setWidth(24);



                // Lebar beberapa kolom

                $sheet->getColumnDimension('E')->setAutoSize(false);
                $sheet->getColumnDimension('E')->setWidth(8);

                $sheet->getColumnDimension('F')->setAutoSize(false);
                $sheet->getColumnDimension('F')->setWidth(8);

                $sheet->getColumnDimension('G')->setAutoSize(false);
                $sheet->getColumnDimension('G')->setWidth(8);

                // Style header tabel
                $headerRange = "A{$headerRow1}:{$lastCol}{$headerRow2}";
                $sheet->getStyle($headerRange)->getFont()->setBold(true)->setSize(10);
                $firstDateCol = Coordinate::stringFromColumnIndex($firstDateIndex); // H
                $lastDateCol  = Coordinate::stringFromColumnIndex($lastDateIndex);

                // Row header tanggal (row 1 header)
                $sheet->getStyle("{$firstDateCol}{$headerRow1}:{$lastDateCol}{$headerRow1}")
                    ->getFont()
                    ->setSize(9);
                $sheet->getStyle($headerRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle($headerRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                $sheet->getStyle($headerRange)->getAlignment()->setWrapText(true);

                $sheet->getRowDimension($headerRow1)->setRowHeight(22);
                $sheet->getRowDimension($headerRow2)->setRowHeight(20);

                // =========================
                // STYLE DATA AREA
                // =========================
                $lastRow = $sheet->getHighestRow();

                // baris setelah data terakhir + 1
                $totalRow = $lastRow + 1;

                // Merge dari A sampai G untuk label "TOTAL PEGAWAI"
                $sheet->mergeCells("A{$totalRow}:B{$totalRow}");
                $sheet->setCellValue("A{$totalRow}", "TOTAL PEGAWAI");

                // Isi jumlah pegawai di kolom H (kolom pertama tanggal) atau di G.
                // Pilih yang rapi: taruh di H biar sejajar area tanggal
                // $sheet->setCellValue("C{$totalRow}", $this->no); // atau: count($this->collection())
                if (Auth::user()->role === 'operator') {
                    $sheet->setCellValue("D{$totalRow}", $this->no);
                } else {
                    $sheet->setCellValue("C{$totalRow}", $this->no);
                }

                // $sheet->getStyle("C{$dataRowStart}:C{$lastRow}")
                //     ->getAlignment()
                //     ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                //     ->setVertical(Alignment::VERTICAL_CENTER);

                if (Auth::user()->role !== 'operator') {
                    $sheet->getStyle("C{$dataRowStart}:C{$lastRow}")
                        ->getAlignment()
                        ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                        ->setVertical(Alignment::VERTICAL_CENTER);
                }

                // Hide kolom C jika operator
                if (Auth::user()->role === 'operator') {
                    $sheet->getColumnDimension('C')->setVisible(false);
                }

                // Styling
                $sheet->getStyle("A{$totalRow}:{$lastCol}{$totalRow}")->getFont()->setBold(true);
                $sheet->getStyle("A{$totalRow}:{$lastCol}{$totalRow}")
                    ->getAlignment()
                    ->setVertical(Alignment::VERTICAL_CENTER);

                $sheet->getStyle("A{$totalRow}:G{$totalRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                $sheet->getStyle("H{$totalRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // Border baris total (biar nyambung tabel)
                $sheet->getStyle("A{$totalRow}:{$lastCol}{$totalRow}")
                    ->getBorders()
                    ->getAllBorders()
                    ->setBorderStyle(Border::BORDER_THIN);


                // Ukuran font data
                $sheet->getStyle("A{$dataRowStart}:{$lastCol}{$lastRow}")->getFont()->setSize(9);

                // Center kolom No & Jumlah Hari Kerja
                $sheet->getStyle("A{$dataRowStart}:A{$lastRow}")
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $sheet->getStyle("{$lastCol}{$dataRowStart}:{$lastCol}{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                $sheet->getStyle("E{$dataRowStart}:G{$lastRow}")
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // Border seluruh tabel
                $tableRange = "A{$headerRow1}:{$lastCol}{$lastRow}";
                $sheet->getStyle($tableRange)
                    ->getBorders()
                    ->getAllBorders()
                    ->setBorderStyle(Border::BORDER_THIN);

                $firstDateCol = Coordinate::stringFromColumnIndex($firstDateIndex); // H
                $lastDateCol  = Coordinate::stringFromColumnIndex($lastDateIndex);

                $sheet->getStyle("{$firstDateCol}{$dataRowStart}:{$lastDateCol}{$lastRow}")
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                for ($row = $dataRowStart; $row <= $lastRow; $row++) {
                    for ($col = $firstDateIndex; $col <= $lastDateIndex; $col++) {

                        $colLetter = Coordinate::stringFromColumnIndex($col);
                        $cell = $sheet->getCell("{$colLetter}{$row}");
                        $value = $cell->getValue();

                        if (strtolower($value) === 'mangkir') {
                            $sheet->getStyle("{$colLetter}{$row}")
                                ->getFont()
                                ->getColor()
                                ->setARGB('FFFF0000'); // merah
                        }
                    }
                }

                // =========================
                // BLOK TANDA TANGAN 3 KOLOM (di bawah tabel)
                // =========================
                // $start = $lastRow + 3;

                // $totalCols = Coordinate::columnIndexFromString($lastCol);

                // $leftStart  = 1;
                // $leftEnd    = (int) floor($totalCols / 3);

                // $midStart   = $leftEnd + 1;
                // $midEnd     = (int) floor(($totalCols * 2) / 3);

                // $rightStart = $midEnd + 1;
                // $rightEnd   = $totalCols;

                // $mergeRow = function (int $colStart, int $colEnd, int $row) use ($sheet) {
                //     $a = Coordinate::stringFromColumnIndex($colStart) . $row;
                //     $b = Coordinate::stringFromColumnIndex($colEnd) . $row;
                //     $sheet->mergeCells("{$a}:{$b}");
                //     return "{$a}:{$b}";
                // };

                // $r1 = $start;
                // $mergeRow($leftStart,  $leftEnd,  $r1);
                // $mergeRow($midStart,   $midEnd,   $r1);
                // $mergeRow($rightStart, $rightEnd, $r1);

                // $sheet->setCellValue(
                //     Coordinate::stringFromColumnIndex($leftStart) . $r1,
                //     "KEPALA UPTD LINGKUNGAN HIDUP\nKECAMATAN KALIDONI"
                // );

                // $sheet->setCellValue(
                //     Coordinate::stringFromColumnIndex($midStart) . $r1,
                //     "KASUBBAG TU UPTD LINGKUNGAN HIDUP\nKECAMATAN KALIDONI"
                // );

                // $tglTtd = Carbon::today('Asia/Jakarta')->translatedFormat('d F Y');

                // $sheet->setCellValue(
                //     Coordinate::stringFromColumnIndex($rightStart) . $r1,
                //     "PALEMBANG, {$tglTtd}\n\nOPERATOR LAYANAN OPERASIONAL"
                // );

                // // Spasi untuk tanda tangan
                // $spaceRows = 4;
                // for ($i = 1; $i <= $spaceRows; $i++) {
                //     $mergeRow($leftStart,  $leftEnd,  $r1 + $i);
                //     $mergeRow($midStart,   $midEnd,   $r1 + $i);
                //     $mergeRow($rightStart, $rightEnd, $r1 + $i);
                // }

                // // Nama
                // $nameRow = $r1 + $spaceRows + 1;
                // $mergeRow($leftStart,  $leftEnd,  $nameRow);
                // $mergeRow($midStart,   $midEnd,   $nameRow);
                // $mergeRow($rightStart, $rightEnd, $nameRow);

                // // TODO: isi nama (bisa dari config / tabel ttd)
                // $sheet->setCellValue(Coordinate::stringFromColumnIndex($leftStart) . $nameRow,  "RENDI KURNIAWAN SAPUTRA, S.Kom., M.Si");
                // $sheet->setCellValue(Coordinate::stringFromColumnIndex($midStart) . $nameRow,   "YOSSI PRIMA OKTAVIA, S.IP");
                // $sheet->setCellValue(Coordinate::stringFromColumnIndex($rightStart) . $nameRow, "AIDL ROZAK");

                // // NIP
                // $nipRow = $nameRow + 1;
                // $mergeRow($leftStart,  $leftEnd,  $nipRow);
                // $mergeRow($midStart,   $midEnd,   $nipRow);
                // $mergeRow($rightStart, $rightEnd, $nipRow);

                // $sheet->setCellValue(Coordinate::stringFromColumnIndex($leftStart) . $nipRow,  "NIP. 1989092016011001");
                // $sheet->setCellValue(Coordinate::stringFromColumnIndex($midStart) . $nipRow,   "NIP. 198110092007012013");
                // $sheet->setCellValue(Coordinate::stringFromColumnIndex($rightStart) . $nipRow, "");

                // $signRange = "A{$r1}:{$lastCol}{$nipRow}";
                // $sheet->getStyle($signRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                // $sheet->getStyle($signRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                // $sheet->getStyle($signRange)->getAlignment()->setWrapText(true);

                // // Tinggi baris ttd biar enak
                // $sheet->getRowDimension($r1)->setRowHeight(35);
                // for ($i = 1; $i <= $spaceRows; $i++) {
                //     $sheet->getRowDimension($r1 + $i)->setRowHeight(22);
                // }
                // $sheet->getRowDimension($nameRow)->setRowHeight(18);
                // $sheet->getRowDimension($nipRow)->setRowHeight(18);
                $start = $lastRow + 3;

                // Helper merge by letter range
                $mergeByLetters = function (string $fromCol, string $toCol, int $row) use ($sheet) {
                    $a = "{$fromCol}{$row}";
                    $b = "{$toCol}{$row}";
                    $sheet->mergeCells("{$a}:{$b}");
                    return "{$a}:{$b}";
                };

                $sekretariat = Auth::user()->username === 'dlhsekretariat';

                // Range kolom per bagian (sesuaikan permintaanmu)
                if ($sekretariat) {
                    $leftFrom = 'A';
                    $leftTo = 'H';

                    // $rightFrom = 'I';
                    // $rightTo = 'P';
                    $midFrom = 'I';
                    $midTo = 'P';

                    // $midFrom = null;
                    // $midTo = null;
                } else {
                    $leftFrom   = 'C';
                    $leftTo     = 'G';      // Kepala UPTD

                    $midFrom    = 'M';
                    $midTo      = 'R';      // Kasubbag TU

                    // $rightFrom  = 'P';
                    // $rightTo    = 'V';      // Operator
                }

                // $korlapFrom = 'S';
                // $korlapTo   = 'V'; // Korlap sampai kolom terakhir tabel

                $rowDate  = $start;       // baris atas: khusus "PALEMBANG, tgl"
                $rowTitle = $start + 1;   // baris bawah: judul jabatan

                // Merge untuk baris tanggal (rowDate)
                $mergeByLetters($leftFrom,   $leftTo,   $rowDate);
                if ($midFrom && $midTo) {
                    $mergeByLetters($midFrom,    $midTo,    $rowDate);
                }
                // $mergeByLetters($rightFrom,  $rightTo,  $rowDate);
                // $mergeByLetters($korlapFrom, $korlapTo, $rowDate);

                // Isi hanya bagian operator pada baris tanggal
                $tglTtd = Carbon::today('Asia/Jakarta')->translatedFormat('d F Y');
                $sheet->setCellValue("{$midFrom}{$rowDate}", "PALEMBANG, " . ($this->request->input('tanggal_spj') ? strtoupper(Carbon::parse($this->request->input('tanggal_spj'))->translatedFormat('d F Y')) : strtoupper($tglTtd)));

                // Merge untuk baris jabatan (rowTitle)
                $mergeByLetters($leftFrom,   $leftTo,   $rowTitle);
                if ($midFrom && $midTo) {
                    $mergeByLetters($midFrom,    $midTo,    $rowTitle);
                }
                // $mergeByLetters($rightFrom,  $rightTo,  $rowTitle);
                // $mergeByLetters($korlapFrom, $korlapTo, $rowTitle);

                // Isi judul jabatan (seperti screenshot)
                if ($sekretariatdlh) {
                    $sheet->setCellValue("{$leftFrom}{$rowTitle}",  "KASUBBAG UMUM DAN KEPEGAWAIAN");
                    $sheet->setCellValue("{$midFrom}{$rowTitle}",   "OPERATOR LAYANAN OPERASIONAL");
                } else {
                    $sheet->setCellValue("{$leftFrom}{$rowTitle}",  "KEPALA UPTD LINGKUNGAN HIDUP\nKECAMATAN {$DeptName}");
                    $sheet->setCellValue("{$midFrom}{$rowTitle}",   "KASUBBAG TU UPTD LINGKUNGAN HIDUP\nKECAMATAN {$DeptName}");
                }
                // $sheet->setCellValue("{$rightFrom}{$rowTitle}", "OPERATOR LAYANAN OPERASIONAL");
                // $sheet->setCellValue("{$korlapFrom}{$rowTitle}", "KOORDINATOR LAPANGAN UPTD LINGKUNGAN HIDUP");

                // =====================================
                // SPASI TTD (mulai setelah rowTitle)
                // =====================================
                $spaceRows = 4;
                for ($i = 1; $i <= $spaceRows; $i++) {
                    $r = $rowTitle + $i;
                    $mergeByLetters($leftFrom,   $leftTo,   $r);
                    if ($midFrom && $midTo) {
                        $mergeByLetters($midFrom,    $midTo,    $r);
                    }
                    // $mergeByLetters($rightFrom,  $rightTo,  $r);
                    // $mergeByLetters($korlapFrom, $korlapTo, $r);
                }

                $korlapId = $this->request->input('korlap');
                $korlap = null;
                $korlapNip = null;
                if (!empty($korlapId)) {
                    $korlap = PegawaiAsn::whereKey($korlapId)->value('nama');
                    $korlapNip = PegawaiAsn::whereKey($korlapId)->value('nip');
                }

                // =====================================
                // NAMA
                // =====================================
                $nameRow = $rowTitle + $spaceRows;

                $mergeByLetters($leftFrom,   $leftTo,   $nameRow);
                if ($midFrom && $midTo) {
                    $mergeByLetters($midFrom,    $midTo,    $nameRow);
                }
                // $mergeByLetters($rightFrom,  $rightTo,  $nameRow);
                // $mergeByLetters($korlapFrom, $korlapTo, $nameRow);
                $sekretariatdlh = $this->request->input('department') === '2' ?? Auth::user()->username === 'dlhsekretariat';

                if ($midFrom && $midTo) {
                    $sheet->setCellValue(
                        "{$leftFrom}{$nameRow}",
                        $sekretariatdlh ? (strtoupper(PegawaiAsn::where('id_department', '2')->where('role', 'SEKRETARIAT')->first()?->nama) ?? "-") : $kuptd?->nama
                    );
                    $sheet->setCellValue(
                        "{$midFrom}{$nameRow}",
                        $sekretariatdlh ? (strtoupper(PegawaiAsn::where('id_department', '2')->where('role', 'KASUBBAG')->first()?->nama) ?? "-") : $kasubbag?->nama
                    );
                } else {
                    $sheet->setCellValue(
                        "{$leftFrom}{$nameRow}",
                        PegawaiAsn::where('id_department', '2')->where('role', 'SEKRETARIAT')->first()->nama ?? "-"
                    );
                }
                // $sheet->setCellValue("{$rightFrom}{$nameRow}", $operator?->nama ?? "-");
                // $sheet->setCellValue("{$korlapFrom}{$nameRow}", $korlap ?? "-");

                // =====================================
                // NIP
                // =====================================
                $nipRow = $nameRow + 1;

                $mergeByLetters($leftFrom,   $leftTo,   $nipRow);
                if ($midFrom && $midTo) {
                    $mergeByLetters($midFrom,    $midTo,    $nipRow);
                }
                // $mergeByLetters($rightFrom,  $rightTo,  $nipRow);
                // $mergeByLetters($korlapFrom, $korlapTo, $nipRow);

                if ($midFrom && $midTo) {
                    $sheet->setCellValue("{$leftFrom}{$nipRow}",  $sekretariatdlh ? ("NIP. " . PegawaiAsn::where('id_department', '2')->where('role', 'SEKRETARIAT')->first()?->nip ?? "-") : "NIP. " . ($kuptd?->nip ?? "-"));
                    $sheet->setCellValue("{$midFrom}{$nipRow}",  $sekretariatdlh ? (PegawaiAsn::where('id_department', '2')->where('role', 'KASUBBAG')->first()?->nip === "-"
                        ? PegawaiAsn::where('id_department', '2')->where('role', 'KASUBBAG')->first()?->nip  : "-") : "NIP. " . ($kasubbag?->nip));
                } else {
                    $sheet->setCellValue("{$leftFrom}{$nipRow}",  "NIP. " . (PegawaiAsn::where('id_department', '2')->where('role', 'SEKRETARIAT')->first()->nip ?? "-"));
                }
                // $sheet->setCellValue("{$rightFrom}{$nipRow}", ""); // isi kalau ada
                // $sheet->setCellValue("{$korlapFrom}{$nipRow}", "NIP. " . ($korlapNip ?? "-")); // opsional

                // =====================================
                // STYLE
                // =====================================
                $signRange = "A{$rowDate}:{$lastCol}{$nipRow}";
                $sheet->getStyle($signRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle($signRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                $sheet->getStyle($signRange)->getAlignment()->setWrapText(true);

                // Tinggi baris biar mirip screenshot
                $sheet->getRowDimension($rowDate)->setRowHeight(18);
                $sheet->getRowDimension($rowTitle)->setRowHeight(35);

                for ($i = 1; $i <= $spaceRows; $i++) {
                    $sheet->getRowDimension($rowTitle + $i)->setRowHeight(22);
                }
                $sheet->getRowDimension($nameRow)->setRowHeight(18);
                $sheet->getRowDimension($nipRow)->setRowHeight(18);
            },
        ];
    }

    private function colLetter(int $colNumber): string
    {
        $letter = '';
        while ($colNumber > 0) {
            $temp = ($colNumber - 1) % 26;
            $letter = chr($temp + 65) . $letter;
            $colNumber = (int)(($colNumber - $temp - 1) / 26);
        }
        return $letter;
    }

    private function normalizeDeptName(?string $deptName): string
    {
        $deptName = trim((string) $deptName);
        if ($deptName === '') return '-';

        // rapikan spasi ganda
        $deptName = preg_replace('/\s+/', ' ', $deptName);

        $upper = strtoupper($deptName);

        // CASE KHUSUS (pakai tanpa UPTD sesuai permintaan)
        if ($upper === 'UPTD SU1') return 'SEBERANG ULU 1';
        if ($upper === 'UPTD SU2') return 'SEBERANG ULU 2';
        if ($upper === 'UPTD ALANG2 LEBAR') return 'ALANG-ALANG LEBAR';

        // DEFAULT: kalau diawali "UPTD " => hapus kata UPTD
        // contoh: "UPTD KALIDONI" => "KALIDONI"
        $withoutUptd = preg_replace('/^UPTD\s+/i', '', $deptName);

        return trim($withoutUptd) !== '' ? trim($withoutUptd) : '-';
    }

    private function hitungPotongan($data, $jumlah_hari, $tanggalSkip)
    {
        $kehadiran = $data->kehadirans;
        $gaji = optional($data->jabatan)->gaji ?? 0;

        $toMenit = function ($jam) {
            if (!$jam) return null;
            [$h, $m] = explode(':', substr($jam, 0, 5));
            return ((int) $h * 60) + (int) $m;
        };

        $formatJam = function ($jam) {
            return $jam ? substr($jam, 11, 5) : null;
        };

        $decodeRules = function ($rules) {
            if (is_array($rules)) return $rules;
            return json_decode($rules ?? '[]', true) ?? [];
        };

        $telatRules = collect($decodeRules($data->shift->telat ?? []))
            ->map(fn($r) => $toMenit($r))
            ->sort()->values()->toArray();

        $pulcetRules = collect($decodeRules($data->shift->pulang_cepat ?? []))
            ->map(fn($r) => $toMenit($r))
            ->sort()->values()->toArray();

        $menitShiftPulang = $toMenit($data->shift->jam_keluar ?? null);

        $perTanggal = $kehadiran
            ->groupBy(function ($item) {
                return Carbon::parse($item->check_time)->toDateString();
            })
            ->reject(function ($records, $tanggal) use ($data, $tanggalSkip) {
                return optional($data->jabatan)->is_holiday && in_array($tanggal, $tanggalSkip);
            });

        $totalPotonganNominal = 0;
        $jumlahMasuk = 0;
        $jumlahTelat = 0;
        $jumlahPulcet = 0;

        foreach ($perTanggal as  $records) {
            $statusMasuk  = $records->where('check_type', 0)->first()?->status_kerja;
            $statusPulang = $records->where('check_type', 1)->first()?->status_kerja;

            $jamMasukRaw  = $records->where('check_type', 0)->min('check_time');
            $jamPulangRaw = $records->where('check_type', 1)->max('check_time');

            $menitMasuk  = $toMenit($formatJam($jamMasukRaw));
            $menitPulang = $toMenit($formatJam($jamPulangRaw));

            $tidakHadir = !$jamMasukRaw && !$jamPulangRaw;

            $potonganTelat = 0;
            $bobotTelat    = 0;
            // if ($menitMasuk !== null && !empty($telatRules)) {
            //     $total = count($telatRules);
            //     foreach ($telatRules as $index => $batas) {
            //         if ($menitMasuk > $batas) {
            //             $potonganTelat = (int) round((($index + 1) / $total) * 50);
            //         }
            //     }
            // }

            if ($menitMasuk !== null && !empty($telatRules) && $statusMasuk !== 'mangkir') {
                // $rulesAsc = collect($telatRules)->sort()->values()->toArray();
                $total = count($telatRules);

                foreach ($telatRules as $i => $batas) {
                    if ($menitMasuk > $batas) {
                        $bobotTelat = ($i + 0.5) / $total;
                        $potonganTelat = (int) round((($i + 1) / $total) * 50);
                    }
                }
            }

            $jumlahTelat += $bobotTelat;

            $potonganPulcet = 0;
            $bobotPulcet = 0;
            // if ($menitPulang !== null && $menitShiftPulang !== null && !empty($pulcetRules)) {
            //     if ($menitPulang < $menitShiftPulang) {
            //         $total = count($pulcetRules);
            //         foreach ($pulcetRules as $index => $batas) {
            //             if ($menitPulang < $batas) {
            //                 $potonganPulcet = (int) round((($total - $index) / $total) * 50);
            //                 break;
            //             }
            //         }
            //         if ($potonganPulcet === 0) {
            //             $potonganPulcet = (int) round((1 / $total) * 50);
            //         }
            //     }
            // }

            if ($menitPulang !== null && $menitShiftPulang !== null && !empty($pulcetRules) && $statusPulang !== 'mangkir') {
                if ($menitPulang < $menitShiftPulang) {
                    $total = count($pulcetRules);

                    foreach ($pulcetRules as $i => $batas) {
                        if ($menitPulang < $batas) {
                            $bobotPulcet = ($i + 0.5) / $total;
                            $potonganPulcet = (int) round((($total - $i) / $total) * 50);
                            break;
                        }
                    }

                    // fallback (kena sedikit banget)
                    if ($bobotPulcet === 0) {
                        $bobotPulcet = 0.5 / $total;
                    }

                    if ($potonganPulcet === 0) {
                        $potonganPulcet = (int) round((1 / $total) * 50);
                    }
                }
            }

            $jumlahPulcet += $bobotPulcet;

            // if ($tidakHadir) {
            //     $persen = 100;
            // } elseif (!$jamMasukRaw || !$jamPulangRaw) {
            //     $persen = 50;
            // } else {
            //     $persen = max($potonganTelat, $potonganPulcet);
            // }

            $persen = 0;
            if ($tidakHadir) {
                $persen = 100;
            } else {
                if ($statusMasuk === 'mangkir') {
                    $persen += 50;
                }

                if ($statusPulang === 'mangkir') {
                    $persen += 50;
                }

                if (!$jamMasukRaw) {
                    $persen += 50;
                }

                if (!$jamPulangRaw) {
                    $persen += 50;
                }

                $persen += $potonganTelat;
                $persen += $potonganPulcet;

                $persen = min($persen, 100);
            }


            $totalPotonganNominal += ($persen / 100) * $gaji;

            if (!$jamMasukRaw && !$jamPulangRaw) {
                continue;
            }

            if (
                ($jamMasukRaw && !$jamPulangRaw && $statusMasuk === 'mangkir') ||
                (!$jamMasukRaw && $jamPulangRaw && $statusPulang === 'mangkir')
            ) {
                continue;
            }

            if ($statusMasuk === 'mangkir' && $statusPulang === 'mangkir') {
                continue;
            }

            if ($statusMasuk === 'mangkir' || $statusPulang === 'mangkir') {
                $jumlahMasuk += 0.5;
                continue;
            }

            if ($jamMasukRaw && $jamPulangRaw) {
                $jumlahMasuk++;
            } else if ($jamMasukRaw || $jamPulangRaw) {
                $jumlahMasuk += 0.5;
            }
        }

        $totalHariAktif = $jumlah_hari;

        if (optional($data->jabatan)->is_holiday) {
            $totalHariAktif -= count($tanggalSkip);
        }

        $hariTanpaRecord = $totalHariAktif - $perTanggal->count();

        // $hariTanpaRecord = $jumlah_hari - $perTanggal->count();
        $totalPotonganNominal += $hariTanpaRecord * $gaji;

        $upahBersih = max(0, ($gaji * $totalHariAktif) - $totalPotonganNominal);

        return [
            'gaji'              => $gaji,
            'jumlah_masuk'      => $jumlahMasuk,
            'potongan'          => round($totalPotonganNominal, 0),
            'upah_bersih'       => round($upahBersih, 0),
        ];
    }
}
