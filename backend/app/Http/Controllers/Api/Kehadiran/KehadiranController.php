<?php

namespace App\Http\Controllers\Api\Kehadiran;

use App\Http\Controllers\Controller;
use App\Models\ChecktimeSikpk;
use App\Models\Kehadiran;
use App\Models\Pegawai;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class KehadiranController extends Controller
{

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
            $shift    = $request->input('shift');
            $korlap    = $request->input('korlap');
            $tanggal = $request->filled('tanggal')
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

            return response()->json($datas->paginate($perPage));
        } catch (\Exception $e) {
            report($e);
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

            if (!$fromDate && !$toDate) {
                $to     = Carbon::today();
                $from   = (clone $to)->subDays(6);
            } else {
                if ($fromDate && $toDate) {
                    $from = Carbon::parse($fromDate);
                    $to   = Carbon::parse($toDate);
                } elseif ($fromDate && !$toDate) {
                    $from = Carbon::parse($fromDate);
                    $to   = (clone $from);
                } elseif (!$fromDate && $toDate) {
                    $to   = Carbon::parse($toDate);
                    $from = (clone $to);
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
            $result->appends([
                'from_date' => $from->toDateString(),
                'to_date'   => $to->toDateString(),
            ]);

            return response()->json($result);
        } catch (\Exception $e) {
            report($e);
            dd($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data rekap tanggal hadir'
            ], 500);
        }
    }
}
