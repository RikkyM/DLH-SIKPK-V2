<?php

namespace App\Http\Controllers\Api\Kehadiran;

use App\Http\Controllers\Controller;
use App\Models\ChecktimeSikpk;
use App\Models\Kehadiran;
use App\Models\KehadiranDraft;
use App\Models\Pegawai;
use App\Services\KehadiranService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class KehadiranController extends Controller
{

    // private function hitungJamTelat(?string $jamMasuk, ?string $jamShift): string
    // {
    //     if (!$jamMasuk || !$jamShift) return '-';

    //     $masuk = Carbon::createFromTimeString($jamMasuk);
    //     $shift = Carbon::createFromTimeString($jamShift);

    //     if ($masuk->lessThanOrEqualTo($shift)) {
    //         return '-';
    //     }

    //     $diff = $shift->diff($masuk);

    //     return sprintf('%02d:%02d', $diff->h, $diff->i);
    // }

    // private function hitungJamPulangCepat(?string $jamPulang, ?string $jamShift): string
    // {
    //     if (!$jamPulang || !$jamShift) return '-';

    //     $pulang = Carbon::createFromTimeString($jamPulang);
    //     $shift = Carbon::createFromTimeString($jamShift);

    //     if ($pulang->greaterThanOrEqualTo($shift)) {
    //         return "-";
    //     }

    //     $diff = $pulang->diff($shift);

    //     return sprintf('%02d:%02d', $diff->h, $diff->i);
    // }

    private function diffMenit($jam1, $jam2)
    {
        if (!$jam1 || !$jam2) return 0;

        return Carbon::createFromFormat('H:i', $jam1)
            ->diffInMinutes(Carbon::createFromFormat('H:i', $jam2), false);
    }

    // private function hitungPotonganGaji(
    //     ?string $jamMasuk,
    //     ?string $jamPulang,
    //     $shift,
    //     float $gaji
    // ) {
    //     if (!$shift) return 0;

    //     $potongan = 0;
    //     $kenaTelat = 0;

    //     if ($jamMasuk && $shift->jam_masuk && !empty($shift->telat)) {

    //         $menitTelat = max(
    //             0,
    //             $this->diffMenit(substr($shift->jam_masuk, 0, 5), $jamMasuk)
    //         );

    //         $telatRules = collect($shift->telat)->count();

    //         if ($menitTelat > 0) {
    //             $kenaTelat = min(1, $telatRules);
    //         }

    //         $bobotTelat = 0.5 / $telatRules;
    //         $potongan += $gaji * ($kenaTelat * $bobotTelat);
    //     }

    //     if (
    //         $jamPulang &&
    //         !empty($shift->pulang_cepat) &&
    //         $shift->jam_keluar
    //     ) {
    //         $jamKeluarShift = substr($shift->jam_keluar, 0, 5);

    //         $pulangRules = collect($shift->pulang_cepat)
    //             ->map(fn($j) => substr($j, 0, 5))
    //             ->push($jamKeluarShift) //
    //             ->unique()
    //             ->sortDesc()
    //             ->values();

    //         $jumlahPulangRules = $pulangRules->count() - 1;

    //         $bobotPulang = 0.5 / $jumlahPulangRules;
    //         $kenaPulang = 0;

    //         foreach ($pulangRules as $jamRule) {
    //             if ($this->diffMenit($jamPulang, $jamRule) > 0) {
    //                 $kenaPulang++;
    //             } else {
    //                 break;
    //             }
    //         }

    //         $potongan += $gaji * ($kenaPulang * $bobotPulang);
    //     }
    //     return round($potongan, 0);
    // }

    protected KehadiranService $kehadiranService;

    public function __construct(KehadiranService $kehadiranService)
    {
        $this->kehadiranService = $kehadiranService;
    }
    public function index(Request $request)
    {
        try {
            $perPage    = $request->input('per_page', 50);
            $search     = $request->input('search');
            $department = $request->input('department', 12);
            $jabatan    = $request->input('jabatan');
            $shift      = $request->input('shift');
            $korlap     = $request->input('korlap');
            $potongan   = $request->input('potongan');

            $tanggal  = $request->input('tanggal');
            $fromDate = $request->input('from_date', Carbon::create(2025, 11, 21)->format('Y-m-d'));
            $toDate   = $request->input('to_date', Carbon::create(2025, 11, 25)->format('Y-m-d'));

            $checkRole = ['superadmin', 'admin', 'keuangan', 'viewer'];
            $canSeeAll = in_array(Auth::user()->role, $checkRole, true);

            $datas = Kehadiran::with('pegawai.department', 'pegawai.shift', 'pegawai.jabatan')
                ->kehadiranHarian()
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama');
                })
                ->when($tanggal, function ($data) use ($tanggal) {
                    $data->whereDate('check_time', $tanggal);
                })
                ->when($fromDate && $toDate, function ($data) use ($fromDate, $toDate) {
                    $data->whereBetween('check_time', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59']);
                })
                ->when(!$canSeeAll, function ($data) {
                    $data->whereHas('pegawai', fn($d) => $d->where('id_department', Auth::user()->id_department));
                })
                ->when(!empty($department) && $canSeeAll, function ($data) use ($department) {
                    $data->whereHas('pegawai', function ($d) use ($department) {
                        $d->where('id_department', $department);
                    });
                })
                ->when(!empty($jabatan), function ($data) use ($jabatan) {
                    $data->whereHas('pegawai', function ($d) use ($jabatan) {
                        $d->where('id_penugasan', $jabatan);
                    });
                })
                ->when(!empty($shift), function ($data) use ($shift) {
                    $data->whereHas('pegawai', function ($d) use ($shift) {
                        $d->where('id_shift', $shift);
                    });
                })
                ->when(!empty($korlap), function ($data) use ($korlap) {
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
                ->get();
            // ->paginate($perPage);

            $pegawaiIds = $datas->pluck('pegawai_id')->unique();
            $tanggalMin = $fromDate ?? $datas->min('tanggal');
            $tanggalMax = $toDate   ?? $datas->max('tanggal');

            // Load semua status_kerja sekaligus, group by pegawai_id + tanggal + check_type
            $allStatus = Kehadiran::whereIn('pegawai_id', $pegawaiIds)
                ->whereBetween('check_time', [$tanggalMin . ' 00:00:00', $tanggalMax . ' 23:59:59'])
                ->whereNotNull('status_kerja')
                ->get(['pegawai_id', 'check_time', 'check_type', 'status_kerja'])
                ->groupBy(fn($k) => $k->pegawai_id . '_' . \Carbon\Carbon::parse($k->check_time)->toDateString() . '_' . $k->check_type);

            $collection = $datas->map(function ($item) use ($potongan, $allStatus) {
                $jamMasuk = $item->jam_masuk;
                $jamPulang = $item->jam_pulang;

                $shiftMasuk  = $item->pegawai->shift->jam_masuk ?? null;
                $shiftPulang = $item->pegawai->shift->jam_keluar ?? null;

                $keyMasuk  = $item->pegawai_id . '_' . $item->tanggal . '_0';
                $keyPulang = $item->pegawai_id . '_' . $item->tanggal . '_1';

                $statusMasuk  = $allStatus->get($keyMasuk)?->first()?->status_kerja;
                $statusPulang = $allStatus->get($keyPulang)?->first()?->status_kerja;

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
                } else if ($statusMasuk === 'mangkir' && $statusPulang === 'mangkir') {
                    $totalPotongan = 100;
                } else if ($statusMasuk === 'mangkir' || $statusPulang === 'mangkir') {
                    $totalPotongan = 50;
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
                $item->status_masuk     = $statusMasuk;
                $item->status_pulang    = $statusPulang;

                return $item;
            });

            if (!empty($potongan)) {
                $collection = $collection->filter(function ($item) use ($potongan) {
                    if ($potongan === 'ada') {
                        return $item->potongan_nominal > 0;
                    }

                    if ($potongan === 'tidak ada') {
                        return $item->potongan_nominal === 0;
                    }

                    return true;
                })->values();

                // Replace collection-nya
                // $datas->setCollection($filtered->values());
            }

            $page = LengthAwarePaginator::resolveCurrentPage();
            $items = $collection->forPage($page, $perPage)->values();

            $datas = new LengthAwarePaginator(
                $items,
                $collection->count(), // total setelah filter
                $perPage,
                $page,
                [
                    'path' => request()->url(),
                    'query' => request()->query(),
                ]
            );

            return response()->json($datas);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kehadiran.',
            ]);
        }
    }

    public function checkType(Request $request)
    {
        try {
            $perPage    = $request->input('per_page', 50);
            $search     = $request->input('search');
            $department = $request->input('department');
            $jabatan    = $request->input('jabatan');
            $shift      = $request->input('shift');
            $korlap     = $request->input('korlap');

            $tanggal = $request->filled('tanggal')
                ? $request->input('tanggal')
                : now()->toDateString();

            $allAccessRoles = ['superadmin', 'admin', 'keuangan', 'viewer'];
            $canSeeAll = in_array(Auth::user()->role, $allAccessRoles, true);

            $datas = Kehadiran::with([
                'pegawai:id,old_id,id_department,id_penugasan,id_shift,id_korlap,badgenumber,nama',
                'pegawai.department',
                'pegawai.jabatan',
                'pegawai.shift'
            ])
                // ->select('id', 'old_id', 'pegawai_id', 'check_time', 'check_type')
                ->select([
                    'pegawai_id',
                    'check_type',
                    DB::raw("DATE(check_time) as tanggal"),
                    DB::raw("MIN(check_time) as check_time")
                ])
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama');
                })
                ->when(!$canSeeAll, function ($data) {
                    $data->whereHas('pegawai', function ($d) {
                        $d->where('id_department', Auth::user()->id_department);
                    });
                })
                ->when(!empty($department) && $canSeeAll, function ($data) use ($department) {
                    $data->whereHas('pegawai', function ($d) use ($department) {
                        $d->where('id_department', $department);
                    });
                })
                ->when($tanggal, function ($data) use ($tanggal) {
                    $data->whereDate('check_time', $tanggal);
                })
                ->when(!empty($jabatan), function ($data) use ($jabatan) {
                    $data->whereHas('pegawai', function ($d) use ($jabatan) {
                        $d->where('id_penugasan', $jabatan);
                    });
                })
                ->when(!empty($shift), function ($data) use ($shift) {
                    $data->whereHas('pegawai', function ($d) use ($shift) {
                        $d->where('id_shift', $shift);
                    });
                })
                ->when(!empty($korlap), function ($data) use ($korlap) {
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
                ->groupBy('pegawai_id', 'check_type', DB::raw("DATE(check_time)"))
                ->orderBy('check_time', 'desc');


            return response()->json($datas->paginate($perPage));
        } catch (\Exception $e) {
            report($e);
            dd($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kehadiran.',
            ]);
        }
    }

    public function rekapKehadiran(Request $request)
    {
        try {
            $perPage    = $request->input('per_page', 50);
            $search     = $request->input('search');
            $department = $request->input('department');
            $jabatan    = $request->input('jabatan');
            $shift      = $request->input('shift');
            $korlap     = $request->input('korlap');
            $tanggal    = $request->filled('tanggal')
                ? $request->input('tanggal')
                : now()->toDateString();

            $checkRole = ['superadmin', 'admin', 'keuangan', 'viewer'];
            $canSeeAll = in_array(Auth::user()->role, $checkRole, true);

            $datas = Pegawai::with([
                'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
                'kehadirans' => fn($q) => $q->whereDate('check_time', $tanggal),
                'shift',
                'jabatan'
            ])
                ->select('id', 'old_id', 'id_penugasan', 'id_shift', 'id_department', 'badgenumber', 'nama', 'jenis_kelamin', 'alamat', 'kecamatan', 'kelurahan', 'agama')
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama')
                        ->where('nama', 'not like', '%admin%');
                })
                // ->whereHas('kehadirans', fn($data) => $data->whereDate('check_time', $tanggal))
                ->when(
                    empty($department) || (int) $department !== 23,
                    function ($data) {
                        $data->where('id_department', '!=', 23);
                    }
                )
                ->when(!$canSeeAll, function ($data) {
                    $data->where('id_department', Auth::user()->id_department);
                })
                ->when(!empty($department) && $canSeeAll, function ($data) use ($department) {
                    $data->where('id_department', $department);
                })
                ->when(!empty($jabatan), function ($data) use ($jabatan) {
                    $data->where('id_penugasan', $jabatan);
                })
                ->when(!empty($shift), function ($data) use ($shift) {
                    $data->where('id_shift', $shift);
                })
                ->when(!empty($korlap), function ($data) use ($korlap) {
                    $data->where('id_korlap', $korlap);
                })
                ->when($search, function ($data) use ($search) {
                    $data->where(function ($d) use ($search) {
                        $d->where('nama', 'like', "%{$search}%")
                            ->orWhere('badgenumber', 'like', "%{$search}%");
                    });
                })
                ->orderBy('nama', 'asc');

            $datas = $datas->paginate($perPage);

            $datas->getCollection()->transform(function ($pegawai) {
                $kehadiran = $pegawai->kehadirans;

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

                $jamMasuk = $kehadiran
                    ->where('check_type', 0)
                    ->min('check_time');

                $jamPulang = $kehadiran
                    ->where('check_type', 1)
                    ->max('check_time');

                $shiftMasuk = $pegawai->shift->jam_masuk ?? null;
                $shiftPulang = $pegawai->shift->jam_keluar ?? null;

                $menitMasuk         = $toMenit($formatJam($jamMasuk));
                $menitPulang        = $toMenit($formatJam($jamPulang));
                $menitShiftMasuk    = $toMenit($shiftMasuk);
                $menitShiftPulang   = $toMenit($shiftPulang);

                $telatRules = collect($decodeRules($pegawai->shift->telat ?? []))
                    ->map(fn($r) => $toMenit($r))
                    ->sort()
                    ->values()
                    ->toArray();

                $pulcetRules = collect($decodeRules($pegawai->shift->pulang_cepat ?? []))
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

                // $gaji = optional($pegawai->jabatan)->gaji ?? 0;
                $upah            = $pegawai->jabatan->gaji ?? 0;
                $potonganNominal = ($totalPotongan / 100) * $upah;
                $upahBersih      = $upah - $potonganNominal;

                $batasTelatMenit = !empty($telatRules) ? $telatRules[0] : $menitShiftMasuk;
                $selisihTelat = ($menitMasuk !== null && $batasTelatMenit !== null)
                    ? max(0, $menitMasuk - $batasTelatMenit)
                    : 0;

                $makeJam = function ($menit) {
                    if ($menit === null || $menit <= 0) return null;
                    return sprintf('%02d:%02d', floor($menit / 60), $menit % 60);
                };

                // $jamTelat = $this->kehadiranService->hitungJamTelat(
                //     $formatJam($jamMasuk),
                //     optional($pegawai->shift)->jam_masuk
                // );

                // $pulangCepat = $this->kehadiranService->hitungJamPulangCepat(
                //     $formatJam($jamPulang),
                //     optional($pegawai->shift)->jam_keluar
                // );

                // $potongan = $this->kehadiranService->hitungPotonganGaji(
                //     $pegawai->jam_masuk !== "-" ? $pegawai->jam_masuk : null,
                //     $pegawai->jam_pulang !== "-" ? $pegawai->jam_pulang : null,
                //     $pegawai->shift,
                //     $gaji,
                // );


                $pegawai->jam_masuk = $jamMasuk ? $formatJam($jamMasuk) : "-";
                $pegawai->jam_pulang = $jamPulang ? $formatJam($jamPulang) : "-";
                $pegawai->jam_telat = $makeJam($selisihTelat);
                $pegawai->pulang_cepat = $makeJam($pulangCepat);
                $pegawai->potongan = $potonganNominal;

                return $pegawai;
            });

            return response()->json($datas);
        } catch (\Exception $e) {
            report($e);
            dd($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data rekap kehadiran.',
            ]);
        }
    }

    public function rekapTanggalHadir(Request $request)
    {
        try {
            $perPage    = $request->input('per_page', 50);
            $search     = $request->input('search');
            $department = $request->input('department');
            $jabatan    = $request->input('jabatan');
            $shift      = $request->input('shift');
            $korlap      = $request->input('korlap');

            $fromDate   = $request->query('from_date');
            $toDate     = $request->query('to_date');

            $jumlah_hari = 0;

            if (!$fromDate && !$toDate) {
                $to     = Carbon::today()->endOfDay();
                $from   = (clone $to)->subDays(6)->startOfDay();
                $jumlah_hari = 7;
            } else {
                if ($fromDate && $toDate) {
                    $from = Carbon::parse($fromDate);
                    $to   = Carbon::parse($toDate);

                    $jumlah_hari = Carbon::parse($fromDate)->diffInDays(Carbon::parse($toDate)) + 1;
                } elseif ($fromDate && !$toDate) {
                    $from = Carbon::parse($fromDate);
                    $to   = (clone $from);
                    $jumlah_hari = 1;
                } elseif (!$fromDate && $toDate) {
                    $to   = Carbon::parse($toDate);
                    $from = (clone $to);
                    $jumlah_hari = 1;
                }
            }

            $diffDays = $from->diffInDays($to);
            if ($diffDays > 30) {
                return response()->json([
                    'success' => false,
                    'message' => 'Rentang tanggal maksimal 30 hari.',
                ], 422);
            }

            $canSeeAll = in_array(Auth::user()->role, ['superadmin', 'admin', 'keuangan', 'viewer'], true);

            $datas = Pegawai::with([
                'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
                'kehadirans' => fn($q) => $q
                    ->whereBetween('check_time', [
                        $from->copy()->startOfDay(),
                        $to->copy()->endOfDay()
                    ])
                    ->orderBy('check_time'),
                'shift',
                'jabatan'
            ])
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama')
                        ->where('nama', 'not like', '%admin%');
                })
                ->when(
                    empty($department) || (int) $department !== 23,
                    function ($data) {
                        $data->where('id_department', '!=', 23);
                    }
                )
                ->when(!$canSeeAll, fn($data) => $data->where('id_department', Auth::user()->id_department))
                ->when(!empty($department) && $canSeeAll, function ($data) use ($department) {
                    $data->where('id_department', $department);
                })
                ->when(!empty($jabatan), function ($data) use ($jabatan) {
                    $data->where('id_penugasan', $jabatan);
                })
                ->when(!empty($shift), function ($data) use ($shift) {
                    $data->where('id_shift', $shift);
                })
                ->when(!empty($korlap), function ($data) use ($korlap) {
                    $data->where('id_korlap', $korlap);
                })
                ->when($search, function ($data) use ($search) {
                    $data->where(function ($d) use ($search) {
                        $d->where('nama', 'like', "%{$search}%")
                            ->orWhere('badgenumber', 'like', "%{$search}%");
                    });
                })
                ->orderBy('nama', 'asc');

            $result = $datas->paginate($perPage);

            $result->getCollection()->transform(function ($pegawai) use ($fromDate, $toDate, $from, $to, $diffDays) {
                // $totalKehadiran = $pegawai->kehadirans
                //     ->groupBy(function ($item) {
                //         $tanggal = Carbon::parse($item->check_time)->toDateString();
                //         return $tanggal . "_" . $item->check_type;
                //     })
                //     ->count();

                // $pegawai->jumlah_hadir = $totalKehadiran / 2;
                $hitung = $this->hitungPotongan($pegawai, $diffDays);

                $pegawai->jumlah_hadir = $hitung['jumlah_masuk'];

                return $pegawai;
            });

            $data = $result->toArray();

            $data['jumlah_hari'] = $jumlah_hari;
            $data['from_date'] = $from->toDateString();
            $data['to_date'] = $to->toDateString();

            return response()->json(
                $data,
                //     [
                //     'jumlah_hari' => $jumlah_hari,
                //     'from_date'   => $from->toDateString(),
                //     'to_date'     => $to->toDateString()
                // ]
            );
        } catch (\Exception $e) {
            report($e);
            // dd($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data rekap tanggal hadir',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function dataKehadiran(Request $request)
    {
        $search     = $request->input('search');
        $perPage    = $request->input('per_page', 50);
        $fromDate   = $request->input('from_date');
        $toDate     = $request->input('to_date');
        $department = $request->input('department');
        $jabatan    = $request->input('jabatan');
        $shift      = $request->input('shift');
        $korlap     = $request->input('korlap');
        $type       = $request->input('type');

        try {

            $kehadiran = KehadiranDraft::with([
                'pegawai:id,old_id,id_department,id_penugasan,id_shift,id_korlap,badgenumber,nama',
                'pegawai.department',
                'pegawai.jabatan',
                'pegawai.shift'
            ])
                ->select('id', 'old_id', 'pegawai_id', 'check_time', 'check_type', 'bukti_dukung', 'keterangan', 'status', 'status_kerja', 'created_at')
                ->when(Auth::user()->role === 'operator', function ($data) {
                    $data->whereHas('pegawai', function ($d) {
                        $d->where('id_department', Auth::user()->id_department);
                    });
                })
                ->when($fromDate && $toDate, function ($query) use ($fromDate, $toDate) {
                    $query->whereBetween('check_time', [
                        $fromDate . ' 00:00:00',
                        $toDate   . ' 23:59:59'
                    ]);
                })
                ->when($search, function ($data) use ($search) {
                    $data->where(function ($q) use ($search) {
                        $q->whereLike('nik', "%{$search}%")
                            ->orWhereLike('nama', "%{$search}%");
                    });
                })
                ->when(empty($department) || (int) $department !== 23, function ($data) {
                    $data->whereHas('pegawai', function ($d) {
                        $d->where('id_department', '!=', 23);
                    });
                })
                ->when(!empty($department), function ($data) use ($department) {
                    $data->whereHas('pegawai', function ($d) use ($department) {
                        $d->where('id_department', $department);
                    });
                })
                ->when(!empty($shift), function ($data) use ($shift) {
                    $data->whereHas('pegawai', function ($d) use ($shift) {
                        $d->where('id_shift', $shift);
                    });
                })
                ->when(!empty($korlap), function ($data) use ($korlap) {
                    $data->whereHas('pegawai', function ($d) use ($korlap) {
                        $d->where('id_korlap', $korlap);
                    });
                })
                ->when(!empty($jabatan), function ($data) use ($jabatan) {
                    $data->whereHas('pegawai', function ($d) use ($jabatan) {
                        $d->where('id_penugasan', $jabatan);
                    });
                })
                ->when($type === 'tambah', function ($data) {
                    $data->whereNotNull('bukti_dukung')
                        ->where(function ($q) {
                            $q->whereNull('tipe')
                                ->orWhere('tipe', 'tambah');
                        });
                    // $data->whereNotNull('bukti_dukung');
                })
                ->when($type === 'update', function ($data) {
                    $data->where(function ($q) {
                        $q->where('tipe', 'update')
                            ->whereNotNull('bukti_dukung');
                        // ->orWhere('tipe', null);
                    })
                        ->orWhere(function ($q) {
                            $q->whereNull('tipe')
                                ->whereNull('bukti_dukung');
                            // ->whereNotNull('bukti_dukung');
                            // $q->whereNotNull('bukti_dukung')
                            //     ->orWhereNull('bukti_dukung');
                        });
                    // $data->whereNull('bukti_dukung');
                })
                ->orderBy('created_at', 'desc');

            return response()->json($kehadiran->paginate($perPage));
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'status' => false,
                'message' => 'Gagal mengambil data kehadiran.',
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'pegawai_id'   => 'required|integer|exists:pegawai,old_id',
            'check_type'   => 'required|in:0,1',
            'tanggal'      => 'required|date',
            'jam'          => 'required|date_format:H:i',
            'keterangan'   => 'nullable|string',
            'bukti_dukung' => 'required|image|mimes:jpg,jpeg,png,webp|max:1024',
        ], [
            '*.required' => ":attribute perlu diisi."
        ], [
            'bukti_dukung' => 'Bukti Dukung'
        ]);

        $checkTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            $payload['tanggal'] . ' ' . $payload['jam']
        );

        try {
            $pegawai = Pegawai::with('department', 'jabatan', 'shift')->where('old_id', $payload['pegawai_id'])->first();
            $exists = Kehadiran::where('pegawai_id', $payload['pegawai_id'])
                ->whereDate('check_time', $checkTime->toDateString())
                ->where('check_type', $payload['check_type'])
                ->exists();

            $existsDraft = KehadiranDraft::where('pegawai_id', $payload['pegawai_id'])
                ->whereDate('check_time', $checkTime->toDateString())
                ->where('check_type', $payload['check_type'])
                ->exists();

            if ($exists || $existsDraft) {
                throw ValidationException::withMessages([
                    'pegawai_id' => 'Data kehadiran dengan tanggal dan tipe ini sudah ada.'
                ]);
            }

            $path = $payload['bukti_dukung']
                ->store('kehadiran/bukti_dukung', 'local');

            KehadiranDraft::create([
                'pegawai_id'      => $pegawai->old_id,
                'nik'             => $pegawai->badgenumber,
                'nama'            => $pegawai->nama,
                'check_time'      => $checkTime,
                'check_type'      => $payload['check_type'],
                'nama_department' => $pegawai->department->DeptName,
                'jabatan'         => $pegawai->jabatan->nama ?? null,
                'shift_kerja'     => $pegawai->shift->jadwal ?? null,
                'keterangan'      => $payload['keterangan'] ?? null,
                'bukti_dukung'    => $path,
                'status'          => 'pending',
                'status_kerja'    => 'sesuai waktu',
                'tipe'            => 'tambah'
            ]);

            return response()->json([
                'message' => 'Data kehadiran berhasil disimpan.',
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Terjadi kesalahan pada server.'
            ], 500);
        }
    }

    public function updateKehadiran(Request $request)
    {
        $payload = $request->validate([
            'pegawai_id'    => 'required|integer|exists:pegawai,old_id',
            'check_type'    => 'required|in:0,1',
            'check_time'    => 'nullable|date_format:H:i',
            'tanggal'       => 'required|date',
            'jam'           => 'required|date_format:H:i',
            'keterangan'    => 'nullable|string',
            'status_kerja'  => 'required|in:mangkir,sesuai waktu',
            'bukti_dukung'  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:1024',
        ], [
            '*.required'    => ':attribute perlu diisi.'
        ], [
            'pegawai_id'    => 'Petugas',
            'check_type'    => 'Tipe Kehadiran',
            'tanggal'       => 'Tanggal',
            'jam'           => 'Jam',
            'bukti_dukung'  => 'Bukti Dukung'
        ]);

        $checkTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            $payload['tanggal'] . ' ' . $payload['jam']
        );

        DB::beginTransaction();
        try {
            $pegawai = Pegawai::with('department', 'jabatan', 'shift')->where('old_id', $payload['pegawai_id'])->first();
            $kehadiran  = Kehadiran::where('pegawai_id', $payload['pegawai_id'])
                ->whereDate('check_time', $checkTime->toDateString())
                ->where('check_type', $payload['check_type'])
                ->first();

            $draft = KehadiranDraft::where('pegawai_id', $payload['pegawai_id'])
                ->whereDate('check_time', $checkTime->toDateString())
                ->where('check_type', $payload['check_type'])
                ->first();

            if (!$kehadiran && !$draft) {
                throw ValidationException::withMessages([
                    'pegawai_id' => 'Data kehadiran tidak ditemukan.'
                ]);
            }

            if ($draft && $draft->status === 'pending') {
                throw ValidationException::withMessages([
                    'pegawai_id' => 'Data kehadiran sedang menunggu validasi admin.'
                ]);
            }

            $path = null;
            if ($request->hasFile('bukti_dukung')) {
                $path = $payload['bukti_dukung']
                    ->store('kehadiran/bukti_dukung', 'local');
            }

            KehadiranDraft::create([
                'pegawai_id'        => $pegawai->old_id,
                'nik'               => $pegawai->badgenumber,
                'nama'              => $pegawai->nama,
                'check_time'        => $checkTime,
                'check_type'        => $payload['check_type'],
                'nama_department'   => $pegawai->department->DeptName,
                'jabatan'           => $pegawai->jabatan->nama ?? null,
                'shift_kerja'       => $pegawai->shift->jadwal ?? null,
                'keterangan'        => $payload['keterangan'] ?? null,
                'bukti_dukung'      => $path ?? null,
                'status'            => 'pending',
                'status_kerja'      => $payload['status_kerja'],
                'tipe'              => 'update'
            ]);

            DB::commit();

            return response()->json([
                'message'   => 'Perubahan diajukan dan menunggu validasi admin.'
            ], 201);
        } catch (ValidationException $e) {
            DB::rollBack();
            report($e);
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);
            return response()->json([
                'message' => 'Terjadi kesalahan pada server.',
                'e'       => $e->getMessage()
            ], 500);
        }
    }

    public function patch(Request $request, $id)
    {
        $data = KehadiranDraft::with('pegawai')->findOrFail($id);

        $payload = $request->validate([
            'status'       => 'required|in:approve,reject'
        ]);

        DB::beginTransaction();

        try {
            if ($payload['status'] === 'reject') {
                $data->update(['status' => 'reject']);

                DB::commit();

                return response()->json([
                    'message' => 'Data kehadiran ditolak.',
                ], 200);
            }

            $checkTime = Carbon::parse($data->check_time)->toDateString();

            $kehadiran = Kehadiran::where('pegawai_id', $data->pegawai_id)
                ->whereDate('check_time', $checkTime)
                ->where('check_type', $data->check_type)
                ->first();

            if ($data->tipe === 'update' || ($data->tipe === null && $data->bukti_dukung === null)) {
                if (!$kehadiran) {
                    throw ValidationException::withMessages([
                        'kehadiran' => 'Data kehadiran tidak ditemukan.'
                    ]);
                }

                $data->update(['status' => 'approve']);

                $history = $kehadiran->history;

                $history[] = [
                    'check_time'        => $kehadiran->check_time,
                    'status_kerja'      => $kehadiran->status_kerja,
                    'nama_department'   => $kehadiran->nama_department,
                    'updated_at'        => now()->toDateString()
                ];

                $kehadiran->update([
                    'check_time'    => $data->check_time,
                    'status_kerja'  => $data->status_kerja,
                    'history'       => $history
                ]);

                DB::commit();

                return response()->json([
                    'message' => "Data kehadiran berhasil diperbarui."
                ], 200);
            }

            $exists = Kehadiran::where('pegawai_id', $data->pegawai_id)
                ->whereDate('check_time', $checkTime)
                ->where('check_type', $data->check_type)
                ->exists();

            $existsDraft = KehadiranDraft::where('pegawai_id', $data->pegawai_id)
                ->whereDate('check_time', $checkTime)
                ->where('id', "!==", $data->id)
                ->where('check_type', $data->check_type)
                ->whereIn('status', ['approve', 'pending'])
                ->exists();

            if ($exists || $existsDraft) {
                throw ValidationException::withMessages([
                    'status' => 'Data kehadiran dengan tanggal dan tipe ini sudah ada.'
                ]);
            }

            Kehadiran::create([
                'old_id'          => $data->old_id,
                'pegawai_id'      => $data->pegawai_id,
                'nik'             => $data->pegawai->badgenumber,
                'nama'            => $data->nama,
                'check_time'      => $data->check_time,
                'check_type'      => $data->check_type,
                'nama_department' => $data->nama_department,
                'jabatan'         => $data->jabatan ?? null,
                'shift_kerja'     => $data->shift_kerja ?? null,
                'keterangan'      => $data->keterangan ?? null,
                'bukti_dukung'    => $data->bukti_dukung,
            ]);

            $data->update(['status' => 'approve']);

            DB::commit();

            return response()->json([
                'message' => 'Data kehadiran berhasil update.',
            ], 200);
        } catch (ValidationException $e) {
            DB::rollback();
            throw $e;
        } catch (\Throwable $e) {
            DB::rollback();
            report($e);

            return response()->json([
                'message' => 'Terjadi kesalahan pada server.',
                'e' => $e->getMessage()
            ], 500);
        }
    }

    private function hitungPotongan($data, $jumlah_hari)
    {
        $kehadiran = $data->kehadirans;
        $gaji = optional($data->jabatan)->gaji ?? 0;

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
                        $potonganTelat = (($index + 1) / $total) * 50;
                    }
                }
            }

            $potonganPulcet = 0;
            if ($menitPulang !== null && $menitShiftPulang !== null && !empty($pulcetRules)) {
                if ($menitPulang < $menitShiftPulang) {
                    $total = count($pulcetRules);
                    foreach ($pulcetRules as $index => $batas) {
                        if ($menitPulang < $batas) {
                            $potonganPulcet = (($total - $index) / $total) * 50;
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

            if ($tidakHadir) {
                $persen = 100;
            } else if ($statusMasuk === 'mangkir' && $statusPulang === 'mangkir') {
                $persen = 100;
            } else if ($statusMasuk === 'mangkir' || $statusPulang === 'mangkir') {
                $persen = 50;
            } else if (!$jamMasukRaw || !$jamPulangRaw) {
                $persen = 50;
            } else {
                $persen = max($potonganTelat, $potonganPulcet);
            }

            $totalPotonganNominal += ($persen / 100) * $gaji;

            if ($jamMasukRaw && $jamPulangRaw) {
                $jumlahMasuk++;
            } else if ($jamMasukRaw || $jamPulangRaw) {
                $jumlahMasuk += 0.5;
            }
        }

        $hariTanpaRecord = $jumlah_hari - $perTanggal->count();
        $totalPotonganNominal += $hariTanpaRecord * $gaji;

        $totalUpahPeriode = $gaji * $jumlah_hari;
        $upahBersih       = max(0, $totalUpahPeriode - $totalPotonganNominal);

        return [
            'gaji'              => $gaji,
            'jumlah_masuk'      => $jumlahMasuk,
            'potongan'          => round($totalPotonganNominal, 0),
            'upah_kotor'        => round($gaji * $jumlah_hari, 0),
            'upah_bersih'       => round($upahBersih, 0),
        ];
    }
}
