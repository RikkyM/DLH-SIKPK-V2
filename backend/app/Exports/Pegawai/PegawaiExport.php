<?php

namespace App\Exports\Pegawai;

use App\Models\Pegawai;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PegawaiExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles, WithColumnWidths
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
        $search     = $this->request->query('search');
        $department = $this->request->query('department');
        $jabatan    = $this->request->query('jabatan');
        $shift      = $this->request->query('shift');
        $korlap     = $this->request->query('korlap');

        $datas = Pegawai::with([
            'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
            'shift',
            'jabatan'
        ])
            ->where(function ($data) {
                $data->where('nama', '!=', '')
                    ->whereNotNull('nama')
                    ->where('nama', 'not like', '%admin%');
            })
            ->when(empty($department) || (int) $department !== 23, function ($data) {
                $data->where('id_department', '!=', 23);
            })
            ->when(!empty($department), function ($data) use ($department) {
                $data->where('id_department', $department);
            })
            ->when(!empty($jabatan), function ($data) use ($jabatan) {
                $data->where('id_penugasan', $jabatan);
            })
            ->when(!empty($shift), function ($data) use ($shift) {
                $data->where('id_shift', $shift);
            })
            ->when($search, function ($data) use ($search) {
                $data->where(function ($d) use ($search) {
                    $d->where('nama', 'like', "%{$search}%")
                        ->orWhere('badgenumber', 'like', "%{$search}%");
                });
            })
            ->orderBy('nama', 'asc')
            ->get();

        return $datas->map(function ($data, $index) {
            $jamMasuk = Carbon::parse($data?->shift?->jam_masuk)->format('H:i');
            $jamPulang = Carbon::parse($data?->shift?->jam_keluar)->format('H:i');

            $jadwal = $data?->shift?->jadwal ? preg_replace('/\bKategori\s*/i', 'K', $data?->shift?->jadwal) : null;

            return [
                'id' => $index + 1,
                'nik' => "'" . $data->badgenumber,
                'nama' => $data->nama,
                'department' => $data?->department?->DeptName ?? "-",
                'jabatan' => $data?->jabatan?->nama ?? "-",
                'shift'     => $data?->shift ? "{$jadwal} - {$jamMasuk} s.d {$jamPulang}" : "-",
                'tempat_lahir' => $data?->tempat_lahir ?? "-",
                'tanggal_lahir' => $data?->tanggal_lahir ? Carbon::parse($data->tanggal_lahir)->format('d-m-Y') : "-",
                'usia' => $data->tanggal_lahir ? Carbon::parse($data->tanggal_lahir)->age : "-",
                'jenis_kelamin' => $data?->jenis_kelamin ?? "-",
                'alamat' => $data?->alamat ?? "-",
                'rt' => $data?->rt ?? "-",
                'rw' => $data?->rw ?? "-",
                'kelurahan' => $data?->kelurahan ?? "-",
                'kecamatan' => $data?->kecamatan ?? "-",
                'agama'     => $data?->agama ?? "-",
                'status_perkawinan' => $data?->status_perkawinan ?? "-",
                'rute_kerja'    => $data?->rute_kerja ?? "-"
            ];
        })->values();
    }

    public function headings(): array
    {
        return [
            'No.',
            'NIK',
            'Nama Lengkap',
            'Unit Kerja',
            'Penugasan',
            'Kategori Kerja',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Usia',
            'Jenis Kelamin',
            'Alamat',
            'RT',
            'RW',
            'Kelurahan',
            'Kecamatan',
            'Agama',
            'Status Perkawinan',
            'Rute / Jalur Kerja'
        ];
    }

    public function columnWidths(): array
    {
        return [
            'K' => 43
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        $sheet->getStyle("A1:R{$highestRow}")
            ->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_LEFT)
            ->setVertical(Alignment::VERTICAL_CENTER);

        $headerAlignment = [
            'A' => Alignment::HORIZONTAL_CENTER,
            'F' => Alignment::HORIZONTAL_CENTER,
            'G' => Alignment::HORIZONTAL_CENTER,
            'H' => Alignment::HORIZONTAL_CENTER,
            'I' => Alignment::HORIZONTAL_CENTER,
            'L' => Alignment::HORIZONTAL_CENTER,
            'M' => Alignment::HORIZONTAL_CENTER,
        ];

        foreach ($headerAlignment as $col => $align) {
            $sheet->getStyle("{$col}1:R{$highestRow}")
                ->getAlignment()
                ->setHorizontal($align)
                ->setVertical(Alignment::VERTICAL_CENTER);
        }

        $sheet->getStyle("K1:K{$highestRow}")
            ->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_LEFT)
            ->setVertical(Alignment::VERTICAL_TOP)
            ->setWrapText(true);

        $sheet->getStyle('A1:R1')->getFont()->setBold(true);

        return [];
    }
}
