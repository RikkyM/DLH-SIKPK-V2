<?php

namespace App\Http\Controllers\Api\PegawaiASN;

use App\Http\Controllers\Controller;
use App\Http\Requests\AsnRequest;
use App\Models\Departments;
use App\Models\PegawaiAsn;
use Illuminate\Http\Request;

class AsnController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search');

            $datas = PegawaiAsn::when($search, function($data) use ($search) {
                $data->where('nama', 'like', "%{$search}%")
                    ->orWhere('jabatan', 'like', "%{$search}%");
            })
                ->orderBy('created_at', 'desc')
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

    public function store(AsnRequest $request)
    {
        $payload = $request->validated();

        $payload['unit_kerja'] = Departments::whereKey($payload['id_department'])->value('DeptName');

        PegawaiAsn::create($payload);

        return response()->json([
            'success' => true,
            'messages' => 'Berhasil menambahkan data.'
        ], 201);
    }

    public function update(AsnRequest $request, $id)
    {
        $data = PegawaiAsn::findOrFail($id);

        $payload = $request->validated();

        if (!empty($payload['id_department'])) {
            $payload['unit_kerja'] = Departments::whereKey($payload['id_department'])->value('DeptName');
        }

        $data->update($payload);

        return response()->json([
            'success' => true,
            'messages' => 'Berhasil mengupdate data.'
        ], 200);
    }

    public function filterAsn(Request $request)
    {
        try {
            $search = $request->input('search');

            $datas = PegawaiAsn::
            // where('role', 'OPERATOR')
            //     ->
                when($search, fn($data) => $data->where('nama', 'like', "{$search}%"))
                ->orderBy('nama')
                ->get();

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
