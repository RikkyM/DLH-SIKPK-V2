<?php

namespace App\Http\Controllers\Api\Jabatan;

use App\Http\Controllers\Controller;
use App\Http\Requests\PenugasanRequest;
use App\Models\Jabatan;
use App\Models\PegawaiAsn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JabatanController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search');

            $datas = Jabatan::when($search, function ($data) use ($search) {
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

    public function store(PenugasanRequest $request)
    {
        $payload = $request->validated();

        DB::beginTransaction();
        try {

        Jabatan::create($payload);

        DB::commit();

        return response()->json([
            'status' => true,
            'message' => 'Berhasil menambahkan data penugasan.'
        ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            report($e);

            return response()->json([
                'status' => false,
                'message' => 'Gagal menambah data penugasan.'
            ], 400);
        }
    }

    public function update(PenugasanRequest $request, $id)
    {
        $jabatan = Jabatan::findOrFail($id);

        $payload = $request->validated();

        DB::beginTransaction();
        try {
            $jabatan->update($payload);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);

            return response()->json([
                'success' 
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
