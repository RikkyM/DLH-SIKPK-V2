<?php

namespace App\Http\Controllers\Api\Kehadiran;

use App\Http\Controllers\Controller;
use App\Models\Kehadiran;
use App\Models\Kehadiran_Iclock;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Benchmark;

class KehadiranController extends Controller
{
    public function index(Request $request)
    {
        $test = Kehadiran_Iclock::orderBy('checktime')
            ->get();

        try {
            $perPage    = $request->input('per_page', 10);
            $search     = $request->input('search');
            $fromDate   = $request->input('from_date');
            $toDate     = $request->input('to_date');

            $datas = Kehadiran::with(['pegawai:id,old_id,id_department,badgenumber,nama'])
                ->select('id', 'old_id', 'pegawai_id', 'check_time', 'check_type')
                ->when($search, function ($data) use ($search) {
                    $data->whereRelation('pegawai', 'nama', 'like', "%{$search}%");
                });

            return response()->json($datas->paginate($perPage));
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kehadiran.',
            ]);
        }
    }
}
