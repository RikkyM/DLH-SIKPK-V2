<?php

namespace App\Http\Controllers\Api\ShiftKerja;

use App\Http\Controllers\Controller;
use App\Models\ShiftKerja;
use Illuminate\Http\Request;

class ShiftKerjaController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search');

            $datas = ShiftKerja::select('id', 'jadwal', 'jam_masuk', 'jam_keluar')
                ->when($search, function ($data) use ($search) {
                    $data->where('jadwal', 'like', "%{$search}%");
                })->paginate($perPage);

            return response()->json($datas);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data shift kerja.'
            ]);
        }
    }
}
