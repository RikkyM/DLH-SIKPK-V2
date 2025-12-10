<?php

namespace App\Exports\Kehadiran;

use App\Models\Kehadiran;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class FingerExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $request;
    protected $number = 0;

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
        $tanggal    = $this->request->query('tanggal', now()->toDateString());
        $department = $this->request->query('department');
        $jabatan    = $this->request->query('jabatan');
        $shift      = $this->request->query('shift');
        $korlap      = $this->request->query('korlap');

        return Kehadiran::with('pegawai:id,old_id,id_department,id_penugasan,id_shift,id_korlap,badgenumber,nama')
            ->select('id', 'old_id', 'pegawai_id', 'check_time', 'check_type')
            ->when($tanggal, function ($data) use ($tanggal) {
                $data->whereDate('check_time', $tanggal);
            })
            ->when($department, function ($data) use ($department) {
                $data->whereHas('pegawai', function ($d) use ($department) {
                    $d->where('id_department', $department);
                });
            })
            ->when($jabatan, function ($data) use ($jabatan) {
                $data->whereHas('pegawai', function ($d) use ($jabatan) {
                    $d->where('id_penugasan', $jabatan);
                });
            })
            ->when($shift, function ($data) use ($shift) {
                $data->whereHas('pegawai', function ($d) use ($shift) {
                    $d->where('id_shift', $shift);
                });
            })
            ->when($search, function ($data) use ($search) {
                $data->whereHas('pegawai', function ($d) use ($search) {
                    $d->where('badgenumber', 'like', "%{$search}%")
                        ->orWhere('nama', 'like', "%{$search}%");
                });
            })
            ->orderBy('check_time', 'desc')
            ->get();
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
            'Finger',
            'Tanggal',
            'Waktu'
        ];
    }

    public function map($row): array
    {
        $this->number++;
        $jadwal = preg_replace('/\bKategori\s*/i', "K", $row->pegawai->shift?->jadwal);
        $jamMasuk = Carbon::parse($row->pegawai->shift?->jam_masuk)->format('H:i');
        $jamPulang = Carbon::parse($row->pegawai->shift?->jam_keluar)->format('H:i');

        $status = match ((int) $row->check_type) {
            0       => 'Masuk',
            1       => 'Pulang',
            default => '-'
        };

        return [
            $this->number,
            "'" . $row->pegawai->badgenumber,
            $row->pegawai->nama,
            $row->pegawai->department->DeptName ?? "-",
            $row->pegawai->jabatan->nama ?? "-",
            $row->pegawai->shift ? "{$jadwal} - {$jamMasuk} s.d {$jamPulang}" : "-",
            $status,
            $row->check_time ? Carbon::parse($row->check_time)->format('d-m-Y') : "-",
            $row->check_time ? Carbon::parse($row->check_time)->format('H:i') : "-",
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]]
        ];
    }
}
