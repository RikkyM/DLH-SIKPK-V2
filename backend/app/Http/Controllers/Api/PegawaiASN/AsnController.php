<?php

namespace App\Http\Controllers\Api\PegawaiASN;

use App\Http\Controllers\Controller;
use App\Models\PegawaiAsn;
use Illuminate\Http\Request;

class AsnController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search');

            $datas = PegawaiAsn::when($search, fn($data) => $data->where('nama', 'like', "%{$search}%"))
                ->paginate($perPage);

            return response()->json($datas);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pegawai asn.'
            ]);
        }
    }
}
