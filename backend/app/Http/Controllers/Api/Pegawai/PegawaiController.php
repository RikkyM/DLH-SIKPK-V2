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
        // dd(Pegawai::with('department')->whereRelation('department', 'DeptName', 'sekretariat'));
        try {
            $perPage    = $request->input('per_page', 10);
            $search     = $request->input('search');
            $department = $request->input('department');

            $startDate = Carbon::today()->subDays(6)->toDateString();
            $endDate   = Carbon::today()->toDateString();

            $datas = Pegawai::with([
                'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
                'kehadirans',
                'shift',
                // 'kehadirans' => function ($q) use ($startDate, $endDate) {
                //     $q->whereBetween('check_time', [$startDate, $endDate])
                //         ->orderBy('check_time');
                // }
            ])
                ->select('id', 'old_id', 'id_department', 'badgenumber', 'nama', 'jenis_kelamin', 'alamat', 'kecamatan', 'kelurahan', 'agama')
                ->where(function ($data) {
                    $data->where('nama', '!=', '')
                        // nama admin jangan di tampilkan
                        ->whereNotNull('nama')
                        ->where('nama', 'not like', '%admin%');
                })
                ->when(empty($department) || (int) $department !== 23, function ($data) {
                    $data->where('id_department', '!=', 23);
                })
                ->when(!empty($department), function ($data) use ($department) {
                    $data->where('id_department', $department);
                })
                ->when($search, function ($data) use ($search) {
                    $data->where(function ($d) use ($search) {
                        $d->where('nama', 'like', "%{$search}%")
                            ->orWhere('badgenumber', 'like', "%{$search}%");
                    });
                })
                // ->where('nama', 'DEDI WIJAYA')
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
}
