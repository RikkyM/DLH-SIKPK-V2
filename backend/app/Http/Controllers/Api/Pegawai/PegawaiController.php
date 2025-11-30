<?php

namespace App\Http\Controllers\Api\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class PegawaiController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage    = $request->input('per_page', 10);
            $search     = $request->input('search');
            $department = $request->input('department');
            $jabatan    = $request->input('jabatan');
            $shift      = $request->input('shift');

            // $startDate = Carbon::today()->subDays(6)->toDateString();
            // $endDate   = Carbon::today()->toDateString();

            $datas = Pegawai::with([
                'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
                'kehadirans',
                'shift',
                'jabatan'
            ])
                ->select('id', 'old_id', 'id_penugasan', 'id_shift', 'id_department', 'badgenumber', 'nama', 'jenis_kelamin', 'alamat', 'kecamatan', 'kelurahan', 'agama')
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama')
                        ->where('nama', 'not like', '%admin%');
                })
                ->when(empty($department) || (int) $department !== 23, function ($data) {
                    $data->where('id_department', '!=', 23);
                })
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

            if ((int) $perPage == -1) {
                return response()->json([
                    'success' => true,
                    'data' => $datas->get()
                ]);
            }

            return response()->json($datas->paginate($perPage));
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Gagal mengambil data pegawai'
            ]);
        }
    }

    public function gaji(Request $request)
    {
        try {
            $search = $request->input('search');
            $perPage = $request->input('per_page', 50);
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');
            $department = $request->input('department');

            $jumlah_hari = 0;

            if ($fromDate && $toDate) {
                $jumlah_hari = Carbon::parse($fromDate)
                    ->diffInDays(Carbon::parse($toDate)) + 1;
            }

            $pegawai = Pegawai::with([
                'kehadirans' => fn($q) => $q->whereBetween('check_time', [$fromDate, $toDate],),
                'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
            ])
                ->select('id', 'old_id', 'id_department', 'badgenumber', 'nama')
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        ->whereNotNull('nama')
                        ->where('nama', 'not like', '%admin%')
                        ->where('id_department', '!=', 23);
                })
                ->when($search, function ($data) use ($search) {
                    $data->where('badgenumber', 'like', "%{$search}%")
                        ->orWhere('nama', 'like', "%{$search}%");
                })
                ->when(empty($department) || (int) $department !== 23, function ($data) {
                    $data->where('id_department', '!=', 23);
                })
                ->when(!empty($department), function ($data) use ($department) {
                    $data->where('id_department', $department);
                })
                ->orderBy('nama')
                ->paginate($perPage);

            $pegawai->getCollection()->transform(function ($data) use ($jumlah_hari) {
                return [
                    'id'            => $data->id,
                    'badgenumber'   => $data->badgenumber,
                    'nama'          => $data->nama,
                    'department'    => $data->department?->DeptName ?: "-",
                    'jumlah_hari'   => $jumlah_hari,
                    'jumlah_masuk'  => $data->kehadirans->count() / 2
                ];
            });

            return response()->json($pegawai);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data gaji',
                'e' => $e
            ]);
        }
    }
}
