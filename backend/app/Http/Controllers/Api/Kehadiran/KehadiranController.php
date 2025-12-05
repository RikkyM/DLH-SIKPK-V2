<?php

namespace App\Http\Controllers\Api\Kehadiran;

use App\Http\Controllers\Controller;
use App\Models\ChecktimeSikpk;
use App\Models\Kehadiran;
use App\Models\Pegawai;
use Illuminate\Http\Request;

class KehadiranController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage    = $request->input('per_page', 50);
            $search     = $request->input('search');
            $department = $request->input('department');
            $jabatan    = $request->input('jabatan');
            $shift    = $request->input('shift');

            $tanggal = $request->input('tanggal');
            $fromDate   = $request->input('from_date');
            $toDate     = $request->input('to_date');

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
                ->when($fromDate && $toDate, function ($data) use ($fromDate, $toDate) {
                    $data->whereBetween('check_time', [$fromDate . ' 00:00:00', $toDate . ' 00:00:00']);
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

    public function finger(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 50);
            $search = $request->input('search');
            $department = $request->input('department');
            $jabatan    = $request->input('jabatan');
            $shift      = $request->input('shift');
            $tanggal = $request->filled('tanggal')
                ? $request->input('tanggal')
                : now()->toDateString();

            $datas = ChecktimeSikpk::with([
                'pegawai:id,old_id,id_department,id_penugasan,id_shift,id_korlap,badgenumber,nama',
                'pegawai.department',
                'pegawai.jabatan',
                'pegawai.shift'
            ])
                ->select('id', 'old_id', 'userid', 'checktime', 'checktype')
                ->whereHas('pegawai', function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama');
                })
                ->whereDate('checktime', $tanggal)
                // ->when($tanggal, function ($data) use ($tanggal) {
                //     $data->whereDate('checktime', $tanggal);
                // })
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
                        $d->where('nama', 'like', "%{$search}%")
                            ->orWhere('badgenumber', 'like', "%{$search}%");
                    });
                })
                ->orderBy('checktime', 'desc');

            return response()->json($datas->paginate($perPage));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data finger.',
                'e' => $e
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
