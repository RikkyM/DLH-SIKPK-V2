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
    private function hitungGaji($collection)
    {
        return $collection->map(function ($item) {

            $jamMasuk  = $item->jam_masuk;
            $jamPulang = $item->jam_pulang;

            $shiftMasuk  = $item->pegawai->shift->jam_masuk ?? null;
            $shiftPulang = $item->pegawai->shift->jam_keluar ?? null;

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

            $menitMasuk       = $toMenit($jamMasuk);
            $menitPulang      = $toMenit($jamPulang);
            $menitShiftMasuk  = $toMenit($shiftMasuk);
            $menitShiftPulang = $toMenit($shiftPulang);

            $telatRules = collect($decodeRules($item->pegawai->shift->telat ?? []))
                ->map(fn($r) => $toMenit($r))
                ->sort()
                ->values()
                ->toArray();

            $pulcetRules = collect($decodeRules($item->pegawai->shift->pulang_cepat ?? []))
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
            } else if (!$jamMasuk || !$jamPulang) {
                $totalPotongan = 50;
            } else {
                $totalPotongan = max($potonganTelat, $potonganPulcet);
            }

            $upah            = $item->pegawai->jabatan->gaji ?? 0;
            $potonganNominal = ($totalPotongan / 100) * $upah;
            $upahBersih      = $upah - $potonganNominal;

            $batasTelatMenit = !empty($telatRules) ? $telatRules[0] : $menitShiftMasuk;
            $selisihTelat    = ($menitMasuk !== null && $batasTelatMenit !== null)
                ? max(0, $menitMasuk - $batasTelatMenit)
                : 0;

            $item->jam_telat        = $formatJam($selisihTelat);
            $item->jam_pulang_cepat = $formatJam($pulangCepat);
            $item->potongan_persen  = $totalPotongan;
            $item->potongan_nominal = $potonganNominal;
            $item->upah_bersih      = $upahBersih;

            return $item;
        });
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $fromDate = $request->get('from_date');
        $toDate   = $request->get('to_date');

        $hari = Carbon::parse($fromDate)->diffInDays(Carbon::parse($toDate)) + 1;

        return Departments::with([
            'pegawai.jabatan',
            'pegawai.kehadirans' => fn($q) => $q
                ->kehadiranHarian()
                ->whereBetween('check_time', [
                    $fromDate . ' 00:00:00',
                    $toDate . ' 23:59:59'
                ]),
            // 'pegawai.kehadirans.pegawai'
        ])
            ->where('DeptName', '!=', 'Our Company')
            ->when(Auth::user()->role === 'operator', fn($q) => $q->where('DeptID', Auth::user()->id_department))
            ->get()
            ->map(function ($q) use ($hari) {

                $pegawai = $q->pegawai
                    ->filter(function ($p) {
                        return $p->nama !== null &&
                            $p->nama !== '' &&
                            stripos($p->nama, 'admin') === false &&
                            $p->id_department != 23 &&
                            $p->jabatan !== null;
                    });

                // $kehadiran = (clone $pegawai)->kehadirans->groupBy(function ($q) {
                //     $tanggal = Carbon::parse($q->check_time)->toDateString();
                //     return $tanggal . '_' . $q->check_type;
                // })->count();
                $kehadiran = (clone $pegawai)->flatMap->kehadirans;

                $gajiData = $this->hitungGaji($kehadiran);

                $groupDept = (clone $pegawai)
                    ->groupBy(fn($p) => $p->jabatan->nama)
                    ->map(function ($items, $jabatan) use ($hari) {
                        $jumlah = $items->count();
                        $gajiPerOrang = $items->first()->jabatan->gaji ?? 0;
                        return [
                            'nama_jabatan'          => $jabatan,
                            'jumlah'                => $jumlah,
                            'upah_kerja'            => $jumlah * $gajiPerOrang,
                            'jumlah_hari_kerja'     => $hari,
                            'total_upah_dibayar'    => '',
                            'total_potongan_upah'   => ''
                        ];
                    })->values();

                // return $p;

                return [
                    'DeptID'            => $q->DeptID,
                    'DeptName'          => $q->DeptName,
                    'total_pegawai'     => $pegawai->count(),
                    'upah_kerja'        => $pegawai->sum(fn($p) => $p->jabatan->gaji),
                    'jumlah_hari_kerja' => round($hari, 0),
                    'jabatan'           => $groupDept,
                    'total_upah_dibayar'    => $gajiData->sum('upah_bersih'),
                    'total_potongan_upah'   => $gajiData->sum('potongan_nominal'),
                ];
            })
            ->filter(fn($q) => $q['upah_kerja'] > 0)->values();
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
