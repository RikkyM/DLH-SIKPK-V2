<?php

namespace App\Http\Controllers\Api\Jabatan;

use App\Http\Controllers\Controller;
use App\Http\Requests\PenugasanRequest;
use App\Models\Jabatan;
use App\Models\PegawaiAsn;
use Illuminate\Http\Request;

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

    public function update(PenugasanRequest $request, $id)
    {
        $jabatan = Jabatan::findOrFail($id);

        $payload = $request->validated();

        // $pegawai = ['kpa', 'bp', 'bpp', 'pptk'];

        // foreach ($pegawai as $employee) {
        //     if (!empty($payload[$employee])) {
        //         $jabatan->$employee = PegawaiAsn::whereKey($payload[$employee])->value('nama');
        //     }
        // }

        $jabatan->update($payload);
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
