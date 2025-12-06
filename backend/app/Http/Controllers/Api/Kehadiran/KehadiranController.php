<?php

namespace App\Http\Controllers\Api\Kehadiran;

use App\Http\Controllers\Controller;
use App\Models\ChecktimeSikpk;
use App\Models\Kehadiran;
use App\Models\Pegawai;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KehadiranController extends Controller
{
    // public function index(Request $request)
    // {
    //     try {
    //         $perPage    = $request->input('per_page', 50);
    //         $search     = $request->input('search');
    //         $department = $request->input('department', 12);
    //         $jabatan    = $request->input('jabatan');
    //         $shift      = $request->input('shift');

    //         $tanggal  = $request->input('tanggal');
    //         $fromDate = $request->input('from_date', Carbon::create(2025, 11, 21)->format('Y-m-d'));
    //         $toDate   = $request->input('to_date', Carbon::create(2025, 11, 25)->format('Y-m-d'));

    //         // Ambil data dengan pagination yang lebih besar untuk antisipasi grouping
    //         $datas = Kehadiran::with([
    //             'pegawai:id,old_id,id_department,id_penugasan,id_shift,id_korlap,badgenumber,nama',
    //             'pegawai.department',
    //             'pegawai.jabatan',
    //             'pegawai.shift'
    //         ])
    //             ->select('id', 'old_id', 'pegawai_id', 'check_time', 'check_type')
    //             ->where(function ($data) {
    //                 $data->where('nama', '!=', '')
    //                     ->whereNotNull('nama');
    //             })
    //             ->when($tanggal, function ($data) use ($tanggal) {
    //                 $data->whereDate('check_time', $tanggal);
    //             })
    //             ->when($fromDate && $toDate, function ($data) use ($fromDate, $toDate) {
    //                 $data->whereBetween('check_time', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59']);
    //             })
    //             ->when(!empty($department), function ($data) use ($department) {
    //                 $data->whereHas('pegawai', function ($d) use ($department) {
    //                     $d->where('id_department', $department);
    //                 });
    //             })
    //             ->when(!empty($jabatan), function ($data) use ($jabatan) {
    //                 $data->whereHas('pegawai', function ($d) use ($jabatan) {
    //                     $d->where('id_penugasan', $jabatan);
    //                 });
    //             })
    //             ->when(!empty($shift), function ($data) use ($shift) {
    //                 $data->whereHas('pegawai', function ($d) use ($shift) {
    //                     $d->where('id_shift', $shift);
    //                 });
    //             })
    //             ->when($search, function ($data) use ($search) {
    //                 $data->whereHas('pegawai', function ($d) use ($search) {
    //                     $d->where('badgenumber', 'like', "%{$search}%")
    //                         ->orWhere('nama', 'like', "%{$search}%");
    //                 });
    //             })
    //             ->orderBy('check_time', 'desc')
    //             ->paginate($perPage * 2);

    //         $grouped = $datas->getCollection()
    //             ->groupBy(function ($item) {
    //                 return $item->pegawai_id . '_' . Carbon::parse($item->check_time)->format('Y-m-d');
    //             })
    //             ->map(function ($group) {
    //                 $checkIn = $group->firstWhere('check_type', 0);
    //                 $checkOut = $group->firstWhere('check_type', 1);

    //                 $baseData = $checkIn ?? $checkOut;
    //                 $checkTime = Carbon::parse($baseData->check_time);

    //                 $jamTelat = 0;
    //                 $pulangCepat = 0;
    //                 $jamMasuk = '-';
    //                 $jamPulang = '-';

    //                 $shiftJadwal = $baseData->pegawai?->shift;

    //                 if ($shiftJadwal) {
    //                     $jam_masuk_shift = substr($shiftJadwal?->jam_masuk, 0, 5);
    //                     $jam_pulang_shift = substr($shiftJadwal?->jam_keluar, 0, 5);

    //                     // Proses check-in
    //                     if ($checkIn) {
    //                         $checkInTime = Carbon::parse($checkIn->check_time);
    //                         $jamMasuk = $checkInTime->format('H:i');

    //                         $shiftStart = Carbon::parse($checkInTime->format('Y-m-d') . ' ' . $jam_masuk_shift);

    //                         if ($checkInTime->greaterThan($shiftStart)) {
    //                             $jamTelat = abs($checkInTime->diffInMinutes($shiftStart));
    //                         }
    //                     }

    //                     // Proses check-out
    //                     if ($checkOut) {
    //                         $checkOutTime = Carbon::parse($checkOut->check_time);
    //                         $jamPulang = $checkOutTime->format('H:i');

    //                         $shiftEnd = Carbon::parse($checkOutTime->format('Y-m-d') . ' ' . $jam_pulang_shift);

    //                         if ($checkOutTime->lessThan($shiftEnd)) {
    //                             $pulangCepat = $checkOutTime->diffInMinutes($shiftEnd);
    //                         }
    //                     }
    //                 }

    //                 // Format jam telat
    //                 $formatTelat = '-';
    //                 if ($jamTelat > 0) {
    //                     $jam = floor($jamTelat / 60);
    //                     $menit = $jamTelat % 60;
    //                     $formatTelat = sprintf('%02d:%02d', $jam, $menit);
    //                 }

    //                 // Format pulang cepat
    //                 $formatPulangCepat = '-';
    //                 if ($pulangCepat > 0) {
    //                     $jam = floor($pulangCepat / 60);
    //                     $menit = ($pulangCepat + 1) % 60;
    //                     $formatPulangCepat = sprintf('%02d:%02d', $jam, $menit);
    //                 }

    //                 return [
    //                     'id' => $baseData->id,
    //                     'nik' => $baseData->pegawai->badgenumber,
    //                     'nama' => $baseData->pegawai->nama,
    //                     'department' => $baseData->pegawai->department->DeptName ?? '-',
    //                     'jabatan' => $baseData->pegawai->jabatan?->nama ?? "-",
    //                     'shift' => $baseData->pegawai?->shift ?? "-",
    //                     'tanggal' => $checkTime->format('d-m-Y'),
    //                     'jam_masuk' => $jamMasuk,
    //                     'jam_pulang' => $jamPulang,
    //                     'jam_telat' => $formatTelat,
    //                     'pulang_cepat' => $formatPulangCepat,
    //                     'upah' => $baseData->pegawai?->jabatan?->gaji ?? 0
    //                 ];
    //             })
    //             ->values()
    //             ->take($perPage); // Ambil sejumlah perPage setelah grouping

    //         // Set collection yang sudah di-group kembali ke paginator
    //         $datas->setCollection($grouped);

    //         dd($datas);

    //         return response()->json($datas);
    //     } catch (\Exception $e) {
    //         report($e);
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Gagal mengambil data kehadiran.',
    //         ]);
    //     }
    // }

    public function index(Request $request)
    {
        try {
            $perPage    = $request->input('per_page', 50);
            $search     = $request->input('search');
            $department = $request->input('department', 12);
            $jabatan    = $request->input('jabatan');
            $shift      = $request->input('shift');

            $tanggal  = $request->input('tanggal');
            $fromDate = $request->input('from_date', Carbon::create(2025, 11, 21)->format('Y-m-d'));
            $toDate   = $request->input('to_date', Carbon::create(2025, 11, 25)->format('Y-m-d'));

            // $datas = Kehadiran::with([
            //     'pegawai:id,old_id,id_department,id_penugasan,id_shift,id_korlap,badgenumber,nama',
            //     'pegawai.department',
            //     'pegawai.jabatan',
            //     'pegawai.shift'
            // ])
            //     ->select(
            //         'id',
            //         'old_id',
            //         'pegawai_id',
            //         'check_time',
            //         'check_type'
            //     )
            //     ->where(function ($data) {
            //         $data->where('nama', '!=', '')
            //             ->whereNotNull('nama');
            //     })
            //     ->when($tanggal, function ($data) use ($tanggal) {
            //         $data->whereDate('check_time', $tanggal);
            //     })
            //     ->when($fromDate && $toDate, function ($data) use ($fromDate, $toDate) {
            //         $data->whereBetween('check_time', [$fromDate . ' 00:00:00', $toDate . ' 23:59:59']);
            //     })
            //     ->when(!empty($department), function ($data) use ($department) {
            //         $data->whereHas('pegawai', function ($d) use ($department) {
            //             $d->where('id_department', $department);
            //         });
            //     })
            //     ->when(!empty($jabatan), function ($data) use ($jabatan) {
            //         $data->whereHas('pegawai', function ($d) use ($jabatan) {
            //             $d->where('id_penugasan', $jabatan);
            //         });
            //     })
            //     ->when(!empty($shift), function ($data) use ($shift) {
            //         $data->whereHas('pegawai', function ($d) use ($shift) {
            //             $d->where('id_shift', $shift);
            //         });
            //     })
            //     ->when($search, function ($data) use ($search) {
            //         $data->whereHas('pegawai', function ($d) use ($search) {
            //             $d->where('badgenumber', 'like', "%{$search}%")
            //                 ->orWhere('nama', 'like', "%{$search}%");
            //         });
            //     })
            // ->orderBy('check_time', 'desc')
            // ->paginate($perPage * 2); // Kalikan 2 untuk antisipasi check-in & check-out

            // $grouped = $datas->getCollection()
            //     ->groupBy(function ($item) {
            //         return $item->pegawai_id . '_' . Carbon::parse($item->check_time)->format('Y-m-d');
            //     })
            //     ->map(function ($group) {
            //         $checkIn = $group->firstWhere('check_type', 0);
            //         $checkOut = $group->firstWhere('check_type', 1);

            //         // Ambil data dari check-in atau check-out (yang ada)
            //         $baseData = $checkIn ?? $checkOut;
            //         $checkTime = Carbon::parse($baseData->check_time);

            //         $jamTelat = 0;
            //         $pulangCepat = 0;
            //         $jamMasuk = '-';
            //         $jamPulang = '-';

            //         $shiftJadwal = $baseData->pegawai?->shift;

            //         if ($shiftJadwal) {
            //             $jam_masuk_shift = substr($shiftJadwal?->jam_masuk, 0, 5);
            //             $jam_pulang_shift = substr($shiftJadwal?->jam_keluar, 0, 5);

            //             // Proses check-in
            //             if ($checkIn) {
            //                 $checkInTime = Carbon::parse($checkIn->check_time);
            //                 $jamMasuk = $checkInTime->format('H:i');

            //                 $shiftStart = Carbon::parse($checkInTime->format('Y-m-d') . ' ' . $jam_masuk_shift);

            //                 if ($checkInTime->greaterThan($shiftStart)) {
            //                     $jamTelat = abs($checkInTime->diffInMinutes($shiftStart));
            //                 }
            //             }

            //             // Proses check-out
            //             if ($checkOut) {
            //                 $checkOutTime = Carbon::parse($checkOut->check_time);
            //                 $jamPulang = $checkOutTime->format('H:i');

            //                 $shiftEnd = Carbon::parse($checkOutTime->format('Y-m-d') . ' ' . $jam_pulang_shift);

            //                 if ($checkOutTime->lessThan($shiftEnd)) {
            //                     $pulangCepat = $checkOutTime->diffInMinutes($shiftEnd);
            //                 }
            //             }
            //         }

            //         // Format jam telat
            //         $formatTelat = '-';
            //         if ($jamTelat > 0) {
            //             $jam = floor($jamTelat / 60);
            //             $menit = $jamTelat % 60;
            //             $formatTelat = sprintf('%02d:%02d', $jam, $menit);
            //         }

            //         // Format pulang cepat
            //         $formatPulangCepat = '-';
            //         if ($pulangCepat > 0) {
            //             $jam = floor($pulangCepat / 60);
            //             $menit = ($pulangCepat + 1) % 60;
            //             $formatPulangCepat = sprintf('%02d:%02d', $jam, $menit);
            //         }

            //         return [
            //             'id' => $baseData->id,
            //             'nik' => $baseData->pegawai->badgenumber,
            //             'nama' => $baseData->pegawai->nama,
            //             'department' => $baseData->pegawai->department->DeptName ?? '-',
            //             'jabatan' => $baseData->pegawai->jabatan?->nama ?? "-",
            //             'shift' => $baseData->pegawai?->shift ?? "-",
            //             'tanggal' => $checkTime->format('d-m-Y'),
            //             'jam_masuk' => $jamMasuk,
            //             'jam_pulang' => $jamPulang,
            //             'jam_telat' => $formatTelat,
            //             'pulang_cepat' => $formatPulangCepat,
            //             'upah' => $baseData->pegawai?->jabatan?->gaji ?? 0
            //         ];
            //     })
            //     ->values()
            //     ->take($perPage); // Ambil sejumlah perPage setelah grouping

            // $datas->setCollection($grouped);

            $datas = Pegawai::with('shift', 'department', 'jabatan')
                ->join('kehadiran', 'pegawai.old_id', '=', 'kehadiran.pegawai_id')
                ->select(
                    'pegawai.badgenumber',
                    'pegawai.nama',
                    'pegawai.id_department',
                    'pegawai.id_penugasan',
                    'pegawai.id_shift',
                    DB::raw('DATE(kehadiran.check_time) as tanggal'),
                    DB::raw('TIME(MIN(CASE WHEN kehadiran.check_type = 0 THEN kehadiran.check_time END)) as jam_masuk'),
                    DB::raw('TIME(MAX(CASE WHEN kehadiran.check_type = 1 THEN kehadiran.check_time END)) as jam_pulang')
                )
                ->whereNotNull('pegawai.nama')
                ->where('pegawai.nama', '!=', '')
                ->when($tanggal, fn($q) => $q->whereDate('kehadiran.check_time', $tanggal))
                ->when($fromDate && $toDate, fn($q) => $q->whereBetween('kehadiran.check_time', [
                    $fromDate . ' 00:00:00',
                    $toDate . ' 23:59:59'
                ]))
                ->when($department, fn($q) => $q->where('pegawai.id_department', $department))
                ->when($jabatan, fn($q) => $q->where('pegawai.id_penugasan', $jabatan))
                ->when($shift, fn($q) => $q->where('pegawai.id_shift', $shift))
                ->when($search, fn($q) => $q->where(function ($query) use ($search) {
                    $query->where('pegawai.badgenumber', 'like', "%{$search}%")
                        ->orWhere('pegawai.nama', 'like', "%{$search}%");
                }))
                ->groupBy(
                    'pegawai.badgenumber',
                    'pegawai.nama',
                    'pegawai.id_department',
                    'pegawai.id_penugasan',
                    'pegawai.id_shift',
                    DB::raw('DATE(kehadiran.check_time)')
                )
                ->orderByDesc('tanggal')
                ->paginate($perPage);

            // $datas = Kehadiran::with([
            //     'pegawai.shift',
            //     'pegawai.department',
            //     'pegawai.jabatan',
            // ])
            // ->select(
            //     'pegawai_id',
            //     DB::raw('DATE(check_time) as tanggal'),
            //     // contoh: gabungkan jam_masuk & jam_pulang di sini
            //     DB::raw('TIME(MIN(CASE WHEN check_type = 0 THEN check_time END) as jam_masuk)'),
            //     DB::raw('MAX(CASE WHEN check_type = 1 THEN check_time END) as jam_pulang')
            // )
            // ->groupBy('pegawai_id', DB::raw('DATE(check_time)'))
            // ->orderBy('pegawai_id')
            // ->orderBy('tanggal')
            // ->paginate($perPage);

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
            $shift    = $request->input('shift');

            $tanggal = $request->filled('tanggal')
                ? $request->input('tanggal')
                : now()->toDateString();

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
                ->when($tanggal, function ($data) use ($tanggal) {
                    $data->whereDate('check_time', $tanggal);
                })
                ->when(!empty($department), function ($data) use ($department) {
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
            $shift    = $request->input('shift');
            $tanggal = $request->filled('tanggal')
                ? $request->input('tanggal')
                : now()->toDateString();

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
                ->orderBy('nama', 'asc');

            return response()->json($datas->paginate($perPage));

            // $datas = Kehadiran::with([
            //     'pegawai:id,old_id,id_department,id_penugasan,id_shift,id_korlap,badgenumber,nama',
            //     'pegawai.department',
            //     'pegawai.jabatan',
            //     'pegawai.shift'
            // ])
            //     ->select('id', 'old_id', 'pegawai_id', 'check_time', 'check_type')
            //     ->where(function ($data) {
            //         $data->where('nama', '!=', '')
            //         ->whereNotNull('nama');
            //     })
            //     ->whereDate('check_time', $tanggal)
            //     ->when(!empty($department), function ($data) use ($department) {
            //         $data->whereHas('pegawai', function ($d) use ($department) {
            //             $d->where('id_department', $department);
            //         });
            //     })
            //     ->when(!empty($jabatan), function ($data) use ($jabatan) {
            //         $data->whereHas('pegawai', function ($d) use ($jabatan) {
            //             $d->where('id_penugasan', $jabatan);
            //         });
            //     })
            //     ->when(!empty($shift), function ($data) use ($shift) {
            //         $data->whereHas('pegawai', function ($d) use ($shift) {
            //             $d->where('id_shift', $shift);
            //         });
            //     })
            //     ->when($search, function ($data) use ($search) {
            //         $data->whereHas('pegawai', function ($d) use ($search) {
            //             $d->where('badgenumber', 'like', "%{$search}%")
            //             ->orWhere('nama', 'like', "%{$search}%");
            //         });
            //     })
            //     ->orderBy('nama', 'asc');
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data rekap kehadiran.',
            ]);
        }
    }
}
