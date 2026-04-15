<?php

namespace App\Exports\Gaji;

use App\Models\{Departments, EncryptFile, Jabatan, Pegawai, PegawaiAsn};
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\{FromCollection, ShouldAutoSize, WithCustomStartCell, WithDrawings, WithEvents, WithHeadings, WithMapping, WithStyles};
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Events\BeforeExport;
use PhpOffice\PhpSpreadsheet\Style\{Alignment, Border};
use PhpOffice\PhpSpreadsheet\Worksheet\{Drawing, Worksheet};

class SPJUpahKerjaExport implements FromCollection, WithHeadings, WithStyles, WithDrawings, WithCustomStartCell, ShouldAutoSize, WithEvents
{
    private int $startRow = 9;
    protected $request;
    public function __construct($request)
    {
        $this->request = $request;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $request = $this->request;

        $search = $request->input('search');
        $department = $request->input('department');
        $jabatan = $request->input('jabatan');
        $shift = $request->input('shift');
        $korlap = $request->input('korlap');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $jumlah_hari = 0;

        if ($fromDate && $toDate) {
            $jumlah_hari = Carbon::parse($fromDate)
                ->diffInDays(Carbon::parse($toDate)) + 1;
        }

        $datas = Pegawai::with([
            'kehadirans' => fn($q) => $q->whereBetween('check_time', [
                $fromDate . ' 00:00:00',
                $toDate   . ' 23:59:59',
            ]),
            'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
            'jabatan',
            'shift'
        ])
            ->select('id', 'old_id', 'id_department', 'id_penugasan', 'id_shift', 'no_rekening', 'badgenumber', 'nama')
            ->where(function ($data) {
                $data->where('nama', '!=', '')
                    ->whereNotNull('nama')
                    ->where('nama', 'not like', '%admin%')
                    ->where('nama', 'not like', '%adm')
                    ->where('id_department', '!=', 23);
            })
            ->when(Auth::user()->role === 'operator', function ($data) {
                $data->where('id_department', Auth::user()->id_department);
            })
            ->when($search, function ($data) use ($search) {
                $data->whereLike('badgenumber', "%{$search}%")
                    ->orWhereLike('nama', "%{$search}%");
            })
            ->when(empty($department) || (int) $department !== 23, function ($data) {
                $data->where('id_department', '!=', 23);
            })
            ->when(!empty($department), function ($data) use ($department) {
                $data->where('id_department', $department);
            })
            ->when(!empty($shift), function ($data) use ($shift) {
                $data->where('id_shift', $shift);
            })
            ->when(!empty($korlap), function ($data) use ($korlap) {
                $data->where('id_korlap', $korlap);
            })
            ->when(!empty($jabatan), function ($data) use ($jabatan) {
                $data->where('id_penugasan', $jabatan);
            })
            ->orderBy('nama')
            ->get();

        return $datas->map(function ($data, $index) use ($jumlah_hari) {
            $totalUpah = ($data->jabatan?->gaji ?? 0) * ($data->kehadirans->count() / 2);
            return [
                $index + 1,
                $data->no_rekening ? (string) "'{$data->no_rekening}" : "-",
                // "'" . $data->badgenumber,
                $data->nama,
                // $data->jabatan?->nama ?: "-",
                // $data->department?->DeptName ?: "-",
                // $jumlah_hari,
                $jumlah_hari ?: "-",
                $data->kehadirans->count() / 2 ?: "-",
                'Rp ' . number_format($data->jabatan?->gaji, 0, ',', '.') ?: 0,
                // $data->kehadirans->count() / 2 ?: "-",
                // 'Rp ' . number_format($data->jabatan?->gaji, 0, ',', '.') ?: 0,
                'Rp ' . number_format($totalUpah, 0, ',', '.'),
                'Rp ' . number_format(0, 0, ',', '.'),
                $totalUpah ?: "Rp 0",
            ];
        });
    }

    public function headings(): array
    {
        return [
            [
                '#',
                'Nomor Rekening',
                // 'NIK',
                'Nama Lengkap',
                "Jumlah\nHari\nKerja",
                "Jumlah\nMasuk\nKerja",
                'Pembayaran Upah',
                '',
                '',
                '',
                'Tanda Tangan',
                ''
            ],
            [
                '',
                '',
                // '',
                '',
                '',
                '',
                "Per-Hari\n(Rp)",
                "Sesuai Hari\nKerja (Rp)",
                "Tambahan (Rp)",
                "Yang Harus\nDibayar (Rp)",
                '',
                ''
            ]
        ];
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
        $drawing->setCoordinates('B2');

        $drawing->setOffsetX(110);
        // $drawing->setOffsetY(-5);

        return [$drawing];
    }

    public function styles(Worksheet $sheet)
    {
        $request = $this->request;

        $user = Auth::user();

        $formatDate = fn($date) => Carbon::parse($date)->format('d F Y');
        $jabatan = $request->input('jabatan') ? Jabatan::with(['kpaAsn', 'bpAsn', 'bppAsn', 'pptkAsn'])->findOrFail($request->input('jabatan')) : "-";
        if ($request->input('department') && in_array($user->role, ['superadmin', 'admin'])) {
            $kuptd = PegawaiAsn::where('id_department', $request->input('department'))
                ->where('role', 'KUPTD')->first() ?? "-";
        } else {
            $kuptd =
                PegawaiAsn::where('id_department', $user->id_department)
                ->where('role', 'KUPTD')->first() ?? "-";
        }
        // $kabid = PegawaiAsn::where('role', 'KABID')->first();


        // $kuptd = $request->input('department')
        //     ? PegawaiAsn::where('id_department', $request->input('department'))
        //     ->where('role', 'KUPTD')->first()->nama
        //     : PegawaiAsn::where('id_department', $user->id_department)
        //     ->where('role', 'KUPTD')->first()->nama;
        // if (!in_array($user->role, ['superadmin', 'admin'])) {

        // }

        $department = $request->input('department')
            ? Departments::findOrFail($request->department)->DeptName
            : $user->department?->DeptName;

        $dataRowStart = $this->startRow + 2;
        $head = $this->startRow + 1;

        $sheet->freezePane("A{$dataRowStart}");

        $sheet->mergeCells("A{$this->startRow}:A{$head}");
        $sheet->mergeCells("B{$this->startRow}:B{$head}");
        $sheet->mergeCells("C{$this->startRow}:C{$head}");
        $sheet->mergeCells("D{$this->startRow}:D{$head}");
        $sheet->mergeCells("E{$this->startRow}:E{$head}");
        $sheet->mergeCells("F{$this->startRow}:I{$this->startRow}");
        $sheet->mergeCells('J8:K8');
        $sheet->mergeCells("J{$this->startRow}:K{$head}");

        $sheet->getStyle("A{$this->startRow}:K{$head}")->applyFromArray([
            'font' => [
                'bold' => true,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $highestRow = $sheet->getHighestRow();
        $lastCol = $sheet->getHighestColumn();

        $totalRow = $highestRow + 1;
        $ttdRow1 = $totalRow + 2;
        $ttdRow2 = $ttdRow1 + 1;
        $ttdInfo = $ttdRow2 + 4;
        $ttdNip1 = $ttdInfo + 1;
        $ttdRow3 = $ttdNip1 + 3;
        $ttdJudul2 = $ttdRow3 + 1;
        $ttdInfo2 = $ttdJudul2 + 4;
        $ttdNip2 = $ttdInfo2 + 1;

        $sheet->mergeCells("A2:C4");
        $sheet->mergeCells("A5:C5");
        $sheet->mergeCells("A6:C6");

        $sheet->mergeCells("F2:{$lastCol}2");
        $sheet->mergeCells("F3:{$lastCol}3");
        $sheet->mergeCells("F4:{$lastCol}4");
        $sheet->mergeCells("F5:{$lastCol}5");
        $sheet->mergeCells("F6:{$lastCol}6");

        $sheet->mergeCells("A{$ttdRow1}:C{$ttdRow1}");
        $sheet->mergeCells("A{$ttdRow2}:C{$ttdRow2}");
        $sheet->mergeCells("A{$ttdInfo}:C{$ttdInfo}");
        $sheet->mergeCells("A{$ttdNip1}:C{$ttdNip1}");
        $sheet->mergeCells("C{$ttdRow3}:E{$ttdRow3}");
        $sheet->mergeCells("C{$ttdJudul2}:E{$ttdJudul2}");
        $sheet->mergeCells("C{$ttdInfo2}:E{$ttdInfo2}");
        $sheet->mergeCells("C{$ttdNip2}:E{$ttdNip2}");
        $sheet->mergeCells("D{$ttdRow1}:F{$ttdRow1}");
        $sheet->mergeCells("D{$ttdRow2}:F{$ttdRow2}");
        $sheet->mergeCells("D{$ttdInfo}:F{$ttdInfo}");
        $sheet->mergeCells("D{$ttdNip1}:F{$ttdNip1}");
        $sheet->mergeCells("G{$ttdRow1}:I{$ttdRow1}");
        $sheet->mergeCells("G{$ttdRow2}:I{$ttdRow2}");
        $sheet->mergeCells("G{$ttdInfo}:I{$ttdInfo}");
        $sheet->mergeCells("G{$ttdNip1}:I{$ttdNip1}");
        $sheet->mergeCells("J{$ttdRow1}:K{$ttdRow1}");
        $sheet->mergeCells("J{$ttdRow2}:K{$ttdRow2}");
        $sheet->mergeCells("J{$ttdInfo}:K{$ttdInfo}");
        $sheet->mergeCells("J{$ttdNip1}:K{$ttdNip1}");
        $sheet->mergeCells("F{$ttdRow3}:K{$ttdRow3}");
        $sheet->mergeCells("F{$ttdJudul2}:K{$ttdJudul2}");
        $sheet->mergeCells("F{$ttdInfo2}:K{$ttdInfo2}");
        $sheet->mergeCells("F{$ttdNip2}:K{$ttdNip2}");

        $sheet->setCellValue("A{$ttdRow1}", ("Mengetahui,"));
        $sheet->setCellValue("A{$ttdRow2}", "Kepala Bidang Pengelolaan Sampah dan Limbah B3");
        $sheet->setCellValue("A{$ttdInfo}", trim($jabatan->kpaAsn->nama ?? "-"));
        $sheet->setCellValue("A{$ttdNip1}", "Nip. " . ($jabatan->kpaAsn->nip ?? "-"));
        $sheet->setCellValue("D{$ttdRow1}", 'Lunas Bayar');
        $sheet->setCellValue("D{$ttdRow2}", 'Bendahara Pengeluaran');
        $sheet->setCellValue("D{$ttdInfo}", trim($jabatan->bpAsn->nama ?? "-"));
        $sheet->setCellValue("D{$ttdNip1}", 'Nip. ' . ($jabatan->bpAsn?->nip ?? "-"));
        $sheet->setCellValue("G{$ttdRow1}", 'Dibayar oleh');
        $sheet->setCellValue("G{$ttdRow2}", 'Bendahara Pengeluaran Pembantu');
        $sheet->setCellValue("G{$ttdInfo}", trim($jabatan->bppAsn->nama ?? "-"));
        $sheet->setCellValue("G{$ttdNip1}", 'Nip. ' . ($jabatan->bppAsn->nip ?? "-"));
        $sheet->setCellValue("J{$ttdRow1}", "PPTK");
        $sheet->setCellValue("J{$ttdInfo}", trim($jabatan->pptkAsn->nama ?? "-"));
        $sheet->setCellValue("J{$ttdNip1}", 'Nip. ' . ($jabatan->pptkAsn->nip ?? "-"));
        // $sheet->setCellValue("A{$ttdRow1}", 'Setuju Bayar');
        // $sheet->setCellValue("A{$ttdRow2}", 'Bendahara');
        // $sheet->setCellValue("A{$ttdInfo}", trim($jabatan->bpAsn->nama ?? "-"));
        // $sheet->setCellValue("A{$ttdNip1}", 'Nip. ' . ($jabatan->bpAsn?->nip ?? "-"));
        // $sheet->setCellValue("C{$ttdRow3}", ("Mengetahui,"));
        // $sheet->setCellValue("C{$ttdJudul2}", "Kepala Bidang Pengelolaan Sampah dan Limbah B3");
        // $sheet->setCellValue("C{$ttdInfo2}", trim($jabatan->kpaAsn->nama ?? "-"));
        // $sheet->setCellValue("C{$ttdNip2}", "Nip. " . ($jabatan->kpaAsn->nip ?? "-"));
        // $sheet->setCellValue("D{$ttdRow1}", 'Dibayar oleh');
        // $sheet->setCellValue("D{$ttdRow2}", 'Bendahara Pengeluaran Pembantu');
        // $sheet->setCellValue("D{$ttdInfo}", trim($jabatan->bppAsn->nama ?? "-"));
        // $sheet->setCellValue("D{$ttdNip1}", 'Nip. ' . ($jabatan->bppAsn->nip ?? "-"));
        // $sheet->setCellValue("G{$ttdRow1}", "PPTK");
        // $sheet->setCellValue("G{$ttdInfo}", trim($jabatan->pptkAsn->nama ?? "-"));
        // $sheet->setCellValue("G{$ttdNip1}", 'Nip. ' . ($jabatan->pptkAsn->nip ?? "-"));
        // $sheet->setCellValue("J{$ttdRow1}", 'Verifikasi');
        // $sheet->setCellValue("J{$ttdRow2}", "Kepala UPTD LH Kecamatan " . Str::title($department));
        // $sheet->setCellValue("J{$ttdInfo}", trim($kuptd ? Str::title($kuptd->nama ?? "-") : "-"));
        // $sheet->setCellValue("F{$ttdRow3}", ("Mengetahui,"));
        // $sheet->setCellValue("F{$ttdJudul2}", "Kasubbag Keuangan");
        // $sheet->setCellValue("F{$ttdInfo2}", trim($jabatan->kasubbagAsn->nama ?? "-"));
        // $sheet->setCellValue("F{$ttdNip2}", 'Nip. ' . ($jabatan->kasubbagAsn->nip ?? "-"));
        // $sheet->setCellValue(
        //     "J{$ttdNip1}",
        //     'Nip. ' . ($kuptd->nip ?? "-")
        // );

        $sheet->setCellValue('A5', 'PEMERINTAH KOTA PALEMBANG');
        $sheet->setCellValue('A6', 'DINAS LINGKUNGAN HIDUP KOTA PALEMBANG');

        $sheet->setCellValue('F2', 'PEMBAYARAN TENAGA PENYEDIA JASA LAYANAN PERORANGAN (PJLP)');
        $sheet->setCellValue('F3', 'DINAS LINGKUNGAN HIDUP KOTA PALEMBANG TAHUN ANGGARAN ' . now()->year);
        $sheet->setCellValue('F4', "Periode : {$formatDate($request->input('from_date'))} S/D {$formatDate($request->input('to_date'))}");
        $sheet->setCellValue('F5', 'Lokasi : ');
        $sheet->setCellValue('F6', "PJLP : " . ($jabatan->nama ?? "-"));

        $sheet->getStyle("A5:A6")->applyFromArray([
            'font' => [
                'bold' => true,
            ],
            'alignment' => [
                'wrapText' => true,
                'vertical' => Alignment::VERTICAL_CENTER,
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
        ]);

        $sheet->getStyle('E2:F6')->applyFromArray([
            'font' => [
                'bold' => true,
            ],
        ]);

        $sheet->getStyle("F4:F6")->applyFromArray([
            'alignment' => [
                'wrapText' => true,
                'vertical' => Alignment::VERTICAL_TOP,
                'horizontal' => Alignment::HORIZONTAL_LEFT,
            ],
        ]);

        $sheet->getStyle("G5:{$lastCol}5")->applyFromArray([
            'alignment' => [
                'wrapText' => true,
                'vertical' => Alignment::VERTICAL_TOP,
            ],
        ]);

        $centerStyle = [
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
                'horizontal' => Alignment::HORIZONTAL_CENTER
            ]
        ];

        foreach ([$ttdRow1, $ttdRow2, $ttdInfo, $ttdNip1, $ttdRow3, $ttdJudul2, $ttdInfo2, $ttdNip2] as $row) {
            $sheet->getStyle("A{$row}:K{$row}")->applyFromArray($centerStyle);
        }

        // $sheet->getStyle("A{$ttdRow1}:K{$ttdRow1}")->applyFromArray([
        //     'alignment' => [
        //         'vertical' => Alignment::VERTICAL_CENTER,
        //         'horizontal' => Alignment::HORIZONTAL_CENTER
        //     ]
        // ]);

        // $sheet->getStyle("A{$ttdRow2}:K{$ttdRow2}")->applyFromArray([
        //     'alignment' => [
        //         'vertical' => Alignment::VERTICAL_CENTER,
        //         'horizontal' => Alignment::HORIZONTAL_CENTER
        //     ]
        // ]);

        // $sheet->getStyle("A{$ttdInfo}:K{$ttdInfo}")->applyFromArray([
        //     'alignment' => [
        //         'vertical' => Alignment::VERTICAL_CENTER,
        //         'horizontal' => Alignment::HORIZONTAL_CENTER
        //     ]
        // ]);

        $sheet->getRowDimension(5)->setRowHeight(-1);

        $dataStartRow = $this->startRow + 2;
        $counter = 1;
        $totalRow = $highestRow + 1;

        for ($row = $dataStartRow; $row <= $highestRow; $row++) {
            $column = ($counter % 2 === 1) ? 'K' : 'J';

            $sheet->setCellValue("{$column}{$row}", $counter);

            $sheet->getStyle("{$column}{$row}")->applyFromArray([
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_LEFT,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ]);

            $counter++;
        }

        $sheet->getColumnDimension('H')->setAutoSize(false)->setWidth(15);
        $sheet->getColumnDimension('J')->setAutoSize(false)->setWidth(18);
        $sheet->getColumnDimension('K')->setAutoSize(false)->setWidth(18);

        $sheet->getStyle("F{$head}:I{$totalRow}")->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->setCellValue("H{$totalRow}", 'Jumlah');
        $sheet->setCellValue("E2", 'DAFTAR :');

        $sheet->setCellValue("I8", 'Kode Rek');
        $sheet->setCellValue("J8", ': 2.11.11.2.01.0016.5.1.02.02.001.00030');

        foreach (['E2', 'I8'] as $col) {
            $sheet->getStyle($col)->applyFromArray([
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_RIGHT,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ]);
        }

        $sheet->getStyle("H{$totalRow}")->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->getStyle("H{$totalRow}:I{$totalRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getStyle("D{$this->startRow}:D{$highestRow}")->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->getStyle("E{$this->startRow}:E{$highestRow}")->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->setCellValue(
            "I{$totalRow}",
            "=SUM(I{$dataStartRow}:I{$highestRow})",
        );

        // $sheet->getStyle("F{$totalRow}:H{$totalRow}")->applyFromArray([
        //     'font' => [
        //         'bold' => true,
        //     ],
        //     'alignment' => [
        //         'horizontal' => Alignment::HORIZONTAL_CENTER,
        //         'vertical'   => Alignment::VERTICAL_CENTER,
        //     ],
        //     'borders' => [
        //         'allBorders' => [
        //             'borderStyle' => Border::BORDER_THIN,
        //         ],
        //     ],
        // ]);

        $sheet->getStyle("I{$dataStartRow}:I{$totalRow}")
            ->getNumberFormat()
            ->setFormatCode('"Rp" #,##0');

        $sheet->getStyle("A{$this->startRow}:I{$highestRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getStyle("J{$this->startRow}:K{$highestRow}")
            ->getBorders()
            ->getAllBorders()
            ->setBorderStyle(Border::BORDER_NONE);

        $sheet->getStyle("J{$this->startRow}:K{$highestRow}")->applyFromArray([
            'borders' => [
                'right' => [
                    'borderStyle' => Border::BORDER_THIN
                ],
                'bottom' => [
                    'borderStyle' => Border::BORDER_THIN
                ]
            ]
        ]);

        foreach (['A', 'B', 'C', 'E'] as $col) {
            $sheet->getStyle("{$col}{$this->startRow}:{$col}{$highestRow}")->applyFromArray([
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ]);
        }

        foreach (['A', 'B', 'C', 'F', 'G', 'H', 'I', 'J'] as $col) {
            $sheet->getStyle("{$col}{$this->startRow}:{$col}{$head}")->applyFromArray([
                'alignment' => [
                    'horizontal'   => Alignment::HORIZONTAL_CENTER,
                ],
            ]);

            $sheet->getStyle("{$col}{$this->startRow}:{$col}{$highestRow}")->applyFromArray([
                'alignment' => [
                    // 'horizontal' => Alignment::HORIZONTAL_RIGHT,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ]);
        }

        $sheet->getStyle("A{$this->startRow}:K{$head}")->applyFromArray([
            'font' => [
                'bold' => true
            ],
            'alignment' => [
                'vertical'   => Alignment::VERTICAL_CENTER,
                'wrapText'   => true,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getStyle("E{$this->startRow}:H{$head}")->applyFromArray([
            'alignment' => [
                'horizontal'   => Alignment::HORIZONTAL_CENTER,
            ],
        ]);
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
                $sheet = $event->sheet;
                $protection = $sheet->getProtection();
                $protection->setSheet(true);
                $protection->setPassword($password);
            },
        ];
    }
}
