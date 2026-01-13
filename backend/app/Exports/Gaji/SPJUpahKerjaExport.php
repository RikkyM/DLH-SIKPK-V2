<?php

namespace App\Exports\Gaji;

use App\Models\Pegawai;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SPJUpahKerjaExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
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
            ->select('id', 'old_id', 'id_department', 'id_penugasan', 'id_shift', 'badgenumber', 'nama')
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
            ->when($search, function ($data, $search) {
                $data->whereLike('badgenumber', "%{$search}%")
                    ->orWhereLike('nama', "%{$search}%");
            })
            ->when(empty($department) || (int) $department !== 23, function ($data) {
                $data->where('id_department', '!=', 23);
            })
            ->when(!empty($department), function ($data, $department) {
                $data->where('id_department', $department);
            })
            ->when(!empty($shift), function ($data, $shift) {
                $data->where('id_shift', $shift);
            })
            ->when(!empty($korlap), function ($data, $korlap) {
                $data->where('id_korlap', $korlap);
            })
            ->when(!empty($jabatan), function ($data, $jabatan) {
                $data->where('id_penugasan', $jabatan);
            })
            ->orderBy('nama')
            ->get();

        return $datas->map(function ($data, $index) use ($jumlah_hari) {
            return [
                $index + 1,
                "'" . $data->badgenumber,
                $data->nama,
                $data->jabatan?->nama ?: "-",
                $data->department?->DeptName ?: "-",
                $jumlah_hari,
                $data->kehadirans->count() / 2 ?: "-",
                'Rp ' . number_format($data->jabatan?->gaji, 0, ',', '.') ?: 0,
                'Rp ' . number_format($data->jabatan?->gaji * ($data->kehadirans->count() / 2), 0, ',', '.') ?: 0
            ];
        });
    }

    public function headings(): array
    {
        return [
            '#',
            'NIK',
            'Nama Lengkap',
            'Penugasan',
            'Unit Kerja',
            "Jumlah\nHari Kerja",
            "Jumlah\nMasuk Kerja",
            "Gaji\nUpah Harian",
            "Total\nGaji/Upah"
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        $sheet->getStyle('A1:I1')->applyFromArray([
            'font' => [
                'bold' => true
            ],
            'alignment' => [
                'vertical'   => Alignment::VERTICAL_CENTER,
                'wrapText'   => true,
            ],
        ]);

        foreach (['A', 'B', 'F', 'G', 'H', 'I'] as $col) {
            $sheet->getStyle("{$col}1")->applyFromArray([
                'alignment' => [
                    'horizontal'   => Alignment::HORIZONTAL_CENTER,
                ],
            ]);

            $sheet->getStyle("{$col}2:{$col}{$highestRow}")->applyFromArray([
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ]);
        }
    }
}
