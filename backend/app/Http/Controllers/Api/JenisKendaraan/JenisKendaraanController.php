<?php

namespace App\Http\Controllers\Api\JenisKendaraan;

use App\Http\Controllers\Controller;
use App\Models\JenisKendaraan;
use Illuminate\Http\Request;

class JenisKendaraanController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search');

            $datas = JenisKendaraan::select('id', 'nama')
                ->when($search, function ($data) use ($search) {
                    $data->where('nama', 'like', "%{$search}%");
                })->paginate($perPage);

            return response()->json($datas);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data jenis kendaraan.',
            ]);
        }
    }

    public function store(Request $request)
    {
        //
    }

    public function update(Request $request)
    {
        //
    }

    public function delete(Request $request)
    {
        //
    }
}
