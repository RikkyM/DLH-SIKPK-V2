<?php

namespace App\Http\Controllers\Api\Kendaraan;

use App\Http\Controllers\Controller;
use App\Models\Kendaraan;
use Illuminate\Http\Request;

class KendaraanController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 50);
            $search = $request->input('search');
            $department = $request->input('department');
            $jenisKendaraan = $request->input('jenis_kendaraan');

            $datas = Kendaraan::with([
                'department' => fn($q) => $q->where('DeptName', '!=', 'Our Company'),
                'jenisKendaraan'
            ])
                ->when($search, function ($data) use ($search) {
                    $data->where('no_tnkb', 'like', "%{$search}%")
                        ->orWhere('merk', 'like', "%{$search}%");
                })
                ->when($department, function ($data) use ($department) {
                    $data->where('id_department', $department);
                })
                ->when($jenisKendaraan, function ($data) use ($jenisKendaraan) {
                    $data->where('id_jenis_kendaraan', $jenisKendaraan);
                })
                ->paginate($perPage);
            // dd($datas);

            return response()->json($datas);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kendaraan.'
            ]);
        }
    }
}
