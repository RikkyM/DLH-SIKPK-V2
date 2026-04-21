<?php

namespace App\Exports\Gaji;

use App\Models\{Departments, Jabatan, Pegawai, EncryptFile};
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\{FromCollection, ShouldAutoSize, WithCustomStartCell, WithDrawings, WithHeadings, WithStyles};
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Events\BeforeExport;
use PhpOffice\PhpSpreadsheet\Style\{Alignment, Border};
use PhpOffice\PhpSpreadsheet\Worksheet\{Drawing, Worksheet};

class SPJPotonganExport implements FromCollection, WithHeadings, WithCustomStartCell, WithDrawings, ShouldAutoSize, WithStyles
{
    private int $startRow = 9;
    protected $request;

    public function __construct($request)
    {
        $this->request = $request;
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

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $request = $this->request;

        $search     = $request->input('search');
        $dept       = $request->input('department');
        $jabatan    = $request->input('jabatan');
        $shift      = $request->input('shift');
        $korlap     = $request->input('korlap');
        $fromDate   = $request->input('from_date');
        $toDate     = $request->input('to_date');

        $jumlah_hari = 0;

        if ($fromDate && $toDate) {
            $jumlah_hari = Carbon::parse($fromDate)
                ->diffInDays(Carbon::parse($toDate)) + 1;
        }

        $pegawai = Pegawai::with([
            'kehadirans' => fn($q) => $q->whereBetween('check_time', [
                $fromDate . ' 00:00:00',
                $toDate   . ' 23:59:59'
            ]),
            'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
            'jabatan',
            'shift'
        ])
            ->select('id', 'old_id', 'id_department', 'id_penugasan', 'id_shift', 'badgenumber', 'nama')
            ->where(function ($data) {
                $data->where('nama', '!=', '')
                    ->whereNotNull('nama')
                    ->where('nama', 'not like', '%admin%')
                    ->where('id_department', '!=', 23);
            })
            ->when(Auth::user()->role === 'operator', function ($q) {
                $q->where('id_department', Auth::user()->id_department);
            })
            ->when($search, function ($data) use ($search) {
                $data->whereLike('badgenumber', "%{$search}%")
                    ->orWhereLike('nama', "%{$search}%");
            })
            ->when(empty($dept) || (int) $dept !== 23, function ($data) {
                $data->where('id_department', '!=', 23);
            })
            ->when(!empty($dept), function ($data) use ($dept) {
                $data->where('id_department', $dept);
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

        return $pegawai->map(function ($data, $index) use ($jumlah_hari) {
            $hasil = $this->hitungPotongan($data, $jumlah_hari);

            $hitungKehadiran = $data->kehadirans
                ->groupBy(function ($item) {
                    $tanggal = Carbon::parse($item->check_time)->toDateString();
                    return $tanggal . '_' . $item->check_type;
                })->count() / 2;

            $totalUpah = ($data->jabatan?->gaji ?? 0) * ($hitungKehadiran);
            return [
                $index + 1,
                $data->no_rekening ? "'{$data->no_rekening}" : "-",
                $data->nama,
                $jumlah_hari,
                $hitungKehadiran ?: "-",
                "Rp " .  number_format($data->jabatan?->gaji, 0, ',', '.') ?: 0,
                "Rp " .  number_format($hasil['upah_bersih'], 0, ',', '.') ?: 0,
                $totalUpah ?: "Rp 0",
                null,
                null,
                $hasil['potongan'] ?: "Rp 0",
            ];
        });
    }

    public function headings(): array
    {
        return [
            [
                '#',
                'Nomor Rekening',
                'Nama Lengkap',
                "Jumlah\nHari\nKerja",
                "Jumlah\nMasuk\nKerja",
                'Pembayaran Upah',
                '',
                '',
                'Tanda Tangan',
                '',
                "Potongan\nUpah Kerja"
            ],
            [
                '',
                '',
                '',
                '',
                '',
                "Per-Hari\n(Rp)",
                "Sesuai Hari\nKerja (Rp)",
                "Yang Harus\nDibayar (Rp)",
                '',
                '',
                ''
            ]
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $request = $this->request;

        $user = Auth::user();
        $formatDate = fn($date) => Carbon::parse($date)->format('d F Y');

        $dataRowStart = $this->startRow + 2;
        $head = $this->startRow + 1;

        $sheet->freezePane("A{$dataRowStart}");

        // merge logo
        $sheet->mergeCells("A2:C4");
        $sheet->mergeCells("A5:C5");
        $sheet->mergeCells("A6:C6");

        // merge heading
        $sheet->mergeCells("A{$this->startRow}:A{$head}");
        $sheet->mergeCells("B{$this->startRow}:B{$head}");
        $sheet->mergeCells("C{$this->startRow}:C{$head}");
        $sheet->mergeCells("D{$this->startRow}:D{$head}");
        $sheet->mergeCells("E{$this->startRow}:E{$head}");
        $sheet->mergeCells("F{$this->startRow}:H{$this->startRow}");
        $sheet->mergeCells("I8:K8");
        $sheet->mergeCells("I{$this->startRow}:J{$head}");
        $sheet->mergeCells("K{$this->startRow}:K{$head}");

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

        $sheet->mergeCells("F2:{$lastCol}2");
        $sheet->mergeCells("F3:{$lastCol}3");
        $sheet->mergeCells("F4:{$lastCol}4");
        $sheet->mergeCells("F5:{$lastCol}5");
        $sheet->mergeCells("F6:{$lastCol}6");

        $totalRow = $highestRow + 2;
        $ttdRowTgl = $totalRow + 1;
        $ttdRow1 = $totalRow + 2;
        $ttdRow2 = $ttdRow1 + 1;
        $ttdInfo = $ttdRow2 + 4;
        $ttdNip1 = $ttdInfo + 1;
        $ttdRow3 = $ttdNip1 + 3;
        $ttdJudul2 = $ttdRow3 + 1;
        $ttdInfo2 = $ttdJudul2 + 4;
        $ttdNip2 = $ttdInfo2 + 1;

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
        $sheet->mergeCells("G{$ttdRow1}:H{$ttdRow1}");
        $sheet->mergeCells("G{$ttdRow2}:H{$ttdRow2}");
        $sheet->mergeCells("G{$ttdInfo}:H{$ttdInfo}");
        $sheet->mergeCells("G{$ttdNip1}:H{$ttdNip1}");
        $sheet->mergeCells("I{$ttdRowTgl}:K{$ttdRowTgl}");
        $sheet->mergeCells("I{$ttdRow1}:K{$ttdRow1}");
        $sheet->mergeCells("I{$ttdRow2}:K{$ttdRow2}");
        $sheet->mergeCells("I{$ttdInfo}:K{$ttdInfo}");
        $sheet->mergeCells("I{$ttdNip1}:K{$ttdNip1}");
        $sheet->mergeCells("F{$ttdRow3}:K{$ttdRow3}");
        $sheet->mergeCells("F{$ttdJudul2}:K{$ttdJudul2}");
        $sheet->mergeCells("F{$ttdInfo2}:K{$ttdInfo2}");
        $sheet->mergeCells("F{$ttdNip2}:K{$ttdNip2}");

        $jabatan = $request->input('jabatan') ? Jabatan::with(['kpaAsn', 'bpAsn', 'bppAsn', 'pptkAsn'])->findOrFail($request->input('jabatan')) : "-";
        $sheet->setCellValue("A{$ttdRow1}", ("Menyetujui"));
        $sheet->setCellValue("A{$ttdRow2}", "Kuasa Pengguna Anggaran");
        $sheet->setCellValue("A{$ttdInfo}", trim($jabatan->kpaAsn->nama ?? "-"));
        $sheet->setCellValue("A{$ttdNip1}", "Nip. " . ($jabatan->kpaAsn->nip ?? "-"));
        $sheet->setCellValue("D{$ttdRow1}", 'Lunas Bayar');
        $sheet->setCellValue("D{$ttdRow2}", 'Bendahara Pengeluaran');
        $sheet->setCellValue("D{$ttdInfo}", trim($jabatan->bpAsn->nama ?? "-"));
        $sheet->setCellValue("D{$ttdNip1}", 'Nip. ' . ($jabatan->bpAsn?->nip ?? "-"));
        $sheet->setCellValue("G{$ttdRow1}", 'Bendahara Pengeluaran Pembantu');
        $sheet->setCellValue("G{$ttdInfo}", trim($jabatan->bppAsn->nama ?? "-"));
        $sheet->setCellValue("G{$ttdNip1}", 'Nip. ' . ($jabatan->bppAsn->nip ?? "-"));
        $sheet->setCellValue("I{$ttdRowTgl}", ("Palembang, " . ($request->input('tanggal_spj') ? strtoupper(Carbon::parse($request->input('tanggal_spj'))->translatedFormat('d F Y')) : strtoupper(Carbon::now()->translatedFormat('d F Y')))));
        $sheet->setCellValue("I{$ttdRow1}", "PPTK");
        $sheet->setCellValue("I{$ttdInfo}", trim($jabatan->pptkAsn->nama ?? "-"));
        $sheet->setCellValue("I{$ttdNip1}", 'Nip. ' . ($jabatan->pptkAsn->nip ?? "-"));

        $deptName = in_array(Auth::user()->role, ['superadmin', 'admin'])
            ? (Departments::find($this->request->input('department'))->DeptName ?? "-")
            : Departments::find(Auth::user()->id_department)->DeptName;

        $deptName = Str::of($deptName)
            ->replace("UPTD", "")
            ->trim()
            ->upper();

        $sekretariat = $this->request->input('department') === '2' || Auth::user()->username === 'dlhsekretariat';

        $sheet->setCellValue('A5', 'PEMERINTAH KOTA PALEMBANG');
        $sheet->setCellValue('A6', 'DINAS LINGKUNGAN HIDUP KOTA PALEMBANG');

        $sheet->setCellValue('F2', 'PEMBAYARAN TENAGA PENYEDIA JASA LAYANAN PERORANGAN (PJLP)');
        $sheet->setCellValue('F3', 'DINAS LINGKUNGAN HIDUP KOTA PALEMBANG TAHUN ANGGARAN ' . now()->year);
        $sheet->setCellValue('F4', "Periode : " . strtoupper($formatDate($request->input('from_date'))) . " S/D " . $formatDate($request->input('to_date')));
        $sheet->setCellValue('F5', 'Lokasi :  ' . ($sekretariat ? "DINAS LINGKUNGAN HIDUP KOTA PALEMBANG" : ("WILAYAH KECAMATAN " . $deptName)));
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

        foreach ([$ttdRowTgl, $ttdRow1, $ttdRow2, $ttdInfo, $ttdNip1, $ttdRow3, $ttdJudul2, $ttdInfo2, $ttdNip2] as $row) {
            $sheet->getStyle("A{$row}:J{$row}")->applyFromArray($centerStyle);
        }

        $sheet->getRowDimension(5)->setRowHeight(-1);

        $dataStartRow = $this->startRow + 2;
        $counter = 1;
        $totalRow = $highestRow + 1;

        for ($row = $dataStartRow; $row <= $highestRow; $row++) {
            $column = ($counter % 2 === 1) ? 'J' : 'I';

            $sheet->setCellValue("{$column}{$row}", $counter);

            $sheet->getStyle("{$column}{$row}")->applyFromArray([
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_LEFT,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ]);

            $counter++;
        }

        $sheet->getColumnDimension('H')->setAutoSize(false)->setWidth(17);
        $sheet->getColumnDimension('I')->setAutoSize(false)->setWidth(18);
        $sheet->getColumnDimension('J')->setAutoSize(false)->setWidth(18);
        $sheet->getColumnDimension('K')->setAutoSize(false)->setWidth(18);

        $sheet->getStyle("F{$head}:H{$totalRow}")->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->getStyle("K{$head}:K{$totalRow}")->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->setCellValue("G{$totalRow}", 'Jumlah');
        $sheet->setCellValue("E2", 'DAFTAR :');

        $noRek =  Jabatan::find($request->input('jabatan'))?->no_rekening ?? "-";
        $sheet->setCellValue("H8", 'Kode Rek');
        $sheet->setCellValue("I8", ': ' . ($noRek ?? "-"));

        foreach (['E2', 'H8'] as $col) {
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

        $sheet->getStyle("G{$totalRow}:K{$totalRow}")->applyFromArray([
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

        $sheet->setCellValue(
            "H{$totalRow}",
            "=SUM(H{$dataStartRow}:H{$highestRow})",
        );

        $sheet->setCellValue(
            "K{$totalRow}",
            "=SUM(K{$dataStartRow}:K{$highestRow})",
        );

        $sheet->getStyle("H{$dataStartRow}:H{$totalRow}")
            ->getNumberFormat()
            ->setFormatCode('"Rp" #,##0');

        $sheet->getStyle("K{$dataStartRow}:K{$totalRow}")
            ->getNumberFormat()
            ->setFormatCode('"Rp" #,##0');

        $sheet->getStyle("A{$this->startRow}:H{$highestRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getStyle("K{$this->startRow}:K{$highestRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getStyle("I{$this->startRow}:J{$highestRow}")
            ->getBorders()
            ->getAllBorders()
            ->setBorderStyle(Border::BORDER_NONE);

        $sheet->getStyle("I{$this->startRow}:J{$highestRow}")->applyFromArray([
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

        foreach (['A', 'B', 'C', 'F', 'G', 'H', 'I', 'K'] as $col) {
            $sheet->getStyle("{$col}{$this->startRow}:{$col}{$head}")->applyFromArray([
                'alignment' => [
                    'horizontal'   => Alignment::HORIZONTAL_CENTER,
                ],
            ]);

            $sheet->getStyle("{$col}{$this->startRow}:{$col}{$highestRow}")->applyFromArray([
                'alignment' => [
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

    private function hitungPotongan($data, $jumlah_hari)
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

        $perTanggal = $kehadiran->groupBy(function ($item) {
            return Carbon::parse($item->check_time)->toDateString();
        });

        $totalPotonganNominal = 0;
        $jumlahMasuk = 0;

        foreach ($perTanggal as  $records) {
            $jamMasukRaw  = $records->where('check_type', 0)->min('check_time');
            $jamPulangRaw = $records->where('check_type', 1)->max('check_time');

            $menitMasuk  = $toMenit($formatJam($jamMasukRaw));
            $menitPulang = $toMenit($formatJam($jamPulangRaw));

            $tidakHadir = !$jamMasukRaw && !$jamPulangRaw;

            $potonganTelat = 0;
            if ($menitMasuk !== null && !empty($telatRules)) {
                $total = count($telatRules);
                foreach ($telatRules as $index => $batas) {
                    if ($menitMasuk > $batas) {
                        $potonganTelat = (int) round((($index + 1) / $total) * 50);
                    }
                }
            }

            $potonganPulcet = 0;
            if ($menitPulang !== null && $menitShiftPulang !== null && !empty($pulcetRules)) {
                if ($menitPulang < $menitShiftPulang) {
                    $total = count($pulcetRules);
                    foreach ($pulcetRules as $index => $batas) {
                        if ($menitPulang < $batas) {
                            $potonganPulcet = (int) round((($total - $index) / $total) * 50);
                            break;
                        }
                    }
                    if ($potonganPulcet === 0) {
                        $potonganPulcet = (int) round((1 / $total) * 50);
                    }
                }
            }

            if ($tidakHadir) {
                $persen = 100;
            } elseif (!$jamMasukRaw || !$jamPulangRaw) {
                $persen = 50;
            } else {
                $persen = max($potonganTelat, $potonganPulcet);
            }

            $totalPotonganNominal += ($persen / 100) * $gaji;

            if ($jamMasukRaw && $jamPulangRaw) {
                $jumlahMasuk++;
            } else if ($jamMasukRaw || $jamPulangRaw) {
                $jumlahMasuk += 0.5;
            }
        }

        $hariTanpaRecord = $jumlah_hari - $perTanggal->count();
        $totalPotonganNominal += $hariTanpaRecord * $gaji;

        $upahBersih = max(0, ($gaji * $jumlah_hari) - $totalPotonganNominal);

        return [
            'gaji'              => $gaji,
            'jumlah_masuk'      => $jumlahMasuk,
            'potongan'          => round($totalPotonganNominal, 0),
            'upah_bersih'       => round($upahBersih, 0),
        ];
    }
}
