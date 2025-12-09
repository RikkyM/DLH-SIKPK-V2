<?php

namespace App\Exports\Kehadiran;

use App\Models\Pegawai;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class KehadiranPerTanggalExport implements FromCollection, WithMapping, WithHeadings, ShouldAutoSize, WithStyles
{
    protected $request;
    protected $rowNumber = 0;

    public function __construct($request)
    {
        $this->request = $request;
    }
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $search = $this->request->query('search');
        $department = $this->request->query('department');
        $jabatan = $this->request->query('jabatan');
        $shift = $this->request->query('shift');
        $tanggal = $this->request->query('tanggal', now()->toDateString());

        return Pegawai::with([
            'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
            'kehadirans:id,old_id,pegawai_id,check_time,check_type',
            'shift',
            'jabatan'
        ])
            ->select('id', 'old_id', 'id_department', 'id_penugasan', 'id_shift', 'id_korlap', 'badgenumber', 'nama')
            ->withMin(['kehadirans as jam_masuk' => fn($data) => $data->whereDate('check_time', $tanggal)
                ->where('check_type', 0)], 'check_time')
            ->withMax(['kehadirans as jam_pulang' => fn($data) => $data->whereDate('check_time', $tanggal)
                ->where('check_type', 1)], 'check_time')
            ->where(function ($data) {
                $data->where('nama', '!=', '')
                    ->whereNotNull('nama')
                    ->where('nama', 'not like', '%admin%');
            })
            ->whereHas('kehadirans')
            ->when(
                empty($department) || (int) $department !== 23,
                function ($data) {
                    $data->where('id_department', '!=', 23);
                }
            )->when($department, function ($data) use ($department) {
                $data->where('id_department', $department);
            })
            ->when($jabatan, function ($data) use ($jabatan) {
                $data->where('id_penugasan', $jabatan);
            })
            ->when($shift, function ($data) use ($shift) {
                $data->where('id_shift', $shift);
            })
            ->when($tanggal, function ($data) use ($tanggal) {
                $data->whereHas('kehadirans', fn($d) => $d->whereDate('check_time', $tanggal));
            })
            ->when($search, function ($data) use ($search) {
                $data->where(function ($d) use ($search) {
                    $d->where('nama', 'like', "%{$search}%")
                        ->orWhere('badgenumber', 'like', "%{$search}%");
                });
            })
            ->orderBy('nama', 'asc')
            ->get();


        // return $datas->map(function ($data, $index) {
        //     $jadwal = $data?->shift?->jadwal ? preg_replace('/\bKategori\s*/i', 'K', $data?->shift?->jadwal) : null;
        //     $jamMasuk = Carbon::parse($data?->shift?->jam_masuk)->format('H:i');
        //     $jamPulang = Carbon::parse($data?->shift?->jam_keluar)->format('H:i');

        //     return [
        //         'id' => $index + 1,
        //         'nik' => "'" . $data->badgenumber,
        //         'nama' => $data->nama,
        //         'department' => $data?->department?->DeptName ?? "-",
        //         'jabatan' => $data?->jabatan?->nama ?? "-",
        //         'shift'     => $data?->shift ? "{$jadwal} - {$jamMasuk} s.d {$jamPulang}" : "-",
        //         'jam_masuk' => $data?->jam_masuk ?? "-",
        //         'jam_pulang' => $data?->jam_pulang ?? "-"
        //     ];
        // });
    }

    public function map($data): array
    {
        $this->rowNumber++;
        $jadwal = $data?->shift?->jadwal ? preg_replace('/\bKategori\s*/i', 'K', $data?->shift?->jadwal) : null;
        $jamMasuk = Carbon::parse($data?->shift?->jam_masuk)->format('H:i');
        $jamPulang = Carbon::parse($data?->shift?->jam_keluar)->format('H:i');

        return [
            $this->rowNumber,
            "'" . $data->badgenumber,
            $data->nama,
            $data?->department?->DeptName ?? "-",
            $data?->jabatan?->nama ?? "-",
            $data?->shift ? "{$jadwal} - {$jamMasuk} s.d {$jamPulang}" : "-",
            $data?->jam_masuk ?? "-",
            $data?->jam_pulang ?? "-"
        ];
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
            'Jam Masuk',
            'Jam Pulang'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]]
        ];
    }
}
