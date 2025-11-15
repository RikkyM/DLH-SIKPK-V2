<?php

namespace App\Http\Controllers\Api\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use Illuminate\Http\Request;

class PegawaiController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);

        if ($perPage == -1) {
            $pegawai = Pegawai::with('department')
                ->select('id', 'department_id', 'badgenumber', 'nama', 'jenis_kelamin', 'alamat', 'kecamatan', 'kelurahan', 'agama')
                ->orderBy('id', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $pegawai
                ]
            ]);
        }

        $pegawai = Pegawai::with('department')
            ->select('id', 'department_id', 'badgenumber', 'nama', 'jenis_kelamin', 'alamat', 'kecamatan', 'kelurahan', 'agama')
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $pegawai
        ]);
    }
}
