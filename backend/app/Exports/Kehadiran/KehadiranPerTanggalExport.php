<?php

namespace App\Exports\Kehadiran;

use App\Models\Pegawai;
use App\Services\KehadiranService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class KehadiranPerTanggalExport implements FromCollection, WithMapping, WithHeadings, ShouldAutoSize, WithStyles
{
    protected KehadiranService $kehadiranService;
    protected $request;
    protected $rowNumber = 0;

    protected function formatJam($jam)
    {
        return Carbon::parse($jam)->format('H:i');
    }

    public function __construct($request)
    {
        $this->request = $request;
        $this->kehadiranService = app(KehadiranService::class);
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
        $korlap = $this->request->query('korlap');
        $tanggal = $this->request->query('tanggal', now()->toDateString());

        $role = in_array(Auth::user()->role, ['superadmin', 'admin', 'keuangan', 'viewer'], true);

        // $startTime = microtime(true);

        return Pegawai::select('id', 'old_id', 'id_department', 'id_penugasan', 'id_shift', 'id_korlap', 'badgenumber', 'nama')
            ->with([
                'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
                'kehadirans' => fn($q) => $q->whereDate('check_time', $tanggal)
                // ->select('id', 'pegawai_id', 'check_time', 'check_type')
                // ->orderBy('check_time')
                ,
                'shift',
                'jabatan'
            ])
            // ->withMin(['kehadirans as jam_masuk' => fn($data) => $data->whereDate('check_time', $tanggal)
            //     ->where('check_type', 0)], 'check_time')
            // ->withMax(['kehadirans as jam_pulang' => fn($data) => $data->whereDate('check_time', $tanggal)
            //     ->where('check_type', 1)], 'check_time')
            ->where(function ($data) {
                $data->where('nama', '!=', '')
                    ->whereNotNull('nama')
                    ->where('nama', 'not like', '%admin%');
            })
            // ->whereHas('kehadirans')
            ->when(
                empty($department) || (int) $department !== 23,
                function ($data) {
                    $data->where('id_department', '!=', 23);
                }
            )
            ->when(!empty($department) && $role, function ($data) use ($department) {
                $data->where('id_department', $department);
            })
            ->when(!$role, function ($data) {
                $data->where('id_department', Auth::user()->id_department);
            })
            ->when($jabatan, function ($data) use ($jabatan) {
                $data->where('id_penugasan', $jabatan);
            })
            ->when($shift, function ($data) use ($shift) {
                $data->where('id_shift', $shift);
            })
            ->when($korlap, function ($data) use ($korlap) {
                $data->where('id_korlap', $korlap);
            })
            ->when($search, function ($data) use ($search) {
                $data->where(function ($d) use ($search) {
                    $d->where('nama', 'like', "%{$search}%")
                        ->orWhere('badgenumber', 'like', "%{$search}%");
                });
            })
            ->orderBy('nama', 'asc')
            ->get();

        // $endTime = microtime(true);
        // $executionTime = round($endTime - $startTime, 2);

        // dd([
        //     'execution_time' => $executionTime . ' detik',
        //     'data_count' => $datas->count(),
        //     'data' => $datas->toArray()
        // ]);

        // dd($datas->toArray());

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

        $kehadiran = $data->kehadirans;

        $toMenit = function ($jam) {
            if (!$jam) return null;
            [$h, $m] = explode(':', substr($jam, 0, 5));
            return ((int) $h * 60) + (int) $m;
        };

        $formatHour = function ($jam) {
            return $jam ? substr($jam, 11, 5) : null;
        };

        $decodeRules = function ($rules) {
            if (is_array($rules)) return $rules;
            return json_decode($rules ?? '[]', true) ?? [];
        };

        // $data->jam_masuk = $kehadiran
        //     ->where('check_type', 0)
        //     ->min('check_time');
        // $data->jam_pulang = $kehadiran
        //     ->where('check_type', 1)
        //     ->max('check_time');

        $jamMasuk = $kehadiran
            ->where('check_type', 0)
            ->min('check_time');

        $jamPulang = $kehadiran
            ->where('check_type', 1)
            ->max('check_time');

        $shiftMasuk = $data->shift->jam_masuk ?? null;
        $shiftPulang = $data->shift->jam_keluar ?? null;

        $menitMasuk         = $toMenit($formatHour($jamMasuk));
        $menitPulang        = $toMenit($formatHour($jamPulang));
        $menitShiftMasuk    = $toMenit($shiftMasuk);
        $menitShiftPulang   = $toMenit($shiftPulang);

        $telatRules = collect($decodeRules($data->shift->telat ?? []))
            ->map(fn($r) => $toMenit($r))
            ->sort()
            ->values()
            ->toArray();

        $pulcetRules = collect($decodeRules($data->shift->pulang_cepat ?? []))
            ->map(fn($r) => $toMenit($r))
            ->sort()
            ->values()
            ->toArray();

        $pulangCepat = 0;
        if ($menitPulang !== null && $menitShiftPulang !== null) {
            $pulangCepat = max(0, $menitShiftPulang - $menitPulang);
        }

        $getPotonganTelat = function ($menitMasuk, $rules) {
            if ($menitMasuk === null || empty($rules)) return 0;

            $total    = count($rules);
            $potongan = 0;

            foreach ($rules as $index => $batas) {
                if ($menitMasuk > $batas) {
                    $potongan = (int) round((($index + 1) / $total) * 50);
                }
            }

            return $potongan;
        };

        $getPotonganPulangCepat = function ($menitPulang, $menitShiftPulang, $rules) {
            if ($menitPulang === null || empty($rules)) return 0;
            if ($menitPulang >= $menitShiftPulang) return 0;

            $total    = count($rules);
            $potongan = 0;

            foreach ($rules as $index => $batas) {
                if ($menitPulang < $batas) {
                    $potongan = (int) round((($total - $index) / $total) * 50);
                    break;
                }
            }

            if ($potongan === 0 && $menitPulang < $menitShiftPulang) {
                $potongan = (int) round((1 / $total) * 50);
            }

            return $potongan;
        };

        $potonganTelat  = $getPotonganTelat($menitMasuk, $telatRules);
        $potonganPulcet = $getPotonganPulangCepat($menitPulang, $menitShiftPulang, $pulcetRules);

        $potonganTelat  = $getPotonganTelat($menitMasuk, $telatRules);
        $potonganPulcet = $getPotonganPulangCepat($menitPulang, $menitShiftPulang, $pulcetRules);

        $tidakHadir = !$jamMasuk && !$jamPulang;

        if ($tidakHadir) {
            $totalPotongan = 100;
        } else if (!$jamMasuk || !$jamPulang) {
            $totalPotongan = 50;
        } else {
            $totalPotongan = max($potonganTelat, $potonganPulcet);
        }

        $upah            = $data->jabatan->gaji ?? 0;
        $potonganNominal = ($totalPotongan / 100) * $upah;

        $batasTelatMenit = !empty($telatRules) ? $telatRules[0] : $menitShiftMasuk;
        $selisihTelat = ($menitMasuk !== null && $batasTelatMenit !== null)
            ? max(0, $menitMasuk - $batasTelatMenit)
            : 0;

        $makeJam = function ($menit) {
            if ($menit === null || $menit <= 0) return null;
            return sprintf('%02d:%02d', floor($menit / 60), $menit % 60);
        };

        // $data->tanggal = Carbon::parse($data->jam_masuk)->format('d-m-Y');


        // $jamTelat = $this->kehadiranService->hitungJamTelat(
        //     $formatHour($data->jam_masuk),
        //     optional($data->shift)->jam_masuk
        // );

        // $pulangCepat = $this->kehadiranService->hitungJamPulangCepat(
        //     $formatHour($data->jam_pulang),
        //     optional($data->shift)->jam_keluar
        // );

        // $gaji = optional($data->jabatan)->gaji ?? 0;

        // $potongan = $this->kehadiranService->hitungPotonganGaji(
        //     $data->jam_masuk ? substr($data->jam_masuk, 11, 5) : null,
        //     $data->jam_pulang ? substr($data->jam_pulang, 11, 5) : null,
        //     $data->shift,
        //     $gaji
        // );

        return [
            $this->rowNumber,
            "'" . $data->badgenumber,
            $data->nama,
            $data?->department?->DeptName ?? "-",
            $data?->jabatan?->nama ?? "-",
            $data?->shift ? "{$jadwal} - {$jamMasuk} s.d {$jamPulang}" : "-",
            Carbon::parse($this->request->query('tanggal'))->format('d-m-Y'),
            $jamMasuk ? $formatHour($jamMasuk) : "-",
            $jamPulang ? $formatHour($jamPulang) : "-",
            // $data?->jam_masuk ? $this->formatJam($data->jam_masuk) : "-",
            // $data?->jam_pulang ? $this->formatJam($data->jam_pulang) : "-",
            $makeJam($selisihTelat) ?? "-",
            $makeJam($pulangCepat),
            'Rp ' . number_format($data?->jabatan?->gaji, 0, ',', '.'),
            $potonganNominal ? 'Rp ' . number_format(round($potonganNominal, 0), 0, ',', '.') : "-"
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
            'Tanggal',
            'Jam Masuk',
            'Jam Pulang',
            'Jam Telat',
            'Jam Pulang Cepat',
            'Upah Kerja',
            'Potongan Upah Kerja'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]]
        ];
    }
}
