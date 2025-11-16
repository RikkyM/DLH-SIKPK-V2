<?php

namespace App\Http\Controllers\Api\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class PegawaiController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);

            $datas = Pegawai::with('department')
                ->select('id', 'department_id', 'badgenumber', 'nama', 'jenis_kelamin', 'alamat', 'kecamatan', 'kelurahan', 'agama')
                ->orderBy('id', 'desc');

            if ($perPage == -1) {
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
                'message' => 'Gagal mengambil data pegawai'
            ]);
        }
    }
}
