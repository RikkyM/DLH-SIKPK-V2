<?php

namespace App\Http\Controllers\Api\Jabatan;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;
use Illuminate\Http\Request;

class JabatanController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search');

            $datas = Jabatan::select('id', 'nama', 'gaji')
                ->when($search, function ($data) use ($search) {
                    $data->where('nama', 'like', "%{$search}%");
                })
                ->paginate($perPage);

            return response()->json($datas);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data jabatan.'
            ]);
        }
    }

    public function penugasan(Request $request)
    {
        try {
            $penugasan = Jabatan::get();

            return response()->json([
                'success' => true,
                'data'    => $penugasan
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendapatkan data penugasan.'
            ]);
        }
    }
}
