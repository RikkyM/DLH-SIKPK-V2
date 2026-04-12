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
            $korlap      = $request->input('korlap');

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
                ->paginate($perPage);

            // dd($datas->toArray());

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
                ->select('id', 'old_id', 'pegawai_id', 'check_time', 'check_type')
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

                $formatJam = function ($jam) {
                    return $jam ? substr($jam, 11, 5) : null;
                };

                $jamMasuk = $kehadiran
                    ->where('check_type', 0)
                    ->min('check_time');

                $jamPulang = $kehadiran
                    ->where('check_type', 1)
                    ->max('check_time');

                $jamTelat = $this->kehadiranService->hitungJamTelat(
                    $formatJam($jamMasuk),
                    optional($pegawai->shift)->jam_masuk
                );

                $pulangCepat = $this->kehadiranService->hitungJamPulangCepat(
                    $formatJam($jamPulang),
                    optional($pegawai->shift)->jam_keluar
                );

                // dd($pegawai->jabatan->gaji);
                $gaji = optional($pegawai->jabatan)->gaji ?? 0;

                $pegawai->jam_masuk = $jamMasuk ? $formatJam($jamMasuk) : "-";
                $pegawai->jam_pulang = $jamPulang ? $formatJam($jamPulang) : "-";
                $pegawai->jam_telat = $jamTelat;
                $pegawai->pulang_cepat = $pulangCepat;

                $potongan = $this->kehadiranService->hitungPotonganGaji(
                    $pegawai->jam_masuk !== "-" ? $pegawai->jam_masuk : null,
                    $pegawai->jam_pulang !== "-" ? $pegawai->jam_pulang : null,
                    $pegawai->shift,
                    $gaji,
                );

                $pegawai->potongan = round($potongan, 0);

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

            $result->getCollection()->transform(function ($pegawai) use ($fromDate, $toDate, $from, $to) {
                $totalKehadiran = $pegawai->kehadirans
                    // ->groupBy(fn($k) => Carbon::parse($k->check_time)->toDateString())
                    ->count();

                $pegawai->jumlah_hadir = $totalKehadiran / 2;

                // $jumlahHadir = intdiv($totalKehadiran, 2);
                // $jumlahHadir = $totalKehadiran / 2;
                // if (!$fromDate && !$toDate) {
                //     $to     = Carbon::today()->endOfDay();
                //     $from   = (clone $to)->subDays(6)->startOfDay();
                //     $jumlahHadir = 7;
                // } else {
                //     if ($fromDate && $toDate) {
                //         $from = Carbon::parse($fromDate);
                //         $to   = Carbon::parse($toDate);

                //         $jumlah_hari = Carbon::parse($fromDate)->diffInDays(Carbon::parse($toDate)) + 1;
                //     } elseif ($fromDate && !$toDate) {
                //         $from = Carbon::parse($fromDate);
                //         $to   = (clone $from);
                //         $jumlah_hari = 1;
                //     } elseif (!$fromDate && $toDate) {
                //         $to   = Carbon::parse($toDate);
                //         $from = (clone $to);
                //         $jumlah_hari = 1;
                //     }
                // }

                // $pegawai->jumlah_hadir = $jumlahHadir;

                return $pegawai;
            });

            // $result->appends([
            //     'from_date'     => $from->toDateString(),
            //     'to_date'       => $to->toDateString(),
            // ]);

            // return response()->json($result);
            // $custom = collect([
            //     'jumlah_hari' => $jumlah_hari,
            //     'from_date'   => $from->toDateString(),
            //     'to_date'     => $to->toDateString()
            // ]);

            // $data = $custom->merge($result);

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
        $search = $request->input('search');
        $perPage = $request->input('per_page', 50);
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $department = $request->input('department');
        $jabatan    = $request->input('jabatan');
        $shift    = $request->input('shift');
        $korlap    = $request->input('korlap');

        try {
            // $kehadiran = Kehadiran::with([
            //     'pegawai:id,old_id,id_department,id_penugasan,id_shift,id_korlap,badgenumber,nama',
            //     'pegawai.department',
            //     'pegawai.jabatan',
            //     'pegawai.shift'
            // ])
            //     ->select('id', 'old_id', 'pegawai_id', 'check_time', 'check_type')
            //     ->where(function ($data) {
            //         $data->where('nama', '!=', '')
            //             ->whereNotNull('nama')
            //             ->where('nama', 'not like', '%admin%')
            //             ->where('nama', 'not like', '%adm');
            //         // ->where('id_department', '!=', 23);
            //     })
            //     ->whereNotNull('created_at')
            //     ->when(Auth::user()->role === 'operator', function ($data) {
            //         $data->whereHas('pegawai', function ($d) {
            //             $d->where('id_department', Auth::user()->id_department);
            //         });
            //     })
            //     ->when($search, function ($data) use ($search) {
            //         $data->where(function ($q) use ($search) {
            //             $q->whereLike('nik', "%{$search}%")
            //                 ->orWhereLike('nama', "%{$search}%");
            //         });
            //     })
            //     ->when(empty($department) || (int) $department !== 23, function ($data) {
            //         $data->whereHas('pegawai', function ($d) {
            //             $d->where('id_department', '!=', 23);
            //         });
            //     })
            //     ->when(!empty($department), function ($data) use ($department) {
            //         $data->whereHas('pegawai', function ($d) use ($department) {
            //             $d->where('id_department', $department);
            //         });
            //     })
            //     ->when(!empty($shift), function ($data) use ($shift) {
            //         $data->whereHas('pegawai', function ($d) use ($shift) {
            //             $d->where('id_shift', $shift);
            //         });
            //     })
            //     ->when(!empty($korlap), function ($data) use ($korlap) {
            //         $data->whereHas('pegawai', function ($d) use ($korlap) {
            //             $d->where('id_korlap', $korlap);
            //         });
            //     })
            //     ->when(!empty($jabatan), function ($data) use ($jabatan) {
            //         $data->whereHas('pegawai', function ($d) use ($jabatan) {
            //             $d->where('id_penugasan', $jabatan);
            //         });
            //     })
            //     ->orderBy('nama');

            $kehadiran = KehadiranDraft::with([
                'pegawai:id,old_id,id_department,id_penugasan,id_shift,id_korlap,badgenumber,nama',
                'pegawai.department',
                'pegawai.jabatan',
                'pegawai.shift'
            ])
                ->select('id', 'old_id', 'pegawai_id', 'check_time', 'check_type', 'bukti_dukung', 'status', 'created_at')
                ->when(Auth::user()->role === 'operator', function ($data) {
                    $data->whereHas('pegawai', function ($d) {
                        $d->where('id_department', Auth::user()->id_department);
                    });
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

            if ($exists) {
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
                'status'          => 'pending'
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

    public function patch(Request $request, $id)
    {
        $data = KehadiranDraft::with('pegawai')->findOrFail($id);
        // dd($request->all());
        $payload = $request->validate([
            // 'pegawai_id'   => 'required|integer|exists:pegawai,old_id',
            // 'check_type'   => 'required|in:0,1',
            // 'tanggal'      => 'required|date',
            // 'jam'          => 'required|date_format:H:i',
            // 'keterangan'   => 'nullable|string',
            // 'bukti_dukung' => 'required|image|mimes:jpg,jpeg,png,webp|max:1024',
            'status'       => 'required|in:approve,reject'
        ]);

        // $checkTime = Carbon::createFromFormat(
        //     'Y-m-d H:i',
        //     $payload['tanggal'] . ' ' . $payload['jam']
        // );

        try {
            // $pegawai = Pegawai::with('department', 'jabatan', 'shift')->where('old_id', $payload['pegawai_id'])->first();
            // $exists = Kehadiran::where('pegawai_id', $payload['pegawai_id'])
            // ->whereDate('check_time', $checkTime->toDateString())
            //     ->where('check_type', $payload['check_type'])
            //     ->exists();

            // if ($exists) {
            //     throw ValidationException::withMessages([
            //         'pegawai_id' => 'Data kehadiran dengan tanggal dan tipe ini sudah ada.'
            //     ]);
            // }

            // $path = $data['bukti_dukung']
            //     ->store('kehadiran/bukti_dukung', 'local');

            $data->update(['status' => $payload['status']]);

            if ($payload['status'] === 'approve') {
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
            }

            return response()->json([
                'message' => 'Data kehadiran berhasil update.',
                'status' => $payload['status']
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }
}
