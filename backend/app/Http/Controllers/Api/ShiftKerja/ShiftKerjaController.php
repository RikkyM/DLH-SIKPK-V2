<?php

namespace App\Http\Controllers\Api\ShiftKerja;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShiftKerjaRequest;
use App\Models\ShiftKerja;
use Illuminate\Http\Request;

class ShiftKerjaController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search');

            $datas = ShiftKerja::select('id', 'jadwal', 'jam_masuk', 'jam_keluar', 'telat', 'pulang_cepat')
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

    public function add(ShiftKerjaRequest $request)
    {
        $payload = $request->validated();

        if (isset($payload['telat'])) {
            $payload['telat'] = array_values(array_filter($payload['telat'], fn($v) => $v !== null));
        }

        if (isset($payload['pulang_cepat'])) {
            $payload['pulang_cepat'] = array_values(array_filter($payload['pulang_cepat'], fn($v) => $v !== null));
        }

        ShiftKerja::create($payload);

        return response()->json([
            'message' => 'Berhasil menambahkan kategori kerja.'
        ], 200);
    }

    public function edit(ShiftKerjaRequest $request, $id)
    {
        $shift = ShiftKerja::findOrFail($id);

        $payload = $request->validated();

        if (isset($payload['telat'])) {
            $payload['telat'] = array_values(array_filter($payload['telat'], fn($v) => $v !== null));
        }

        if (isset($payload['pulang_cepat'])) {
            $payload['pulang_cepat'] = array_values(array_filter($payload['pulang_cepat'], fn($v) => $v !== null));
        }

        $shift->update($payload);

        return response()->json($payload);
    }

    public function kategoriKerja()
    {
        try {
            $kategoriKerja = ShiftKerja::get();

            return response()->json([
                'success' => true,
                'data'    => $kategoriKerja
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kategori kerja.'
            ]);
        }
    }
}
