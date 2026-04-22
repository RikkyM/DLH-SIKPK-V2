<?php

namespace App\Http\Controllers\Api\Rekapitulasi;

use App\Http\Controllers\Controller;
use App\Models\Departments;
use App\Models\Kehadiran;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UpahController extends Controller
{

    private function hitungPotonganPegawai($pegawai, int $jumlah_hari): array
    {
        $kehadiran = $pegawai->kehadirans;
        $gaji      = optional($pegawai->jabatan)->gaji ?? 0;

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

        $telatRules = collect($decodeRules($pegawai->shift->telat ?? []))
            ->map(fn($r) => $toMenit($r))
            ->sort()->values()->toArray();

        $pulcetRules = collect($decodeRules($pegawai->shift->pulang_cepat ?? []))
            ->map(fn($r) => $toMenit($r))
            ->sort()->values()->toArray();

        $menitShiftMasuk  = $toMenit($pegawai->shift->jam_masuk ?? null);
        $menitShiftPulang = $toMenit($pegawai->shift->jam_keluar ?? null);

        $perTanggal = $kehadiran->groupBy(function ($item) {
            return Carbon::parse($item->check_time)->toDateString();
        });

        $totalPotonganNominal = 0;
        $jumlahMasuk          = 0;
        $totalPotonganPersen  = 0;

        foreach ($perTanggal as $records) {
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

            // $statusKerjaList = $records->pluck('status_kerja')->filter();
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
            $totalPotonganPersen  += $persen;

            if ($jamMasukRaw && $jamPulangRaw) {
                $jumlahMasuk++;
            } elseif ($jamMasukRaw || $jamPulangRaw) {
                $jumlahMasuk += 0.5;
            }
        }

        $hariTanpaRecord      = $jumlah_hari - $perTanggal->count();
        $totalPotonganNominal += $hariTanpaRecord * $gaji;

        $totalUpahPeriode = $gaji * $jumlah_hari;
        $upahBersih       = max(0, $totalUpahPeriode - $totalPotonganNominal);

        return [
            'gaji'              => $gaji,
            'total_upah_periode' => $totalUpahPeriode,
            'jumlah_masuk'      => $jumlahMasuk,
            'potongan'          => round($totalPotonganNominal, 0),
            'upah_bersih'       => round($upahBersih, 0),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $fromDate = $request->get('from_date');
        $toDate   = $request->get('to_date');

        if (!$fromDate && !$toDate) {
            $toDate = Carbon::today()->toDateString();
            $fromDate = Carbon::today()->subDays(6)->toDateString();
        }

        $jumlah_hari = Carbon::parse($fromDate)->diffInDays(Carbon::parse($toDate)) + 1;

        return Departments::with([
            'pegawai.jabatan',
            'pegawai.shift',
            'pegawai.kehadirans' => fn($q) => $q
                ->whereBetween('check_time', [
                    $fromDate . ' 00:00:00',
                    $toDate   . ' 23:59:59',
                ]),
        ])
            ->where('DeptName', '!=', 'Our Company')
            ->when(
                Auth::user()->role === 'operator',
                fn($q) => $q->where('DeptID', Auth::user()->id_department)
            )
            ->get()
            ->map(function ($dept) use ($jumlah_hari) {

                // Filter pegawai valid
                $pegawaiValid = $dept->pegawai->filter(function ($p) {
                    return $p->nama !== null
                        && $p->nama !== ''
                        && stripos($p->nama, 'admin') === false
                        && $p->id_department != 23
                        && $p->jabatan !== null;
                });

                // Hitung potongan per pegawai menggunakan logika yang sudah diperbaiki
                $gajiPerPegawai = $pegawaiValid->map(function ($p) use ($jumlah_hari) {
                    $hasil = $this->hitungPotonganPegawai($p, $jumlah_hari);
                    return array_merge(['pegawai' => $p], $hasil);
                });

                // Kelompokkan per jabatan untuk detail
                $gajiPerJabatan = $gajiPerPegawai
                    ->groupBy(fn($item) => $item['pegawai']->jabatan->nama ?? 'Tidak Diketahui')
                    ->map(function ($items, $jabatan) use ($jumlah_hari) {
                        $jumlahOrang  = $items->count();
                        $gajiPerOrang = optional($items->first()['pegawai']->jabatan)->gaji ?? 0;

                        return [
                            'nama_jabatan'        => $jabatan,
                            'jumlah'              => $jumlahOrang,
                            'upah_kerja'          => $jumlahOrang * $gajiPerOrang * $jumlah_hari,
                            'jumlah_hari_kerja'   => round($jumlah_hari, 0),
                            'total_upah_dibayar'  => $items->sum('upah_bersih'),
                            'total_potongan_upah' => $items->sum('potongan'),
                        ];
                    })
                    ->values();

                // Total upah kerja = jumlah (gaji * jumlah_hari) semua pegawai
                $totalUpahKerja      = $gajiPerPegawai->sum('total_upah_periode');
                $totalUpahDibayar    = $gajiPerPegawai->sum('upah_bersih');
                $totalPotonganDibayar = $gajiPerPegawai->sum('potongan');

                return [
                    'DeptID'              => $dept->DeptID,
                    'DeptName'            => $dept->DeptName,
                    'total_pegawai'       => $pegawaiValid->count(),
                    'upah_kerja'          => $totalUpahKerja,
                    'jumlah_hari_kerja'   => round($jumlah_hari, 0),
                    'jabatan'             => $gajiPerJabatan,
                    'total_upah_dibayar'  => $totalUpahDibayar,
                    'total_potongan_upah' => $totalPotonganDibayar,
                ];
            })
            ->filter(fn($dept) => $dept['upah_kerja'] > 0)
            ->values();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
