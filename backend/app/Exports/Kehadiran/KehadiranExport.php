<?php

namespace App\Exports\Kehadiran;

use App\Models\EncryptFile;
use App\Models\Kehadiran;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Events\BeforeExport;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class KehadiranExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $request;
    protected $allStatus;

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
        $fromDate   = $this->request->query('from_date');
        $toDate     = $this->request->query('to_date');

        $role = in_array(Auth::user()->role, ['superadmin', 'admin', 'keuangan', 'viewer']);

        $datas  = Kehadiran::with([
            'pegawai:id,old_id,id_department,id_penugasan,id_shift,id_korlap,badgenumber,nama',
            'pegawai.department:DeptID,DeptName',
            'pegawai.jabatan:id,nama',
            'pegawai.shift:id,jadwal,jam_masuk,jam_keluar',
        ])
            ->select('id', 'old_id', 'pegawai_id', 'check_time', 'check_type')
            ->when($fromDate && $toDate, function ($data) use ($fromDate, $toDate) {
                $data->whereBetween('check_time', [
                    $fromDate . ' 00:00:00',
                    $toDate . ' 23:59:59'
                ]);
            })
            ->when(!empty($department) && $role, function ($data) use ($department) {
                $data->whereHas('pegawai', function ($d) use ($department) {
                    $d->where('id_department', $department);
                });
            })
            ->when(!$role, function ($data) {
                $data->whereHas('pegawai', function ($d) {
                    $d->where('id_department', Auth::user()->id_department);
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
            ->when($korlap, function ($data) use ($korlap) {
                $data->whereHas('pegawai', function ($d) use ($korlap) {
                    $d->where('id_korlap', $korlap);
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

        $pegawaiIds = $datas->pluck('pegawai_id')->unique();

        $tanggalMin = $fromDate ?? $datas->min(fn($d) => Carbon::parse($d->check_time)->toDateString());
        $tanggalMax = $toDate   ?? $datas->max(fn($d) => Carbon::parse($d->check_time)->toDateString());

        $this->allStatus = Kehadiran::whereIn('pegawai_id', $pegawaiIds)
            ->whereBetween('check_time', [
                $tanggalMin . ' 00:00:00',
                $tanggalMax . ' 23:59:59'
            ])
            ->whereNotNull('status_kerja')
            ->get(['pegawai_id', 'check_time', 'check_type', 'status_kerja'])
            ->groupBy(
                fn($k) =>
                $k->pegawai_id . '_' .
                    Carbon::parse($k->check_time)->toDateString() . '_' .
                    $k->check_type
            );

        $grouped = $datas->groupBy(function ($row) {
            $tanggal = Carbon::parse($row->check_time)->toDateString();
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
                'pegawai_id' => $first->pegawai_id,
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
            'Kategori Kerja',
            'Tanggal',
            'Jam Masuk',
            'Jam Pulang',
            'Jam Telat',
            'Jam Pulang Cepat',
            'Upah Kerja',
            'Potongan Upah',
            'Keterangan'
        ];
    }

    public function map($row): array
    {
        $jadwal = preg_replace('/\bKategori\s*/i', 'K', $row->pegawai->shift?->jadwal ?? "-");
        $jamMasuk = Carbon::parse($row->pegawai->shift->jam_masuk ?? null)->format('H:i')
            ?? '-';

        $jamPulang = Carbon::parse($row->pegawai->shift->jam_keluar ?? null)->format('H:i')
            ?? '-';

        $fromDate   = $this->request->query('from_date');
        $toDate     = $this->request->query('to_date');

        $jamMasuk = $row->jam_masuk;
        $jamPulang = $row->jam_pulang;

        $shiftMasuk  = $row->pegawai->shift->jam_masuk ?? null;
        $shiftPulang = $row->pegawai->shift->jam_keluar ?? null;

        $keyMasuk  = $row->pegawai_id . '_' . $row->tanggal . '_0';
        $keyPulang = $row->pegawai_id . '_' . $row->tanggal . '_1';

        $statusMasuk  = $this->allStatus->get($keyMasuk)?->first()?->status_kerja;
        $statusPulang = $this->allStatus->get($keyPulang)?->first()?->status_kerja;

        $toMenit = function ($jam) {
            if (!$jam) return null;
            [$h, $m] = explode(':', substr($jam, 0, 5));
            return ((int) $h * 60) + (int) $m;
        };

        $formatJam = function ($menit) {
            if ($menit === null || $menit <= 0) return null;
            return sprintf('%02d:%02d', floor($menit / 60), $menit % 60);
        };

        $decodeRules = function ($rules) {
            if (is_array($rules)) return $rules;
            return json_decode($rules ?? '[]', true) ?? [];
        };

        // dd($item->pegawai);

        $menitMasuk       = $toMenit($jamMasuk);
        $menitPulang      = $toMenit($jamPulang);
        $menitShiftMasuk  = $toMenit($shiftMasuk);
        $menitShiftPulang = $toMenit($shiftPulang);

        $telatRules = collect($decodeRules($row->pegawai->shift->telat ?? []))
            ->map(fn($r) => $toMenit($r))
            ->sort()
            ->values()
            ->toArray();

        $pulcetRules = collect($decodeRules($row->pegawai->shift->pulang_cepat ?? []))
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

        $tidakHadir = !$jamMasuk && !$jamPulang;

        if ($tidakHadir) {
            $totalPotongan = 100;
        } else if ($statusMasuk === 'mangkir' && $statusPulang === 'mangkir') {
            $totalPotongan = 100;
        } else if ($statusMasuk === 'mangkir' || $statusPulang === 'mangkir') {
            $totalPotongan = 50;
        } else if (!$jamMasuk || !$jamPulang) {
            $totalPotongan = 50;
        } else {
            $totalPotongan = max($potonganTelat, $potonganPulcet);
        }

        $upah            = $row->pegawai->jabatan->gaji ?? 0;
        $potonganNominal = ($totalPotongan / 100) * $upah;
        $upahBersih      = $upah - $potonganNominal;

        $batasTelatMenit = !empty($telatRules) ? $telatRules[0] : $menitShiftMasuk;
        $selisihTelat    = ($menitMasuk !== null && $batasTelatMenit !== null)
            ? max(0, $menitMasuk - $batasTelatMenit)
            : 0;

        return [
            "'" . ($row->pegawai->badgenumber ?? '-'),
            $row->pegawai->nama ?? '-',
            $row->pegawai->department->DeptName ?? '-',
            $row->pegawai->jabatan->nama ?? '-',
            optional(
                $row->pegawai
            )->shift ? "{$jadwal} - {$jamMasuk} s.d {$jamPulang}" : "-",
            Carbon::parse($row->tanggal)->format('d M Y'),
            $row->jam_masuk,
            $row->jam_pulang,
            '',
            '',
            $upahBersih,
            $potonganNominal,
            '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]]
        ];
    }

    // public function registerEvents(): array
    // {
    //     $password = EncryptFile::where('type', 'excel')
    //         ->where('is_active', true)
    //         ->whereNotNull('password')
    //         ->value('password');

    //         return [
    //             BeforeExport::class => function (BeforeExport $event) use ($password) {
    //                 $writer = $event->writer;
    //                 $spreadsheet = $writer->getDelegate();

    //                 $security = $spreadsheet->getSecurity();
    //                 $security->setLockWindows(true);
    //                 $security->setLockStructure(true);
    //                 $security->setWorkbookPassword($password);
    //             },
    //             AfterSheet::class => function (AfterSheet $event) use ($password) {
    //                 $sheet = $event->sheet;
    //                 $protection = $sheet->getProtection();
    //                 $protection->setShet(true);
    //                 $protection->setPassword($password);
    //             }
    //         ];
    // }

    private function hitungPotongan($data, $jumlah_hari)
    {
        $kehadiran = $data->kehadirans;
        $gaji = optional($data->jabatan)->gaji ?? 0;

        $toMenit = function ($jam) {
            if (!$jam) return null;
            [$h, $m] = explode(
                ':',
                substr($jam, 0, 5)
            );
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

            $statusMasuk  = $records->where('check_type', 0)->first()?->status_kerja;
            $statusPulang = $records->where('check_type', 1)->first()?->status_kerja;

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

            if (
                $jamMasukRaw && $jamPulangRaw
            ) {
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
