<?php

namespace App\Exports\Gaji;

use App\Models\Pegawai;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SPJUpahKerjaExport implements FromCollection, WithHeadings, WithStyles, WithCustomStartCell, ShouldAutoSize
{
    private int $startRow = 7;
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
                $data->no_rekening ? (string) $data->no_rekening : "-",
                "'" . $data->badgenumber,
                $data->nama,
                // $data->jabatan?->nama ?: "-",
                // $data->department?->DeptName ?: "-",
                // $jumlah_hari,
                $data->kehadirans->count() / 2 ?: "-",
                'Rp ' . number_format($data->jabatan?->gaji, 0, ',', '.') ?: 0,
                // $data->kehadirans->count() / 2 ?: "-",
                // 'Rp ' . number_format($data->jabatan?->gaji, 0, ',', '.') ?: 0,
                'Rp ' . number_format($totalUpah, 0, ',', '.'),
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
                'NIK',
                'Nama Lengkap',
                "Jumlah\nMasuk Kerja",
                'Pembayaran Upah',
                '',
                '',
                'Tanda Tangan',
                ''
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
                ''
            ]
        ];
    }

    public function startCell(): string
    {
        return 'A' . $this->startRow;
    }

    public function styles(Worksheet $sheet)
    {
        $dataRowStart = $this->startRow + 2;

        $sheet->freezePane("A{$dataRowStart}");
    
        $sheet->mergeCells('A7:A8');
        $sheet->mergeCells('B7:B8');
        $sheet->mergeCells('C7:C8');
        $sheet->mergeCells('D7:D8');
        $sheet->mergeCells('E7:E8');
        $sheet->mergeCells('F7:H7');
        $sheet->mergeCells('I7:J8');

        $sheet->getStyle('A7:J8')->applyFromArray([
            'font' => [
                'bold' => true,
            ],
            // 'alignment' => [
            //     'horizontal' => Alignment::HORIZONTAL_CENTER,
            //     'vertical'   => Alignment::VERTICAL_CENTER,
            //     'wrapText'   => true,
            // ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $highestRow = $sheet->getHighestRow();

        $dataStartRow = 9;
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

        $sheet->getColumnDimension('I')->setAutoSize(false)->setWidth(15);
        $sheet->getColumnDimension('J')->setAutoSize(false)->setWidth(15);

        $sheet->setCellValue("G{$totalRow}", 'Jumlah');
        $sheet->getStyle("G{$totalRow}")->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->getStyle("G{$totalRow}:H{$totalRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getStyle("E9:E{$highestRow}")->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);

        $sheet->setCellValue(
            "H{$totalRow}",
            "=SUM(H{$dataStartRow}:H{$highestRow})",
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

        $sheet->getStyle("H{$dataStartRow}:H{$totalRow}")
            ->getNumberFormat()
            ->setFormatCode('"Rp" #,##0');

        $sheet->getStyle("A7:H{$highestRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getStyle("I9:J{$highestRow}")
            ->getBorders()
            ->getAllBorders()
            ->setBorderStyle(Border::BORDER_NONE);

        $sheet->getStyle("I9:J{$highestRow}")->applyFromArray([
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
            $sheet->getStyle("{$col}9:{$col}{$highestRow}")->applyFromArray([
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ]);
        }

        foreach (['A', 'B', 'C', 'F', 'G', 'H'] as $col) {
            $sheet->getStyle("{$col}7:{$col}8")->applyFromArray([
                'alignment' => [
                    'horizontal'   => Alignment::HORIZONTAL_CENTER,
                ],
            ]);

            $sheet->getStyle("{$col}9:{$col}{$highestRow}")->applyFromArray([
                'alignment' => [
                    // 'horizontal' => Alignment::HORIZONTAL_RIGHT,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ]);
        }

        $sheet->getStyle('A7:J8')->applyFromArray([
            'font' => [
                'bold' => true
            ],
            'alignment' => [
                'vertical'   => Alignment::VERTICAL_CENTER,
                'wrapText'   => true,
            ],
        ]);

        $sheet->getStyle("E7:H8")->applyFromArray([
            'alignment' => [
                'horizontal'   => Alignment::HORIZONTAL_CENTER,
            ],
        ]);
    }
}
