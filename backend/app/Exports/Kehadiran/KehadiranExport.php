<?php

namespace App\Exports\Kehadiran;

use App\Models\Kehadiran;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class KehadiranExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
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
        $search = $this->request->query('search');
        $fromDate = $this->request->query('from_date');
        $toDate = $this->request->query('to_date');
        $datas = Kehadiran::with('pegawai:id,old_id,id_department,id_penugasan,id_shift,id_korlap,badgenumber,nama')
            ->select('id', 'old_id', 'pegawai_id', 'check_time', 'check_type')
            ->when($search, function ($data) use ($search) {
                $data->whereHas('pegawai', function ($d) use ($search) {
                    $d->where('badgenumber', 'like', "%{$search}%")
                        ->orWhere('nama', 'like', "%{$search}%");
                });
            })
            ->when($fromDate && $toDate, function ($data) use ($fromDate, $toDate) {
                $data->whereBetween('check_time', [
                    $fromDate . ' 00:00:00',
                    $toDate . ' 23:59:59'
                ]);
            })
            ->orderBy('check_time', 'desc')
            ->get();

        $grouped = $datas->groupBy(function ($row) {
            $tanggal = substr($row->check_time, 0, 10);
            return $row->pegawai_id . '|' . $tanggal;
        });

        return $grouped->map(function (Collection $items) {
            $first = $items->first();
            $tanggal = substr($first->check_time, 0, 10);

            $jamMasuk = '-';
            $jamPulang = '-';

            foreach ($items as $item) {
                $jam = substr($item->check_time, 11, 5);

                if ((int) $item->check_type === 0) {
                    $jamMasuk = $jam;
                } elseif ((int) $item->check_type === 1) {
                    $jamPulang = $jam;
                }
            }

            return (object) [
                'id'         => $first->id,
                'pegawai'    => $first->pegawai,
                'tanggal'    => $tanggal,
                'jam_masuk'  => $jamMasuk,
                'jam_pulang' => $jamPulang,
            ];
        })->values();
    }

    public function headings(): array
    {
        return [
            'NIK',
            'Nama Lengkap',
            'Unit Kerja',
            'Penugasan',
            'Tanggal',
            'Jam Masuk',
            'Jam Pulang',
        ];
    }

    public function map($row): array
    {
        return [
            "'" . $row->pegawai->badgenumber ?? '-',
            $row->pegawai->nama ?? '-',
            $row->pegawai->department->DeptName ?? '-',
            $row->pegawai->jabatan->nama ?? '-',
            Carbon::parse($row->tanggal)->format('d M Y'),
            $row->jam_masuk,
            $row->jam_pulang,
        ];
    }
}
